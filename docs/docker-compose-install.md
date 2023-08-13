# Installing Iceshrimp with Docker

This guide is based on `docker compose`/Docker Compose v2, but `docker-compose`/Docker Compose v1 will work as well.

## Preparations

### Getting needed files

Run `git clone https://iceshrimp.dev/iceshrimp/iceshrimp` <!--but if you are not planning on building your own image, just grabbing `.config` and `docker-compose.yml.example` from the repo will suffice.-->

### docker-compose.yml

First, run `cp docker-compose.yml.example docker-compose.yml`, and edit `docker-compose.yml` if
- you want to build the image yourself or choose a [different tag](https://iceshrimp.dev/iceshrimp/-/packages/container/iceshrimp/versions), and/or
- you want a search engine for better search performance and/or a cache server for better antenna handling.

### .config

Run `cp .config/docker_example.env .config/docker.env`, and edit `.config/docker.env` and fill it with the database credentials you want.  
Run `cp .config/example-docker.yml .config/default.yml`, and edit `.config/default.yml` 
- Replace example database credentials with the ones you entered in `.config/docker.env`
- Change other configuration
- Optionally, set up the search engine and cache server, if you have chosen to set them up.

## Installation and first start

Choose a method, whether you chose to build the image yourself or not.  
Note: Ctrl-C will shut down Iceshrimp gracefully.

### Pulling the image

```sh
docker compose pull
docker compose up
```

### Building the image

Depending on your machine specs, this can take well over 30 minutes
```sh
docker compose build
docker compose up
```

## Starting Iceshrimp automatically

Run `docker compose up -d` and Iceshrimp will start automatically on boot.

## Updating Iceshrimp

### Pulling the image

```sh
docker compose pull
docker compose down
docker compose up -d
```

### Building the image

```sh
## Run git stash commands only if you have uncommitted changes
git stash
git pull
git stash pop
docker compose build
docker compose down
docker compose up -d
```

## Post-install

See [post-install](post-install.md).
