import { ipcMain, app, shell } from 'electron';
import { WindowManager } from './window-manager';
import { Database } from './database';
import { getBlockedCount } from './ad-blocker';

export function setupIPC(windowManager: WindowManager, db: Database): void {
  // ── Tabs ──────────────────────────────────────────────────────────────────
  ipcMain.handle('create-tab', (_, url?: string) => windowManager.createTab(url));
  ipcMain.handle('close-tab', (_, tabId: string) => windowManager.closeTab(tabId));
  ipcMain.handle('set-active-tab', (_, tabId: string) => windowManager.setActiveTab(tabId));
  ipcMain.handle('get-all-tabs', () => windowManager.getAllTabs());

  // ── Navigation ────────────────────────────────────────────────────────────
  ipcMain.handle('navigate', (_, { tabId, url }: { tabId: string; url: string }) =>
    windowManager.navigate(tabId, url));
  ipcMain.handle('go-back', (_, tabId: string) => windowManager.goBack(tabId));
  ipcMain.handle('go-forward', (_, tabId: string) => windowManager.goForward(tabId));
  ipcMain.handle('reload', (_, tabId: string) => windowManager.reload(tabId));
  ipcMain.handle('stop-load', (_, tabId: string) => windowManager.stopLoad(tabId));
  ipcMain.handle('zoom-in', (_, tabId: string) => windowManager.zoomIn(tabId));
  ipcMain.handle('zoom-out', (_, tabId: string) => windowManager.zoomOut(tabId));
  ipcMain.handle('zoom-reset', (_, tabId: string) => windowManager.zoomReset(tabId));

  // ── History ───────────────────────────────────────────────────────────────
  ipcMain.handle('get-history', (_, limit?: number) => db.getHistory(limit));
  ipcMain.handle('search-history', (_, query: string) => db.searchHistory(query));
  ipcMain.handle('clear-history', () => db.clearHistory());
  ipcMain.handle('delete-history-item', (_, id: string) => db.deleteHistoryItem(id));

  // ── Bookmarks ─────────────────────────────────────────────────────────────
  ipcMain.handle('add-bookmark', (_, { url, title, favicon }: { url: string; title: string; favicon?: string }) =>
    db.addBookmark(url, title, favicon));
  ipcMain.handle('remove-bookmark', (_, id: string) => db.removeBookmark(id));
  ipcMain.handle('get-bookmarks', () => db.getBookmarks());
  ipcMain.handle('is-bookmarked', (_, url: string) => db.isBookmarked(url));

  // ── Settings ──────────────────────────────────────────────────────────────
  ipcMain.handle('get-setting', (_, { key, defaultValue }: { key: string; defaultValue: unknown }) =>
    db.getSetting(key, defaultValue));
  ipcMain.handle('set-setting', (_, { key, value }: { key: string; value: unknown }) =>
    db.setSetting(key, value));

  // ── Shield / Privacy ──────────────────────────────────────────────────────
  ipcMain.handle('get-blocked-count', () => getBlockedCount());
  ipcMain.handle('get-shield-status', () => ({
    adBlockEnabled: true,
    trackerBlockEnabled: true,
    httpsUpgradeEnabled: true,
  }));
  ipcMain.handle('set-shield-status', (_, status: object) => {
    console.log('[Aasth] Shield status update:', status);
  });

  // ── Extensions (stubs) ────────────────────────────────────────────────────
  ipcMain.handle('get-extensions', () => []);
  ipcMain.handle('load-extension', () => null);
  ipcMain.handle('remove-extension', () => null);

  // ── View visibility ───────────────────────────────────────────────────────
  ipcMain.handle('set-view-visibility', (_, visible: boolean) => {
    windowManager.setViewVisibility(visible);
  });

  // ── Window controls ───────────────────────────────────────────────────────
  ipcMain.handle('window-minimize', () => windowManager.getMainWindow()?.minimize());
  ipcMain.handle('window-maximize', () => {
    const win = windowManager.getMainWindow();
    if (win?.isMaximized()) win.unmaximize(); else win?.maximize();
    setTimeout(() => windowManager.resizeTabs(), 100);
  });
  ipcMain.handle('window-close', () => windowManager.getMainWindow()?.close());
  ipcMain.handle('open-external', (_, url: string) => shell.openExternal(url));
  ipcMain.handle('get-app-version', () => app.getVersion());
}
