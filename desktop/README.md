# Restaurant POS Desktop App

An Electron wrapper for the Restaurant Management System admin dashboard.

## Development

**Prerequisites:** Start the `frontend` Vite dev server first.

```bash
# Terminal 1 – Start the React UI
cd ../frontend
npm run dev

# Terminal 2 – Start Electron (will wait for Vite to be ready)
cd desktop
npm install
npm run dev
```

## Production Build

Produces platform-native installers (`.AppImage` on Linux, `.exe` on Windows, `.dmg` on macOS).

```bash
npm run build
```

The `build:frontend` step automatically compiles `../frontend` into a static bundle and embeds it into the installer.

## Project Structure

```
desktop/
├── main.js        # Electron main process (window, tray, IPC)
├── preload.js     # Context bridge (safe API exposed to React)
├── assets/        # App icons (icon.ico, icon.icns, icon.png)
└── package.json
```

## Adding Native Features

To call native features from React, use the globally injected `window.electronAPI`:

```ts
// Check if running inside Electron
if (window.electronAPI?.isElectron) {
  // Print a thermal receipt
  await window.electronAPI.printReceipt(htmlString);
}
```
