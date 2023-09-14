#!/bin/bash
HOSTNAME=bhzone.atikayda.link
INSTALL_DIR=/data
UNPRIV_USER=hajkey

# Versions of software to install
CADDY_VERSION=2.7.4
NODE_VERSION=20.6.1
PNPM_VERSION=8.7.5
ASDF_VERSION=0.13.0

# Generate passwords (if not already generated)
if [[ ! -f "${INSTALL_DIR}/.state" ]]; then
  (
		echo "PASS_DRAGONFLY=$(pwgen -c 23 1)"
		echo "PASS_POSTGRES=$(pwgen -c 23 1)"
		echo "PASS_SONIC=$(pwgen -c 23 1)"
	) > "${INSTALL_DIR}/.state"
fi
source "${INSTALL_DIR}/.state"

# Good idea to upate the system first
#apt update
#apt upgrade
#hostnamectl hostname $HOSTNAME

adduser $UNPRIV_USER --system --group

# Install some basic tools
apt install -y \
  build-essential clang libclang-dev libc6-dev g++ llvm-dev \
  postgresql-client-common curl git pwgen

mkdir -p "${INSTALL_DIR}"
chdir "${INSTALL_DIR}"

# Install Redis
echo include /etc/redis/custom.conf >> /etc/redis/redis.conf
cat <<EOF > /etc/redis/custom.conf
bind 0.0.0.0 ::1
always-show-logo no
repl-diskless-sync yes
requirepass BgOVANRsubEQELVMVtoXjxNm8lhZY4gq
EOF
systemctl enable --now redis-server

# DragonflyDB instead of Redis
mkdir -p "${INSTALL_DIR}/dragonfly"
cd "${INSTALL_DIR}/dragonfly"
wget https://dragonflydb.gateway.scarf.sh/latest/dragonfly-x86_64.tar.gz
tar xvzf dragonfly-x86_64.tar.gz
ln -s ${INSTALL_DIR}/dragonfly/dragonfly-x86_64 /usr/local/bin/dragonfly

wget http://archive.ubuntu.com/ubuntu/pool/main/i/icu/libicu66_66.1-2ubuntu2.1_amd64.deb
dpkg -i libicu66_66.1-2ubuntu2.1_amd64.deb

cat <<EOF > "${INSTALL_DIR}/dragonfly/dragonfly.conf"
--pidfile=${INSTALL_DIR}/dragonfly/run/dragonfly.pid
--log_dir=${INSTALL_DIR}/dragonfly/logs
--dir=${INSTALL_DIR}/dragonfly/data
--port=6379
--requirepass=${PASS_DRAGONFLY}
EOF

mkdir -p run logs data
chown -R $UNPRIV_USER:$UNPRIV_USER run logs data

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

# Rust and cargo
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Install asdf, node, pnpm
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
asdf install nodejs ${NODE_VERSION}
asdf install pnpm ${PNPM_VERSION}

echo "export PNPM_HOME=\"/usr/local/bin\"" >> ~/.bashrc
export PNPM_HOME="/usr/local/bin"

pnpm install -g pm2
pm2 startup systemd -u $UNPRIV_USER --hp /home/$UNPRIV_USER

# Install Caddy
wget https://github.com/caddyserver/caddy/releases/download/v${CADDY_VERSION}/caddy_${CADDY_VERSION}_linux_arm64.deb
dpkg -i caddy_${CADDY_VERSION}_linux_arm64.deb
rm caddy_${CADDY_VERSION}_linux_arm64.deb

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

cat <<EOF >> /etc/caddy/Caddyfile
$HOSTNAME {
    reverse_proxy localhost:3000
}
EOF

systemctl enable --now caddy

# Install sonic
wget https://github.com/valeriansaliou/sonic/releases/download/v${SONIC_VERSION}/v${SONIC_VERSION}-x86_64-gnu.tar.gz \
    -O sonic-v${SONIC_VERSION}-x86_64-gnu.tar.gz
tar xvzf sonic-v${SONIC_VERSION}-x86_64-gnu.tar.gz
cd sonic/
systemctl enable --now sonic

# Install Hajkey
git clone https://git.hajkey.org/hajkey/hajkey.git
cd hajkey/
asdf install

NODE_ENV=production pnpm run build

pm2 start packages/backend/built/index.js --name hajkey
pm2 save
