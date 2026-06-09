const { app, BrowserWindow, shell, ipcMain, Menu, Tray, nativeImage, protocol, net } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

const isDev = !app.isPackaged;

// Keep references so GC doesn't destroy them
let mainWindow = null;
let tray = null;

// Register custom protocol for loading local files (fixes ES Module CORS on file://)
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true, supportFetchAPI: true, bypassCSP: true } }
]);

// ─── WINDOW CREATION ────────────────────────────────────────────────────────

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'Restaurant POS',
    backgroundColor: '#0f172a',
    show: false, // Show only once ready-to-show fires
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: true, // Keep enabled for security, our app:// protocol bypasses the file:// CORS restriction
    },
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
  });

  // ── Load the app ──────────────────────────────────────────────────────────
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    // Production: load via custom app:// protocol
    mainWindow.loadURL('app://-/index.html');
  }

  // Show window once fully loaded (avoids white flash)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Remove the default Windows 'File Edit View' menu bar
  mainWindow.setMenu(null);

  // Open external links in the system browser, not inside Electron
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ─── SYSTEM TRAY ────────────────────────────────────────────────────────────

function createTray() {
  const icon = nativeImage.createFromDataURL(
    // Tiny 16×16 transparent placeholder – replace with your real icon path:
    // nativeImage.createFromPath(path.join(__dirname, 'assets', 'tray-icon.png'))
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAADklEQVQ4jWNgGAWDHgAABAABAs8ZpgAAAABJRU5ErkJggg=='
  );

  tray = new Tray(icon);
  tray.setToolTip('Restaurant POS');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open POS',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        } else {
          createMainWindow();
        }
      },
    },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ]);

  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    }
  });
}

// ─── IPC HANDLERS ────────────────────────────────────────────────────────────

// Handle receipt printing (placeholder – extend for real thermal printer support)
ipcMain.handle('print-receipt', async (event, receiptHtml) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return { success: false };

  const printWin = new BrowserWindow({ show: false });
  await printWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(receiptHtml)}`);
  printWin.webContents.print({ silent: true, printBackground: true }, (success, errorType) => {
    printWin.close();
    return { success, errorType };
  });
});

// Handle app info requests from renderer
ipcMain.handle('get-app-info', () => ({
  version: app.getVersion(),
  isDev,
  platform: process.platform,
}));

// ─── APP LIFECYCLE ───────────────────────────────────────────────────────────

app.whenReady().then(() => {
  // Handle the app:// custom protocol to serve local files correctly
  protocol.handle('app', (request) => {
    // request.url is something like "app://-/index.html" or "app://-/assets/index.js"
    const urlPath = request.url.replace(/^app:\/\/-?\/?/, '');
    const decodedUrl = decodeURI(urlPath) || 'index.html';
    
    // In production, process.resourcesPath + '/app' contains the files
    const basePath = isDev ? path.join(__dirname, '..', 'frontend', 'dist') : path.join(process.resourcesPath, 'app');
    const filePath = path.join(basePath, decodedUrl);
    
    return net.fetch(pathToFileURL(filePath).toString());
  });

  createMainWindow();
  createTray();

  app.on('activate', () => {
    // macOS: re-create window when clicking dock icon
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Security: prevent navigation to unknown URLs
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    // Add "app" to allowed hosts, or bypass if the protocol is app:
    if (parsedUrl.protocol === 'app:') return;
    
    const allowedHosts = ['localhost', '127.0.0.1', 'restorant-management-saas.onrender.com'];
    if (!allowedHosts.includes(parsedUrl.hostname)) {
      event.preventDefault();
    }
  });
});
