const { contextBridge, ipcRenderer } = require('electron');

/**
 * Expose a safe, limited API from the main process to the React renderer.
 * Nothing in this file has access to Node.js directly — it only bridges
 * specific IPC channels to keep the app secure.
 */
contextBridge.exposeInMainWorld('electronAPI', {
  // ── App Info ────────────────────────────────────────────────────────────
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),

  // ── Receipt Printing ────────────────────────────────────────────────────
  // Call this from your React billing page to silently print a receipt:
  // window.electronAPI.printReceipt('<html>...</html>')
  printReceipt: (html) => ipcRenderer.invoke('print-receipt', html),

  // ── Utility ─────────────────────────────────────────────────────────────
  // Detect whether the app is running inside Electron
  isElectron: true,
  platform: process.platform,
});
