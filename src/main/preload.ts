import { contextBridge, ipcRenderer } from 'electron';

// Expose safe IPC API to renderer via contextBridge
contextBridge.exposeInMainWorld('aasth', {
  // Tab management
  createTab: (url?: string) => ipcRenderer.invoke('create-tab', url),
  closeTab: (tabId: string) => ipcRenderer.invoke('close-tab', tabId),
  setActiveTab: (tabId: string) => ipcRenderer.invoke('set-active-tab', tabId),
  getAllTabs: () => ipcRenderer.invoke('get-all-tabs'),

  // Navigation
  navigate: (tabId: string, url: string) => ipcRenderer.invoke('navigate', { tabId, url }),
  goBack: (tabId: string) => ipcRenderer.invoke('go-back', tabId),
  goForward: (tabId: string) => ipcRenderer.invoke('go-forward', tabId),
  reload: (tabId: string) => ipcRenderer.invoke('reload', tabId),
  stopLoad: (tabId: string) => ipcRenderer.invoke('stop-load', tabId),
  zoomIn: (tabId: string) => ipcRenderer.invoke('zoom-in', tabId),
  zoomOut: (tabId: string) => ipcRenderer.invoke('zoom-out', tabId),
  zoomReset: (tabId: string) => ipcRenderer.invoke('zoom-reset', tabId),

  // History
  getHistory: (limit?: number) => ipcRenderer.invoke('get-history', limit),
  searchHistory: (query: string) => ipcRenderer.invoke('search-history', query),
  clearHistory: () => ipcRenderer.invoke('clear-history'),
  deleteHistoryItem: (id: string) => ipcRenderer.invoke('delete-history-item', id),

  // Bookmarks
  addBookmark: (url: string, title: string, favicon?: string) =>
    ipcRenderer.invoke('add-bookmark', { url, title, favicon }),
  removeBookmark: (id: string) => ipcRenderer.invoke('remove-bookmark', id),
  getBookmarks: () => ipcRenderer.invoke('get-bookmarks'),
  isBookmarked: (url: string) => ipcRenderer.invoke('is-bookmarked', url),

  // Settings
  getSetting: (key: string, defaultValue: unknown) =>
    ipcRenderer.invoke('get-setting', { key, defaultValue }),
  setSetting: (key: string, value: unknown) =>
    ipcRenderer.invoke('set-setting', { key, value }),

  // Privacy shield
  getBlockedCount: () => ipcRenderer.invoke('get-blocked-count'),
  getShieldStatus: () => ipcRenderer.invoke('get-shield-status'),
  setShieldStatus: (status: object) => ipcRenderer.invoke('set-shield-status', status),

  // Extensions
  getExtensions: () => ipcRenderer.invoke('get-extensions'),
  loadExtension: (path: string) => ipcRenderer.invoke('load-extension', path),
  removeExtension: (id: string) => ipcRenderer.invoke('remove-extension', id),

  // View visibility
  setViewVisibility: (visible: boolean) => ipcRenderer.invoke('set-view-visibility', visible),

  // Window controls
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  close: () => ipcRenderer.invoke('window-close'),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),

  // App info
  getVersion: () => ipcRenderer.invoke('get-app-version'),

  // Event listeners
  on: (channel: string, callback: (...args: unknown[]) => void) => {
    const validChannels = [
      'tab-updated', 'tab-loading', 'tab-closed',
      'active-tab-changed', 'open-new-tab',
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (_, ...args) => callback(...args));
    }
  },

  off: (channel: string, callback: (...args: unknown[]) => void) => {
    ipcRenderer.removeListener(channel, callback as never);
  },
});
