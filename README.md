<div align="center">
<a href="https://i.calckey.cloud/">
	<img src="./title_float.svg" alt="Calckey logo" style="border-radius:50%" width="400"/>
</a>

**🌎 **[Calckey](https://i.calckey.cloud/)** is an open source, decentralized social media platform that's free forever! 🚀**

[![no github badge](https://nogithub.codeberg.page/badge.svg)](https://nogithub.codeberg.page/)
[![status badge](https://ci.codeberg.org/api/badges/calckey/calckey/status.svg)](https://ci.codeberg.org/calckey/calckey)
[![liberapay badge](https://img.shields.io/liberapay/receives/ThatOneCalculator?logo=liberapay)](https://liberapay.com/ThatOneCalculator)
[![translate-badge](https://hosted.weblate.org/widgets/calckey/-/svg-badge.svg)](https://hosted.weblate.org/engage/calckey/)
[![docker badge](https://img.shields.io/docker/pulls/thatonecalculator/calckey?logo=docker)](https://hub.docker.com/r/thatonecalculator/calckey)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](./CODE_OF_CONDUCT.md)
[![Codeberg badge](https://custom-icon-badges.demolab.com/badge/hosted%20on-codeberg-4793CC.svg?logo=codeberg&logoColor=white)](https://codeberg.org/calckey/calckey/)

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
  - Fediverse account migration
  - Improved instance security
  - Improved accessibility
  - Recommended Instances timeline
  - OCR image captioning
  - New and improved Groups
  - Better intro tutorial
  - Compatibility with Mastodon clients/apps
  - Backfill user information
  - Sonic search
  - Many more user and admin settings
  - [So much more!](./CALCKEY.md)

</div>

<div style="clear: both;"></div>

# 🥂 Links

- 💸 Liberapay: <https://liberapay.com/ThatOneCalculator>
  - Donate publicly to get your name on the Patron list!
- 🚢 Flagship instance: <https://calckey.social>
- 📣 Official account: <https://i.calckey.cloud/@calckey>
- 💁 Matrix support room: <https://matrix.to/#/#calckey:matrix.fedibird.com>
- 📜 Instance list: <https://calckey.fediverse.observer/list>
- 📖 JoinFediverse Wiki: <https://joinfediverse.wiki/What_is_Calckey%3F>
- 🐋 Docker Hub: <https://hub.docker.com/r/thatonecalculator/calckey>
- ✍️ Weblate: <https://hosted.weblate.org/engage/calckey/>
- 📦 Yunohost: <https://github.com/YunoHost-Apps/calckey_ynh>

# 🌠 Getting started

This guide will work for both **starting from scratch** and **migrating from Misskey**.

## 🔰 Easy installers

If you have access to a server that supports one of the sources below, I recommend you use it! Note that these methods *won't* allow you to migrate from Misskey without manual intervention.

[![Install on Ubuntu](https://pool.jortage.com/voringme/misskey/3b62a443-1b44-45cf-8f9e-f1c588f803ed.png)](https://codeberg.org/calckey/ubuntu-bash-install)　　[![Install on the Arch User Repository](https://pool.jortage.com/voringme/misskey/ba2a5c07-f078-43f1-8483-2e01acca9c40.png)](https://aur.archlinux.org/packages/calckey)　　[![Install Calckey with YunoHost](https://install-app.yunohost.org/install-with-yunohost.svg)](https://install-app.yunohost.org/?app=calckey)

### 🐋 Docker

[How to run Calckey with Docker](./docs/docker.md).

## 🧑‍💻 Dependencies

- 🐢 At least [NodeJS](https://nodejs.org/en/) v18.12.1 (v19 recommended)
  - Install with [nvm](https://github.com/nvm-sh/nvm)
- 🐘 At least [PostgreSQL](https://www.postgresql.org/) v12
- 🍱 At least [Redis](https://redis.io/) v6 (v7 recommend)

### 😗 Optional dependencies

- [FFmpeg](https://ffmpeg.org/) for video transcoding
- Full text search (choost one of the following)
  - 🦔 [Sonic](https://crates.io/crates/sonic-server) (highly recommended!)
  - [ElasticSearch](https://www.elastic.co/elasticsearch/)
- Management (choose one of the following)
  - 🛰️ [pm2](https://pm2.io/)
  - 🐳 [Docker](https://docker.com)
  - Service manager (systemd, openrc, etc)

### 🏗️ Build dependencies

- 🦀 [Rust toolchain](https://www.rust-lang.org/)
- 🦬 C/C++ compiler & build tools
  - `build-essential` on Debian/Ubuntu Linux
  - `base-devel` on Arch Linux
- 🐍 [Python 3](https://www.python.org/)

## 👀 Get folder ready

```sh
git clone --depth 1 https://codeberg.org/calckey/calckey.git
cd calckey/
```

By default, you're on the development branch. Run `git checkout beta` or `git checkout main` to switch to the Beta/Main branches.

## 📩 Install dependencies

```sh
# nvm install 19 && nvm use 19
corepack enable
corepack prepare pnpm@latest --activate
# To build without TensorFlow, append --no-optional
pnpm i # --no-optional
```

## 🐘 Create database

Assuming you set up PostgreSQL correctly, all you have to run is:

```sh
psql postgres -c "create database calckey with encoding = 'UTF8';"
```

In Calckey's directory, fill out the `db` section of `.config/default.yml` with the correct information, where the `db` key is `calckey`.

## 🦔 Set up search

Follow sonic's [installation guide](https://github.com/valeriansaliou/sonic#installation)

If you use IPv4: in Sonic's directory, edit the `config.cfg` file to change `inet` to `"0.0.0.0:1491"`.

In Calckey's directory, fill out the `sonic` section of `.config/default.yml` with the correct information.


## 💅 Customize

- To add custom CSS for all users, edit `./custom/assets/instance.css`.
- To add static assets (such as images for the splash screen), place them in the `./custom/assets/` directory. They'll then be available on `https://yourinstance.tld/static-assets/filename.ext`.
- To add custom locales, place them in the `./custom/locales/` directory. If you name your custom locale the same as an existing locale, it will overwrite it. If you give it a unique name, it will be added to the list. Also make sure that the first part of the filename matches the locale you're basing it on. (Example: `en-FOO.yml`)
- To add custom error images, place them in the `./custom/assets/badges` directory, replacing the files already there.
- To add custom sounds, place only mp3 files in the `./custom/assets/sounds` directory.
- To update custom assets without rebuilding, just run `pnpm run gulp`.

## 🧑‍🔬 Configuring a new instance

- Run `cp .config/example.yml .config/default.yml`
- Edit `.config/default.yml`, making sure to fill out required fields.
- Also copy and edit `.config/docker_example.env` to `.config/docker.env` if you're using Docker.

## 🚚 Migrating from Misskey to Calckey

For migrating from Misskey v13, Misskey v12, and Foundkey, read [this document](./docs/migrate.md).

## 🍀 NGINX

- Run `sudo cp ./calckey.nginx.conf /etc/nginx/sites-available/ && cd /etc/nginx/sites-available/`
- Edit `calckey.nginx.conf` to reflect your instance properly
- Run `sudo cp ./calckey.nginx.conf ../sites-enabled/`
- Run `sudo nginx -t` to validate that the config is valid, then restart the NGINX service.

</details>

## 🚀 Build and launch!

### 🐢 NodeJS + pm2

#### `git pull` and run these steps to update Calckey in the future!

```sh
# git pull
pnpm install
NODE_ENV=production pnpm run build && pnpm run migrate
pm2 start "NODE_ENV=production pnpm run start" --name Calckey
```

## 😉 Tips & Tricks

- When editing the config file, please don't fill out the settings at the bottom. They're designed *only* for managed hosting, not self hosting. Those settings are much better off being set in Calckey's control panel.
- Port 3000 (used in the default config) might be already used on your server for something else. To find an open port for Calckey, run `for p in {3000..4000}; do ss -tlnH | tr -s ' ' | cut -d" " -sf4 | grep -q "${p}$" || echo "${p}"; done | head -n 1`. Replace 3000 with the minimum port and 4000 with the maximum port if you need it.
- I'd recommend you use a S3 Bucket/CDN for Object Storage, especially if you use Docker. 
- I'd ***strongly*** recommend against using CloudFlare, but if you do, make sure to turn code minification off.
- For push notifications, run `npx web-push generate-vapid-keys`, then put the public and private keys into Control Panel > General > ServiceWorker.
- For translations, make a [DeepL](https://deepl.com) account and generate an API key, then put it into Control Panel > General > DeepL Translation.
- To add another admin account:
  - Go to the user's page > 3 Dots > About > Moderation > turn on "Moderator"
  - Go back to Overview > click the clipboard icon next to the ID
  - Run `psql -d calckey` (or whatever the database name is)
  - Run `UPDATE "user" SET "isAdmin" = true WHERE id='999999';` (replace `999999` with the copied ID)
  - Have the new admin log out and log back in
