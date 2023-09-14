# Post-install

This document describes things you can do after successfully installing Hajkey.

## Automatic translation

### DeepL

- Create a Free or Pro API account on [DeepL's website](https://www.deepl.com/pro#developer)
- Copy the API key to Control Panel > General > DeepL Translation
  - Check the "Pro account" switch if you registered for paid account

### LibreTranslate

- Install [LibreTranslate](https://libretranslate.com/)
- Get an API URL and API key, copy and paste them into Control Panel > General > Libre Translate

## Enabling push notifications

- Run `npx web-push generate-vapid-keys`
  - Docker Compose users: `docker compose exec web npx web-push generate-vapid-keys`
- Put public and private keys into Control Panel > General > Service Worker

## Object Storage (S3)

Recommended if using Docker
- Set up a bucket on provider's website (for example: AWS, Backblaze B2, Wasabi, minio or Google Cloud)
- Go to Control Panel > Object Storage and follow instructions

## Customising assets, locale

- To add custom CSS for all users, edit `custom/assets/instance.css`.
- To add static assets (such as images for the splash screen), place them in the `custom/assets/` directory.  They'll then be available on https://example.com/static-assets/filename.ext.
- To add custom locales, place them in the `custom/locales/` directory. If you name your custom locale the same as an existing locale, it will overwrite it. If you give it a unique name, it will be added to the list. Also make sure that the first part of the filename matches the locale you're basing it on. (Example: en-FOO.yml)
- To add custom error images, place them in the `custom/assets/badges` directory, replacing the files already there.
- To add custom sounds, place only mp3 files in the `custom/assets/sounds` directory.
- To update custom assets without rebuilding, just run `yarn run gulp`.

## Another admin account

- Go to desired user's page, click 3 dots in upper right corner > About > Moderation, turn on "Moderator"
- Go back to Overview and copy their ID
- Run `psql -d iceshrimp`, replace `iceshrimp` with a name of your database if needed
  - If instance is ran by a different system user: Prepend that command with `sudo -U iceshrimp`, replace `iceshrimp` with a name of that user if needed
  - Docker Compose users: `docker compose exec db psql -d iceshrimp -U iceshrimp`, replace both `iceshrimp` with name of your db, and username owning that db respectively, if needed
- Run `UPDATE "user" SET "isAdmin" = true WHERE id='999999';`, where `999999` is the copied ID of that user
- Restart your Hajkey server

### Removing admin privileges
- Get ID of the user
- Run `psql` the same way when adding admin
- Run `UPDATE "user" SET "isAdmin" = false WHERE id='999999';`, where `999999` is the copied ID of that user
- Restart your Hajkey server
- Remove moderator privileges of the user
