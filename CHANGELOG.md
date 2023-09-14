## v2023.09.13-rc1
### Highlights
- New branding & documentation
- Proper support for split domain deployments, both local and remote
- [Configurable](https://git.hajkey.org/hajkey/hajkey/src/commit/f3c1e4efd30e660372a652a7b43fdb63e2817bae/.config/example.yml#L193-L198) automatic remote media pruning (disabled by default)
- Reworked content warnings (three different styles for CW'd posts, 'Expand all CWs in thread' button, 'Expand all CWs by default' client option)

### Bug fixes
- CW-only quotes now function correctly
- Relative timestamps (*1m ago*) are now updated as time passes
- Replies to inaccessible posts are now displayed correctly instead of causing timeline errors
- Antenna pagination is now handled correctly, including for posts received out of order
- Inbox URLs are now checked in the deliver manager (a broken akkoma commit was briefly causing delivery queue crashes)
- The chats page title no longer occasionally displays *undefined*
- Fixed an edge case where account deletion could time out
- Antennas now also match on CW text
- Local only posts now correctly display on the timeline without having to reload
- The migration that moves antennas to the redis/dragonflydb cache server now works with password protected redis servers
- You can now no longer edit a post to include a quote of itself
- Post edits no longer support post visibility changes
- Full text search is now restricted to logged in users
- Local only posts are no longer accessible to guest users
- The web client now shows local users with the instance account domain instead of the web domain
- New replies in a thread are now displayed correctly
- User update no longer fails for users who don't have a `sharedInbox`
- Follow requests now paginate properly
- Fetching pinned posts from users on GoToSocial instances (or other AP implementations that return a collection of URIs instead of objects) now works properly

### UI/UX
- Ads, donation nag prompts & the patreon integration have been removed
- The blinking notification indicator has been replaced with a static one
- Replies to inaccessible posts now have an indicator explainin this
- Protected posts now have a lock indicator instead of a disabled boost button
- The navbar editor now has a proper UI
- The instance ticker is now much more readable in light mode
- The post visibility picker is now mobile-optimized
- The search button in the guest view is now a button instead of a fake search bar
- Blur is now disabled by default
- When blur is disabled, UI elements are now properly opaque
- The antenna timeline now has a help text explaining why posts can be out of order
- Status images have been replaced with [configurable](https://git.hajkey.org/hajkey/hajkey/src/commit/3afbaacc3773ac0772204d872126d37309302562/.config/example-docker.yml#L201-L205) status emoji
- The navbar layout has been tweaked
- Various inconsistencies as well as alignment & animation issues have been fixed

### Mastodon client API
- /api/v1/instance is now more accurate
- Emoji reactions are now supported
- The 'pinned' parameter is now supported for individual profile timelines
- Improved handling for quotes
- Post edits are now supported
- Post deletion now returns the correct response
- OAuth registration now correctly supports multiple callback URIs

### Backend
- `Cache<T>` `.getAll` and `.delete` functions now work as expected
- Deleted users are now purged from user lookup and public key caches
- Proper support for host-meta style WebFinger
- Stricter compliance with the WebFinger spec
- Support for WebFinger remotes that don't handle queries for object URIs correctly

### Performance
- The project is now built with yarn berry (with zero installs) instead of pnpm
- The docker build process now properly caches rust and yarn deps
- The migration rust crate now builds much faster

### Miscellaneous
- The MFM search engine is now [configurable](https://git.hajkey.org/hajkey/hajkey/src/commit/afd9ffb3c728b143c6d3d4d3dd8562ec6bde3a91/.config/example.yml#L206-L207)
- Various translation updates

### Infrastructure and governance
- Commits are now tested with basic CI on push
- Docker builds are now automatic for amd64 and arm64
- The [code of conduct](CODE_OF_CONDUCT.md) has been updated

### Attribution
This release was made possible by project contributors: Anthial, AntoineD, April John, aylamz, Froggo, Jeder, Laura Hausmann, Luna, maikelthedev, moshibar, ShittyKopper & Vyr Cossont

It also includes cherry-picked contributions from external contributors: Namekuji, Natty, ThatOneCalculator & Naskya

---

This file lists all major changes made since the fork from Firefish on 2023-07-21. For changes prior to that date, please reference the [Firefish](https://git.joinfirefish.org/firefish/firefish/-/tree/76ad0a19b3a64eaecb4da31f20c229e423ee2095/) repository.
