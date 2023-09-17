#!/bin/bash
DEFAULT_INSTANCE_NAME=$(hostname -f)
DEFAULT_INSTALL_DIR=/data
DEFAULT_UNPRIV_USER=hajkey

# Versions of software to install
DEFAULT_CADDY_VERSION=2.7.4
DEFAULT_NODE_VERSION=20.6.1
DEFAULT_PNPM_VERSION=8.7.5
DEFAULT_YARN_VERSION=1.22.19
DEFAULT_ASDF_VERSION=0.13.0
DEFAULT_SONIC_VERSION=1.4.3

INSTALL_DIR="${INSTALL_DIR:-${1:-$DEFAULT_INSTALL_DIR}}"
echo "Installing to ${INSTALL_DIR}"

# Perform system update
apt update
apt upgrade

# Install some basic tools
apt install -y \
  build-essential clang libclang-dev libc6-dev g++ llvm-dev \
  postgresql-client-common curl git pwgen

# Rust and cargo
if [[ ! -x /usr/bin/cargo ]]; then
	curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \
	| sh -s -- --profile default -y
	source $HOME/.cargo/env
fi

# Create install directory
mkdir -p "${INSTALL_DIR}/src"

# Generate config file
if [[ ! -f "${INSTALL_DIR}/.state" ]]; then
	echo "Generating config file"
	cat <<EOF > "${INSTALL_DIR}/.state"
INSTANCE_NAME=${INSTANCE_NAME:-$DEFAULT_INSTANCE_NAME}
INSTALL_DIR="${INSTALL_DIR:-$DEFAULT_INSTALL_DIR}"
UNPRIV_USER=${UNPRIV_USER:-$DEFAULT_UNPRIV_USER}

# Override software versions here:
#CADDY_VERSION=${CADDY_VERSION:-$DEFAULT_CADDY_VERSION}
#NODE_VERSION=${NODE_VERSION:-$DEFAULT_NODE_VERSION}
#PNPM_VERSION=${PNPM_VERSION:-$DEFAULT_PNPM_VERSION}
#YARN_VERSION=${YARN_VERSION:-$DEFAULT_YARN_VERSION}
#ASDF_VERSION=${ASDF_VERSION:-$DEFAULT_ASDF_VERSION}
#SONIC_VERSION=${SONIC_VERSION:-$DEFAULT_SONIC_VERSION}

HOST_DRAGONFLY=localhost:6378
PASS_DRAGONFLY=$(pwgen -c 23 1)

HOST_POSTGRES=localhost:5432
USER_POSTGRES=hajkey
PASS_POSTGRES=$(pwgen -c 23 1)
DB_POSTGRES=hajkey

HOST_SONIC=localhost:1491
PASS_SONIC=$(pwgen -c 23 1)

HOST_REDIS=localhost:6379
PASS_REDIS=$(pwgen -c 23 1)
EOF
	nano "${INSTALL_DIR}/.state"
else
	echo "Config file already exists"
fi

source "${INSTALL_DIR}/.state"

CADDY_VERSION=${CADDY_VERSION:-$DEFAULT_CADDY_VERSION}
NODE_VERSION=${NODE_VERSION:-$DEFAULT_NODE_VERSION}
PNPM_VERSION=${PNPM_VERSION:-$DEFAULT_PNPM_VERSION}
YARN_VERSION=${YARN_VERSION:-$DEFAULT_YARN_VERSION}
ASDF_VERSION=${ASDF_VERSION:-$DEFAULT_ASDF_VERSION}
SONIC_VERSION=${SONIC_VERSION:-$DEFAULT_SONIC_VERSION}

# Create unprivileged user
if id "$1" >/dev/null; then
	echo "User $1 already exists"
else
	echo "Creating user $1"
	adduser $UNPRIV_USER --system --group --shell /bin/bash
fi
chdir "${INSTALL_DIR}"

# Install Redis
if [[ $HOST_REDIS =~ ^localhost: ]]; then
	if [[ -f /etc/redis/redis.conf ]]; then
		echo "Redis already installed"
	else
		apt install -y redis-server
		echo include /etc/redis/custom.conf >> /etc/redis/redis.conf
		cat <<EOF > /etc/redis/custom.conf
bind 0.0.0.0 ::1
always-show-logo no
repl-diskless-sync yes
requirepass ${PASS_REDIS}
EOF
		systemctl enable --now redis-server
	fi
elif [[ ! -x /usr/bin/redis-cli ]]; then
	echo "Using remote Redis"
fi

# DragonflyDB for caching
if [[ $HOST_DRAGONFLY =~ ^localhost: ]]; then
	if [[ -f /etc/systemd/system/dragonfly.service ]]; then
		echo "DragonflyDB already installed"
	else
		apt install -y libicu66
		mkdir -p "${INSTALL_DIR}/dragonfly"
		cd "${INSTALL_DIR}/dragonfly"
		wget https://dragonflydb.gateway.scarf.sh/latest/dragonfly-x86_64.tar.gz
		tar xvzf dragonfly-x86_64.tar.gz
		ln -s ${INSTALL_DIR}/dragonfly/dragonfly-x86_64 /usr/local/bin/dragonfly

		wget http://archive.ubuntu.com/ubuntu/pool/main/i/icu/libicu66_66.1-2ubuntu2.1_amd64.deb
		dpkg -i libicu66_66.1-2ubuntu2.1_amd64.deb
		rm libicu66_66.1-2ubuntu2.1_amd64.deb

		mkdir -p run logs data
		chown -R $UNPRIV_USER:$UNPRIV_USER run logs data

		cat <<EOF > "${INSTALL_DIR}/dragonfly/dragonfly.conf"
