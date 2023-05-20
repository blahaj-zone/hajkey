# 🌎 Calckey Developer Docs

## Nix Dev Environment
The Calckey repo comes with a Nix-based shell environment to help make development as easy as possible!

Please note, however, that this environment will not work on Windows outside of a WSL2 environment.

### Prerequisites

- Installed the [Nix Package Manager](https://nixos.org/download.html)
- Installed [direnv](https://direnv.net/docs/installation.html) and added its hook to your shell.

Once the repo is cloned to your computer, follow these next few steps inside the Calckey folder:

- Run `direnv allow`. This will build the environment and install all needed tools.
- Run `install-deps`, then `prepare-config`, to install the node dependencies and prepare the needed config files.
- In a second terminal,  run `devenv up`. This will spawn a **Redis** server, a **Postgres** server, and the **Calckey** server in dev mode.
- Once you see the Calckey banner printed in your second terminal, run `migrate` in the first.
- Once migrations finish, open http://localhost:3000 in your web browser.
- You should now see the admin user creation screen!

Note: When you want to restart a dev server, all you need to do is run `devenv up`, no other steps are necessary.
