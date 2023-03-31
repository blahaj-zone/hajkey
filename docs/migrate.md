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