--pidfile=${INSTALL_DIR}/dragonfly/run/dragonfly.pid
--log_dir=${INSTALL_DIR}/dragonfly/logs
--dir=${INSTALL_DIR}/dragonfly/data
--port=6379
--requirepass=${PASS_DRAGONFLY}
EOF

		cat <<EOF > /etc/systemd/system/dragonfly.service
[Unit]
Description=DragonflyDB
After=network.target

[Service]
Type=simple
ExecStart="${INSTALL_DIR}/dragonfly/dragonfly-x86_64" --flagfile="${INSTALL_DIR}/dragonfly/dragonfly.conf"
PIDFile="${INSTALL_DIR}/dragonfly/run/dragonfly.pid"
TimeoutStopSec=infinity
Restart=always
User=$UNPRIV_USER
Group=$UNPRIV_USER
RuntimeDirectory=dragonfly
RuntimeDirectoryMode=2755
UMask=007
PrivateTmp=yes
LimitNOFILE=262144
PrivateDevices=yes
ProtectHome=yes
ProtectSystem=full
NoNewPrivileges=true
CapabilityBoundingSet=CAP_SETGID CAP_SETUID CAP_SYS_RESOURCE
MemoryDenyWriteExecute=true
ProtectKernelModules=true
ProtectKernelTunables=true
ProtectControlGroups=true
RestrictRealtime=true
RestrictNamespaces=true
RestrictAddressFamilies=AF_INET AF_INET6 AF_UNIX

[Install]
WantedBy=multi-user.target
EOF

		systemctl enable --now dragonfly
	fi
else
	echo "Using remote DragonflyDB"
fi

ARCH=$(uname -m)
if [[ $ARCH == "aarch64" ]]; then
	ARCH="arm64"
fi

# Install sonic
if [[ $HOST_SONIC =~ ^localhost: ]]; then
	if [[ -x /usr/local/bin/sonic ]]; then
		echo "Sonic already installed"
	else
		if [[ $ARCH == "x86_64" ]]; then
			wget https://github.com/valeriansaliou/sonic/releases/download/v${SONIC_VERSION}/v${SONIC_VERSION}-${ARCH}-gnu.tar.gz \
				-O sonic-v${SONIC_VERSION}-${ARCH}-gnu.tar.gz
			tar xvzf sonic-v${SONIC_VERSION}-${ARCH}-gnu.tar.gz
		else
			cd ${INSTALL_DIR}/src
			git clone https://github.com/valeriansaliou/sonic.git
			cd sonic/
			cargo build --release
			mkdir "${INSTALL_DIR}/sonic"
			ln -s ../src/sonic/target/release/sonic "${INSTALL_DIR}/sonic/sonic"
		fi

		cat <<EOF > "${INSTALL_DIR}/sonic/sonic.cfg"
[server]
log_level = "debug"
[channel]
inet = "[::1]:1491"
tcp_timeout = 300
auth_password = "SecretPassword"
[channel.search]
query_limit_default = 10
query_limit_maximum = 100
query_alternates_try = 4
suggest_limit_default = 5
suggest_limit_maximum = 20
list_limit_default = 100
list_limit_maximum = 500
[store]
[store.kv]
path = "./data/store/kv/"
retain_word_objects = 1000
[store.kv.pool]
inactive_after = 1800
[store.kv.database]
flush_after = 900
compress = true
parallelism = 2
max_files = 100
max_compactions = 1
max_flushes = 1
write_buffer = 16384
write_ahead_log = true
[store.fst]
path = "./data/store/fst/"
[store.fst.pool]
inactive_after = 300
[store.fst.graph]
consolidate_after = 180
max_size = 2048
max_words = 250000
EOF

		cat <<EOF > /etc/systemd/system/sonic.service
[Unit]
Description=Sonic Search Index
After=network.target

[Service]
Type=simple
User=$UNPRIV_USER
Group=$UNPRIV_USER
ExecStart=${INSTALL_DIR}/sonic/sonic -c sonic.cfg
WorkingDirectory=${INSTALL_DIR}/sonic
Restart=on-failure
LimitNOFILE=4096

[Install]
WantedBy=multi-user.target
EOF
		systemctl enable --now sonic
	fi
else
	echo "Using remote Sonic"
fi

# Install asdf, node, pnpm, yarn
if [[ ! -f "${INSTALL_DIR}/asdf/asdf.sh" ]]; then
	git clone https://github.com/asdf-vm/asdf.git "${INSTALL_DIR}/asdf" --branch v${ASDF_VERSION}
	cat <<EOF >> ~/.bashrc
