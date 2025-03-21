
# Electron App with R Plotgardener Integration

This manual provides a comprehensive breakdown of the main process logic for an Electron-based desktop app that communicates with an R session to dynamically render plots using the **plotgardener** R package.

---

## Core Setup and Dependencies

### Imports
- **Electron Core**: `app`, `BrowserWindow`, `ipcMain`, etc.
- **Utilities**: `@electron-toolkit/utils` for dev tools and platform tweaks.
- **Node Modules**: `child_process`, `fs`, `path`, `url`.

---

## Main Application Window

### `createWindow()`
- Initializes the app window.
- Loads `preload` script with `contextIsolation`.
- Handles external links using `shell.openExternal`.
- Differentiates dev/prod environments for loading content.

---

## R Session Management

### `startRSession()`
- Spawns an R subprocess with `--vanilla`.
- Installs required packages:
  - `plotgardener`
  - `plotgardenerData`
  - `RColorBrewer`
- Pipes `stdout`/`stderr` to console.
- Automatically restarts if R crashes.

> Path is hardcoded to `/usr/local/bin/R`.

---

## File & Session Storage

- `savePath`: Temporary path for output PDF.
- `writePath`: R script generation file.
- `userSessionsPath`: Directory for saved sessions.
- Creates directory if it doesn’t exist.

---

## Plot State Management

- `plots`: Map of plots (`Map<id, Map<key, value>>`).
- `duplicatePlots`, `annotationsDuplicate`: Frontend sync state for UI rendering.

---

## IPC Communication

### Script Execution
- `'run-script'`:
  - Validates inputs.
  - Generates R script.
  - Sends to R session via `stdin`.
  - Triggers `'refresh-pdf'`.

### Script Editor Integration
- `'read-written.R'`: Reads generated script.
- `'save-written.R'`: Saves updated script content.

### Plot Manipulation
- `'add-item'`: Adds a new plot.
- `'update-category'`: Sets plot type.
- `'update-item'`: Modifies plot fields.

### UI Configuration
- `'load-json'`: Loads static JSON configs.
- `'icon-image-path'`: Returns relative path to plot icon.

---

## Session Management

### Creating
- `'createNewSession'`: Clears and creates new JSON session.

### Saving
- `saveSession(sessionData, sessionName)`:
  - Serializes backend state.
  - Saves `plots`, `annotations`, and metadata.

### Loading
- `'loadSession'`:
  - Parses JSON.
  - Deserializes `plots` into `Map`.

### Additional
- `'get-sessions-list'`: Lists saved sessions.
- `'deleteSession'`: Deletes a session file.
- `'emitSessionSwitch'`: Notifies frontend of session change.

---

## R Script Generation Helpers

### `writeScript()`
- Coordinates:
  - `clearPath()`
  - `startScript()`
  - `writeCommands()`
  - `closeScript()`

### Details
- **`startScript()`**: Initializes R script, opens PDF output.
- **`writeCommands()`**: Loops through `plots` and forms R commands.
- **`closeScript()`**: Ends script with `dev.off()`.

---

## App Lifecycle

- Handles `window-all-closed` and `activate` (for macOS behavior).
- Uses `electronApp.setAppUserModelId` and `optimizer.watchWindowShortcuts`.

---

## Custom Protocol

- `protocol.handle('atom')`: Allows file access via `atom://` URLs.

---

## Code Download Handler

- `'download-code'`: Saves current R script via `dialog.showSaveDialog`.

---

## Backend Sync

- `'getPlotsBackEnd'`, `'getPlotsDuplicate'`, `'getAnnotationsDuplicate'`
- `'updatePlotsDuplicate'`, `'updateAnnotationsDuplicate'`

---

For further help, check the Electron and Node.js docs or integrate debugging tools like `electron-log` or `debug`.
