<div align="center">
<a href="https://i.calckey.cloud/">
	<img src="./.github/title_float.svg" alt="Calckey logo" style="border-radius:50%" width="400"/>
</a>

**🌎 **[Calckey](https://i.calckey.cloud/)** is an open source, decentralized social media platform that's free forever! 🚀**

</div>

<div>

<img src="https://pool.jortage.com/voringme/misskey/e7cd2a17-8b23-4e1e-b5cf-709480c623e2.png" align="right" height="320px" alt="Calc (the Calckey mascot) smoking a fat dart"/>

# ✨ About Calckey

- Calckey is based off of Misskey, a powerful microblogging server on ActivityPub with features such as emoji reactions, a customizable web UI, rich chatting, and much more!
- Calckey adds many quality of life changes and bug fixes for users and instance admins alike.
- Read **[this document](./CALCKEY.md)** all for current and future differences.
- Notable differences:
  - Improved UI/UX (especially on mobile)
  - Improved notifications
  - Improved instance security
  - Recommended Instances timeline
  - OCR image captioning
  - New and improved Groups
  - Better intro tutorial
  - Many more user and admin settings
  - [So much more!](./CALCKEY.md)

</div>

<div style="clear: both;"></div>

# 🥂 Links

- 💸 Liberapay: <https://liberapay.com/ThatOneCalculator>
  - Donate publicly to get your name on the Patron list!
- 🚢 Flagship instance: <https://i.calckey.cloud>
- 📣 Official account: <https://i.calckey.cloud/@calckey>
- 💁 Matrix support room: <https://matrix.to/#/#calckey:matrix.fedibird.com>
- 📜 Instance list: <https://calckey.fediverse.observer/list>
- 📖 JoinFediverse Wiki: <https://joinfediverse.wiki/What_is_Calckey%3F>
- 🐋 Docker Hub: <https://hub.docker.com/r/thatonecalculator/calckey>

# 🌠 Getting started

This guide will work for both **starting from scratch** and **migrating from Misskey**.

## 📦 Dependencies

- At least 🐢 [NodeJS](https://nodejs.org/en/) v18.12.1 (v19.1.0 recommended)

- 🐘 At least [PostgreSQL](https://www.postgresql.org/) v12

- 🍱 At least [Redis](https://redis.io/) v6 (v7 recommended)

- 🛰️ (Optional, for non-Docker) [pm2](https://pm2.io/)

## 👀 Get folder ready

```sh
git clone https://codeberg.org/thatonecalculator/calckey.git
cd calckey/
# git checkout main # if you want only stable versions
```

## 📩 Install dependencies

```sh
# nvm install 18 && nvm alias default 18 && nvm use 18
corepack enable
```

## 💅 Customize

- To add custom CSS for all users, edit `./custom/instance.css`.
- To add static assets (such as images for the splash screen), place them in the `./custom/` directory. They'll then be avaliable on `https://yourinstance.tld/static-assets/filename.ext`.
- To update custom assets without rebuilding, just run `yarn run gulp`.

## 🧑‍🔬 Configuring a new instance

- Run `cp .config/example.yml .config/default.yml`
- Edit `.config/default.yml`, making sure to fill out required fields.
- Also copy and edit `.config/docker_example.env` to `.config/docker.env` if you're using Docker.

## 🚚 Migrating from Misskey to Calckey

> ⚠️ Because of their changes, migrating from Foundkey is not supported.

```sh
cp ../misskey/.config/default.yml ./.config/default.yml # replace `../misskey/` with misskey path, add `docker.env` if you use Docker
cp -r ../misskey/files . # if you don't use object storage
```

## 🍀 NGINX

- Run `sudo cp ./calckey.nginx.conf /etc/nginx/sites-available/ && cd /etc/nginx/sites-available/`
- Edit `calckey.nginx.conf` to reflect your instance properly
- Run `sudo cp ./calckey.nginx.conf ../sites-enabled/`
- Run `sudo nginx -t` to validate that the config is valid, then restart the NGINX service.

</details>

## 🚀 Build and launch!

### 🐢 NodeJS

#### `git pull` and run these steps to update Calckey in the future!

```sh
# git pull
yarn install
NODE_ENV=production yarn run build && yarn run migrate
pm2 start "NODE_ENV=production yarn start" --name Calckey
```

### 🐋 Prebuilt Docker image

```sh
docker pull thatonecalculator/calckey
docker up -d
```

### 🐳 Docker Compose

```sh
docker-compose build
docker-compose run --rm web yarn run init
docker-compose up -d
```

## 😉 Tips & Tricks

- When editing the config file, please don't fill out the settings at the bottom. They're designed *only* for managed hosting, not self hosting. Those settings are much better off being set in Calckey's control panel.
- Port 3000 (used in the default config) might be already used on your server for something else. To find an open port for Calckey, run `for p in $(seq 3000 4000); do ss -tlnH | tr -s ' ' | cut -d" " -sf4 | grep -q "${p}$" || echo "${p}"; done | head -n 1`
- I'd recommend you use a S3 Bucket/CDN for Object Storage, especially if you use Docker. 
- I'd ***strongly*** recommend against using CloudFlare, but if you do, make sure to turn code minification off.
- For push notifications, run `npx web-push generate-vapid-keys`, the put the public and private keys into Control Panel > General > ServiceWorker.
- For translations, make a [DeepL](https://deepl.com) account and generate an API key, then put it into Control Panel > General > DeepL Translation.
- To add another admin account:
  - Go to the user's page > 3 Dots > About > Moderation > turn on "Moderator"
  - Go back to Overview > click the clipboard icon next to the ID
  - Run `psql -d calckey` (or whatever the database name is)
  - Run `UPDATE "user" SET "isAdmin" = true WHERE id='999999';` (replace `999999` with the copied ID)
  - Have the new admin log out and log back in
