# plotgardenerUI

An Electron, React app for the plotgardener R package.

<!-- ## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) -->


## Install R

Check if your machine has R installed. If it is installed, these commands will return where it is installed.
Install at [cran](https://cran.r-project.org/mirrors.html) if not already on machine.

**__For macOS__**
```bash
which R
```
**__For Windows__**
```bash
where R
```

## Project Setup

### Install Node.js

Install Node.js [here](https://nodejs.org/en/download).

### Clone his Project Install Node Modules

Open your IDE and clone this Repository in your desired directory.

```bash
git clone https://github.com/rishabhsvemuri/pgUI.git
```

Then, move into the pgUI project directory (if not already there)
```bash
cd pgUI
``` 
### Install Node Modules

Open a terminal in your project directory and run the following command to install all Node dependencies.

```bash
npm install
```

### Development

Run this command to launch the app through the command line as a development project to test.

```bash
npm run dev
```

## Building for Distribution

Run the command corresponding with your OS to build an installer for Plotgardener. This will create an application shortcut.

**__For Windows__**
```bash
npm run build:win
```

**__For macOS__**
```bash
npm run build:mac
```

**__For Linux__**
```bash
npm run build:linux
```

### Accessing Installers

To quicly open pgUI directory in your Finder/Files, run this command in your project directory terminal:
```bash
open .
```

Within the cloned pgUI repo, navigate to pgUI/dist/plotgardener-1.0.0.(dmg or exe)

- If on **Windows** open the **plotgardener-1.0.0.exe** file

- If on **macOS** open the **plotgardener-1.0.0.dmg** file