import { app, BrowserWindow, ipcMain, session, protocol } from 'electron';
import * as path from 'path';
import { WindowManager } from './window-manager';
import { setupAdBlocker } from './ad-blocker';
import { setupIPC } from './ipc-handler';
import { Database } from './database';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Enable hardware acceleration
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');

// RAM optimization switches
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=512');
app.commandLine.appendSwitch('disable-background-networking', 'false');

// Squirrel events (Windows installer)
if (require('electron-squirrel-startup')) {
  app.quit();
}

let windowManager: WindowManager;
let db: Database;

const createWindow = (): void => {
  db = new Database();
  windowManager = new WindowManager(
    MAIN_WINDOW_WEBPACK_ENTRY,
    MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    db
  );

  windowManager.createMainWindow();
  setupIPC(windowManager, db);
};

app.whenReady().then(async () => {
  // Setup ad blocker before any requests
  await setupAdBlocker(session.defaultSession);

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: prevent navigation to dangerous URLs
app.on('web-contents-created', (_, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    // Block dangerous protocols
    if (!['http:', 'https:', 'file:', 'about:'].includes(parsedUrl.protocol)) {
      event.preventDefault();
    }
  });

  // Block new windows from opening (open in new tab instead)
  contents.setWindowOpenHandler(({ url }) => {
    if (windowManager) {
      windowManager.getMainWindow()?.webContents.send('open-new-tab', url);
    }
    return { action: 'deny' };
  });
});
