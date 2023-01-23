# Changelog

All changes from v13.0.0 onwards, for a full list of differences read [CALCKEY.md](./CALCKEY.md)

## [13.0.6-rc] - 2023-01-04

### Bug Fixes

- Prevent notifications if the notification contains a note that is muted

- Fix padding on normal display

- Fix: Cliff design

- Fix: user view z-fighting

- Fix: overlapping user follow button in mobile view

- Fix: Add .js to the end of two type-scripts, fixing a critical error that crashes calckey ([#9347](https://github.com/orhun/git-cliff/issues/9347))


### Features

- New post style

- Add antenna mark read functionality

- Automatic changelog generation using git cliffy


### Miscellaneous Tasks

- Update yarn

- Chore: bump version number

- Chore: upgrade packages

- Chore: up pkgs

- Chore: deprecate `deckDivider`


## [13.0.5] - 2022-12-18

### Bug Fixes

- Fix typo

- Fix-docker-env-path ([#9241](https://github.com/orhun/git-cliff/issues/9241))

- Fix: use correct color for MkMoved

- Fixed additional path to .config


### Documentation

- more badges

- weblate

- Docker-compose-port-fix ([#9251](https://github.com/orhun/git-cliff/issues/9251))


### Features

- weblate

- upgrade to vite 4


### Miscellaneous Tasks

- Update example.yml with container names specified in docker-compose, to support running either a dev or production containers off the same configs

- Chore: lint

- Chore: dockerfile cleanup

- Chore: Update patron list

- Chore: remove unicode fault in KO

- Chore: update gitignore

- Chore: fix rebuild


### Refactor

- Refactor: :busts_in_silhouette: update cleo link

- Refactor: new repo link


### Testing

- Test: 🥴

## [13.0.3] - 2022-12-16

### Bug Fixes

- Fix: 🐛 fix inconsistent theming

- Fix: css class match

- Fix: insert into correct textarea


### Documentation

- Docs: :memo: fix badge position


### Features

- Feat: Insert text at cursor for caption


### Refactor

- Refactor: rm .github folder


## [13.0.0] - 2022-12-16

## [13-rc1] - 2022-12-16

### Bug Fixes


- Fix: messaging pagination

- Fix groups button display

- Fix scroll anim bug

- Fix pinned users list

- Fix: workaround for sticky image container header

- Fix pages swiping

- Fix pages margin

- Fix user profile

- Fix fill out profile step of tutorial

- Fix: :bug: fix image size in dms

- Fix: actually set in-dm to be true if in dm

- Fix: don't do icon transform by default

- Fix problems from #9146

- Fix more icons

- Fix remote move queue

- Fix import

- Fix path

- Fix liked pages

- Fix liked pages endpoint

- Fix remote move queue

- Fix path

- Fix unicode weirdness

- Fix: call functions properly

- Fix viewing basic federaion info

- Fix: migration labels

- Fix ckjs

- Fix locale

- Fix alsoKnownAs federation

- Fix redis in ci

- Fix federation of moved to to pleroma
because it expects it to be non-existant if its null.

- Fix docker ci


### Documentation

- Docs: :memo: deps

- Docs: :memo: typo

- Docs: :memo: latest 18

- Docs: 📝 pm2

- Docs: more accessible links

- Docs: move intro to wip

- Docs: :memo: intro tutorial

- Docs: 📝 tips & tricks

- Docs: fix typo

- Docs: tips

- Docs: :memo: improve documentation, nginx

- Docs: :memo: tip

- Docs: :memo: open port tip

- Docs: 📝 alt text for calc

- Docs: 📝 typo

It's "available". Thank you luke :P

- Docs: 📝 typo

- Docs: 📝 official account

- Docs: another tip

- Docs: 📝 improve install instructions

- Docs: 📝 formatting

- Docs: 📝 optional deps

- Docs: custom locales

- Docs: a11y

- Docs: reflect last change in readme

- Docs: deps

- Docs: 📝 better links

- Docs: 📝 be more descriptive with new techs

- Docs: 📝 scylla will be optional

- Docs: 📝 better links

- Docs: 📝 be more descriptive with new techs

- Docs: 📝 scylla will be optional

- Docs: 📝 account migration


### Features

- Feat: :art: move reaction button

- Feat: :sparkles: Star button

- Feat: :art: add ripple to star react

- Feat: :art: add ripple to star react

- Feat: :sparkles: Toggle showing calckey updates as admin

- Feat: ✨ add `os.yesno` for yes/no questions

- Feat: :lipstick: add right margin to title text

- Feat: :sparkles: Allow importing follows from Pixelfed

- Feat: ✨ Append caption to textarea

- Feat: :sparkles: Managed hosting complete

- Feat: :lipstick: Phosphor icons!

- Feat: :lipstick: Phosphor icons!

- Add effects, japanese translation

- Feat: ✨ Page drafts

- Feat: Docker update script ([#9159](https://github.com/orhun/git-cliff/issues/9159))

- Feat: Docker update script ([#9159](https://github.com/orhun/git-cliff/issues/9159))

- Feat: :sparkles: Add delete all lists

- Add local move follower migration

- Feat: customizable max note length

- Add check for already moved


### Miscellaneous Tasks

- Chore: :package: Update packages

- Update example

- Update deps

- Chore: :package: package upgrades

- Chore: :arrow_up: update deps

- Chore: :arrow_up: upgrade packages

- Chore: :arrow_up: yarn 3.3.0

- Update person model


### Performance

- Perf: :zap: load icons css last


### Refactor

- Refactor: :alembic: try `active-class`

- Refactor: :recycle: Replace all `$ts` with i18n
