# Post-install
This document describes things you can do after successfully installing Iceshrimp.

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
  - `docker compose exec web npx web-push generate-vapid-keys` if using Docker Compose
- Put public and private keys into Control Panel > General > Service Worker

## Object Storage (S3)
Recommended if using Docker
- Set up a bucket on provider's website (for example: AWS, Backblaze B2, Wasabi, minio or Google Cloud)
- Go to Control Panel > Object Storage and follow instructions

## Customising assets, locale
- To add custom CSS for all users, edit ./custom/assets/instance.css.
- To add static assets (such as images for the splash screen), place them in the ./custom/assets/ directory.  They'll then be available on https://example.com/static-assets/filename.ext.
- To add custom locales, place them in the ./custom/locales/ directory. If you name your custom locale the same as an existing locale, it will overwrite it. If you give it a unique name, it will be added to the list. Also make sure that the first part of the filename matches the locale you're basing it on. (Example: en-FOO.yml)
- To add custom error images, place them in the ./custom/assets/badges directory, replacing the files already there.
- To add custom sounds, place only mp3 files in the ./custom/assets/sounds directory.
- To update custom assets without rebuilding, just run pnpm run gulp.
