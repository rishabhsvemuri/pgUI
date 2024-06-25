# plotgardenerUI

An Electron, React app for the plotgardener R package.

<!-- ## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) -->

## Install R

Check if your machine has R installed. If it is installed, these commands will return where it is installed.
Install at [cran](https://cran.r-project.org/mirrors.html) if not already on machine.

```bash
# For macOS
$ which R

# For Windows
$ where R
```

## Install the app

After project setup run the build command to access the packaged app.

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

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```
