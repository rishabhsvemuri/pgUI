# plotgardenerUI

An Electron, React app for the plotgardener R package.

<!-- ## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) -->


## For testing plotgardener

First clone this repo. Then follow steps in [Install R](#install-r), [Install Node Modules](#install-node-modules), [Building for Distribution](#building-for-distribution), and [Accessing Installers](#accessing-installers).

## Install R

Check if your machine has R installed. If it is installed, these commands will return where it is installed.
Install at [cran](https://cran.r-project.org/mirrors.html) if not already on machine.

```bash
# For macOS
$ which R

# For Windows
$ where R
```

## Project Setup

### Install Node Modules

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

## Building for Distribution

Run the command corresponding with your OS.

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

## Accessing Installers
Within the cloned pgUI repo, navigate to pgUI/dist/plotgardener-1.0.0.(dmg or exe)