# Load asdf and completions
source "${INSTALL_DIR}/asdf/asdf.sh"
source "${INSTALL_DIR}/asdf/completions/asdf.bash"
EOF
	source "${INSTALL_DIR}/asdf/asdf.sh"
	source "${INSTALL_DIR}/asdf/completions/asdf.bash"

	asdf plugin-add nodejs
	asdf plugin-add pnpm
	asdf plugin-add yarn
	asdf install nodejs ${NODE_VERSION}
	asdf install pnpm ${PNPM_VERSION}
	asdf install yarn ${YARN_VERSION}
	asdf global nodejs ${NODE_VERSION}
	asdf global pnpm ${PNPM_VERSION}
	asdf global yarn ${YARN_VERSION}

	cp ~/.asdf/installs/nodejs/${NODE_VERSION}/bin/node \
	   /usr/local/bin/

	echo "export PNPM_HOME=\"/usr/local/bin\"" >> ~/.bashrc
	export PNPM_HOME="/usr/local/bin"

	pnpm install -g pm2
	pm2 startup systemd -u $UNPRIV_USER --hp /home/$UNPRIV_USER
fi

# Install Caddy
if [[ ! -x /usr/local/bin/caddy ]]; then
	wget https://github.com/caddyserver/caddy/releases/download/v${CADDY_VERSION}/caddy_${CADDY_VERSION}_linux_${ARCH}.deb
	dpkg -i caddy_${CADDY_VERSION}_linux_${ARCH}.deb
	rm caddy_${CADDY_VERSION}_linux_${ARCH}.deb

	cat <<'EOF' >> /etc/systemd/system/caddy.service
[Unit]
Description=Caddy
After=network.target

[Service]
User=$UNPRIV_USER
Group=$UNPRIV_USER
ExecStart=/usr/local/bin/caddy run --environ --config /etc/caddy/Caddyfile
ExecReload=/usr/local/bin/caddy reload --config /etc/caddy/Caddyfile
TimeoutStopSec=5s
LimitNOFILE=1048576
LimitNPROC=512
PrivateTmp=true
ProtectSystem=full
AmbientCapabilities=CAP_NET_BIND_SERVICE

[Install]
WantedBy=multi-user.target
EOF

	cat <<EOF > /etc/caddy/Caddyfile
$INSTANCE_NAME {
    reverse_proxy localhost:3000
}
EOF

	systemctl enable --now caddy
fi

# Install Hajkey
if [[ ! -d "${INSTALL_DIR}/src/hajkey" ]]; then
	mkdir -p "${INSTALL_DIR}/src"
	cd "${INSTALL_DIR}/src"
	git clone https://git.hajkey.org/hajkey/hajkey.git
	cd hajkey/
	git switch dev
else
	cd "${INSTALL_DIR}/src/hajkey"
	git pull
fi
asdf install

yarn
yarn run build

mkdir -p ${INSTALL_DIR}/${INSTANCE_NAME}
cd ${INSTALL_DIR}/${INSTANCE_NAME}
cat <<EOF > install.sh
#!/bin/bash

rsync -av --exclude .git ${INSTALL_DIR}/src/hajkey/ .
EOF
chmod +x install.sh
./install.sh

if [[ ! -f .config/default.yml ]]; then
	mkdir -p .config
	cat <<EOF > .config/default.yml
url: https://${INSTANCE_NAME}/
port: 3000

db:
  host: ${HOST_POSTGRES%:*}
  port: ${HOST_POSTGRES#*:}
  db: bhzone

  # Auth
  user: ${USER_POSTGRES}
  pass: ${PASS_POSTGRES}

  # Whether disable Caching queries
  #disableCache: true

redis:
  host: ${HOST_REDIS%:*}
  port: ${HOST_REDIS#*:}
  pass: ${PASS_REDIS}
  prefix: hajkey

cacheServer:
  host: ${HOST_DRAGONFLY%:*}
  port: ${HOST_DRAGONFLY#*:}
  pass: ${PASS_DRAGONFLY}
  prefix: hajkey

sonic:
  host: ${HOST_SONIC%:*}
  port: ${HOST_SONIC#*:}
  auth: ${PASS_SONIC}
  collection: hajkey
  bucket: default

maxNoteLength: 8000
maxCaptionLength: 1500

reservedUsernames: [
  'root',
  'admin',
  'administrator',
  'me',
  'system'
]

clusterLimit: 16
EOF
fi

if [[ ! -f install.sh ]]; then
	cat <<EOF > install.sh
#!/bin/bash
if [[ \$USER != ${UNPRIV_USER} ]]; then
	echo "Please run as ${UNPRIV_USER}"
	exit 1
fi

cd ${INSTALL_DIR}/${INSTANCE_NAME}

yarn run migrate

export NODE_ENV=production

pm2 start --name ${INSTANCE_NAME} \
  packages/backend/built/index.js

pm2 save
EOF

	chmod +x install.sh
	sudo -u ${UNPRIV_USER} ${INSTALL_DIR}/install.sh
else
	echo "Config file already exists"
fi
