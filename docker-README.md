# 🐳 Docker Compose for Development

```sh
cd dev/
docker-compose build
docker-compose run --rm web yarn run init
docker-compose up -d
```

# Running a Calckey instance with Docker

## Pre-built docker container
[thatonecalculator/calckey](https://hub.docker.com/r/thatonecalculator/calckey)
## docker-compose
You can find a `docker-compose.yml` file in the same folder as this `README`, along with a folder called `.config` containing two **example** files needed to get the instance running:
- .config/docker.env (**db config settings**)
- .config/default.yml (**calckey instance settings**)

## configuring calckey

Rename the files:

`cp .config/default_example.yml .config/default.yml`

`cp .config/example.env .config/docker.env`

then edit them according to your environment.
You can configure `docker.env` with anything you like, but you will have to pay attention to the `default.yml` file:
- `url` should be set to the URL you will be hosting the web interface for the instance at.
- `host`, `db`, `user`, `pass` will have to be configured in the `PostgreSQL configuration` section - `host` is the name of the postgres container (eg: *calckey_db_1*), and the others should match your `docker.env`.
- `host`will need to be configured in the *Redis configuration* section - it is the name of the redis container (eg: *calckey_redis_1*)

Everything else can be left as-is.

## Running docker-compose
The [prebuilt container for calckey](https://hub.docker.com/r/thatonecalculator/calckey) is fairly large, and may take a few minutes to download and extract using docker.

Copy `docker-compose.yml` and the `config/` to a directory, then run the **docker-compose** command:
`docker-compose up -d`.

NOTE: This will take some time to come fully online, even after download and extracting the container images, and it may emit some error messages before completing successfully. Specifically, the `db` container needs to initialize and so isn't available to the `web` container right away. Only once the `db` container comes online does the `web` container start building and initializing the calckey tables.

Once the instance is up you can use a web browser to access the web interface at `http://serverip:3000` (where `serverip` is the IP of the server you are running the calckey instance on).

## Securing your instance with a reverse proxy
On its own *calckey* serves itself with HTTP, and does not support SSL. In order to support encrypted connections via HTTPS - an absolute necessity if you intend to host an instance accessible from the public internet - you need to add a reverse proxy to your setup.
