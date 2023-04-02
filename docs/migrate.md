# 🚚 Migrating from Misskey to Calckey

## Misskey v13 and above

```sh
wget -O mkv13.patch https://codeberg.org/calckey/calckey/raw/branch/develop/docs/mkv13.patch
git apply mkv13.patch

cd packages/backend

LINE_NUM="$(npx typeorm migration:show -d ormconfig.js | grep -n activeEmailValidation1657346559800 | cut -d ':' -f 1)"
NUM_MIGRATIONS="$(npx typeorm migration:show -d ormconfig.js | tail -n+"$LINE_NUM" | grep '\[X\]' | nl)"

for i in $(seq 1 $NUM_MIGRAIONS); do
    npx typeorm migration:revert -d ormconfig.js
done

git remote set-url origin https://codeberg.org/calckey/calckey.git
git fetch
git checkout main # or beta or develop
git pull --ff

NODE_ENV=production pnpm run migrate
# build using prefered method
```

Depending on the version you're migrating from, you may have to open Postgres with `psql -d your_database` and run the following commands:

```sql
ALTER TABLE "meta" ADD COLUMN "disableLocalTimeline" boolean DEFAULT false;
ALTER TABLE "meta" ADD COLUMN "disableGlobalTimeline" boolean DEFAULT false;
ALTER TABLE "meta" ADD COLUMN "localDriveCapacityMb" integer DEFAULT 512;
ALTER TABLE "meta" ADD COLUMN "remoteDriveCapacityMb" integer DEFAULT 128;
ALTER TABLE "user" ADD COLUMN "isSilenced" boolean DEFAULT false;
ALTER TABLE "user" ADD COLUMN "isAdmin" boolean DEFAULT false;
ALTER TABLE "user" ADD COLUMN "isModerator" boolean DEFAULT false;
ALTER TABLE "user" ADD COLUMN "remoteDriveCapacityMb" integer DEFAULT 128;
ALTER TABLE "user" ADD COLUMN "driveCapacityOverrideMb" integer DEFAULT 128;
ALTER TABLE "instance" ADD COLUMN "caughtAt" date;
ALTER TABLE "instance" ADD COLUMN "latestRequestSentAt" date;
ALTER TABLE "instance" ADD COLUMN "latestStatus" character varying(512);
ALTER TABLE "instance" ADD COLUMN "lastCommunicatedAt" date;
```

then quit with `\q`, and restart Calckey.

## Misskey v12.119 and before

```sh
git remote set-url origin https://codeberg.org/calckey/calckey.git
git fetch
git checkout main # or beta or develop
git pull --ff

NODE_ENV=production pnpm run migrate
# build using prefered method
```

## Foundkey

```sh
cd packages/backend

LINE_NUM="$(npx typeorm migration:show -d ormconfig.js | grep -n uniformThemecolor1652859567549 | cut -d ':' -f 1)"
NUM_MIGRATIONS="$(npx typeorm migration:show -d ormconfig.js | tail -n+"$LINE_NUM" | grep '\[X\]' | nl)"

for i in $(seq 1 $NUM_MIGRAIONS); do
    npx typeorm migration:revert -d ormconfig.js
done

git remote set-url origin https://codeberg.org/calckey/calckey.git
git fetch
git checkout main # or beta or develop
git pull --ff

NODE_ENV=production pnpm run migrate
# build using prefered method
```

## Reverse

You ***cannot*** migrate back to Misskey from Calckey due to re-hashing passwords on signin with argon2. You can migrate from to Calckey to Foundkey, though.
