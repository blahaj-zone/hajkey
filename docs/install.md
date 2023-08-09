# Installing Iceshrimp
This document will guide you through manual installation of Iceshrimp on dev branch, for main branch, use Firefish's installation guide.

## Dependencies

### Build
- **Rust** 1.68+
- C/C++ compiler like **GCC** or **Clang**
- Build tools like **make**
- **Python 3**

### Required
- [**Node.js**](https://nodejs.org) v18.16.0+ (v20 recommended)
- [**PostgreSQL**](https://www.postgresql.org/) 12+ (14 recommended) 
- [**Redis**](https://redis.io/) 6+ (7 recommended)
- [**libvips**](https://www.libvips.org/)
- **Web proxy**
  - nginx
  - Caddy
  
### Optional
- [**FFmpeg**](https://ffmpeg.org/) for video transcoding
- Full text search (Choose one)  
  Iceshrimp has full text search powered by Postgres by default, however it's very slow, and these are alternatives for that
  - [**Meilisearch**](https://www.meilisearch.com/) | [Installation guide](https://www.meilisearch.com/docs/learn/getting_started/quick_start) 
  - [**Sonic**](https://crates.io/crates/sonic-server) (More lightweight, but less features) | [Installation guide](https://github.com/valeriansaliou/sonic#installation)
- Caching server (Choose one)   
	This will be used for storing stuff like antennas. If you won't install any, mandatory Redis instance will be used instead
  - [**DragonflyDB**](https://www.dragonflydb.io/) | [Installation guide](https://www.dragonflydb.io/docs/getting-started)
  - [**KeyDB**](https://docs.keydb.dev/) | [Installation guide](https://docs.keydb.dev/docs/open-source-getting-started)
  - Another **Redis** server

## Preparations

### Download repository
```sh
git clone https://iceshrimp.dev/iceshrimp/iceshrimp
```

### Creating a new user
In case you want to run Iceshrimp as a different user, run `adduser --disabled-password --disabled-login iceshrimp`  
Following steps will require you to run them as the user you have made, so use `su - iceshrimp`, or `sudo -iu iceshrimp`, or whatever else method in order to temporarily log in as that user. 

### Configuration
- Copy `.config/example.yml` to `.config/default.yml`
- Edit `.config/default.yml` with text editor
	- Make sure to set PostgreSQL and Redis section correctly
	- Make sure to set/uncomment caching server and/or text search sections if you happen to set up these too

## Installing project dependencies
```sh
corepack enable
corepack prepare yarn@stable --activate
yarn
```
<!--TODO: Find out a way to do no-optional (no tensorflow) install on yarn berry, so far I have found none-->

## Building Iceshrimp
```sh
yarn build
```
## Database
### Creating database
This will create a postgres user with your password and database, while also granting that user all privileges on database.  
Using `psql` prompt:
```sh
sudo -u postgres psql
```
```postgresql
create database iceshrimp with encoding = 'UTF8';
create user iceshrimp with encrypted password '{YOUR_PASSWORD}';
grant all privileges on database iceshrimp to iceshrimp;
\q
```

### First migration
In order for Iceshrimp to work properly, you need to initialise the database using
```bash
yarn run init
```

## Setting up Webproxy
### Nginx
- Run `sudo cp docs/examples/iceshrimp.nginx.conf /etc/nginx/sites-available/ && cd /etc/nginx/sites-available/`
- Edit `iceshrimp.nginx.conf` to reflect your server properly
- Run `sudo ln -s ./iceshrimp.nginx.conf ../sites-enabled/iceshrimp.nginx.conf`
- Run `sudo nginx -t` to check that the config is valid, then restart the nginx service.

### Caddy
- Add the following to your Caddyfile, and replace `example.com` with your domain
```
example.com {
  reverse_proxy localhost:3000
}
```

## Running Iceshrimp

### Running manually
- Start Iceshrimp by running `yarn run start`.  
If this is your first run, after Iceshrimp has started successfully, you'll be able to go to the URL you have specified in `.config/default.yml` and create first user.  
- To stop the server, use `Ctrl-C`.

### Running using systemd
- Run `sudo cp docs/examples/iceshrimp.service /etc/systemd/system/`
- Edit `/etc/systemd/system/iceshrimp.service` with text editor, and change `User`, `WorkingDir`, `ExecStart` if necessary.
- Run `sudo systemctl daemon-reload`
- Run `sudo systemctl enable --now iceshrimp` in order to enable and start Iceshrimp.
- (Optional) Check if instance is running using `sudo systemctl status iceshrimp`

### Updating Iceshrimp
Shut down Iceshrimp and then run these commands

```sh
## Do git stash commands only if you had made changes to the repo
git stash
git pull
git stash pop
yarn
NODE_ENV=production yarn build && yarn migrate
```

Start Iceshrimp back up

## Post-install
See [post-install](post-install.md).
