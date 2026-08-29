export interface TabInfo {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  isLoading: boolean;
  isSleeping: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  zoomFactor?: number;
}

export interface HistoryItem {
  id: string;
  url: string;
  title: string;
  visitedAt: number;
}

export interface Bookmark {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  createdAt: number;
  folder?: string;
}

export interface ExtensionInfo {
  id: string;
  name: string;
  version: string;
  path?: string;
  enabled: boolean;
  description?: string;
}

declare global {
  interface Window {
    aasth: AasthAPI;
  }
}

export interface AasthAPI {
  // Tab management
  createTab: (url?: string) => Promise<string>;
  closeTab: (tabId: string) => Promise<void>;
  setActiveTab: (tabId: string) => Promise<void>;
  getAllTabs: () => Promise<TabInfo[]>;

  // Navigation
  navigate: (tabId: string, url: string) => Promise<void>;
  goBack: (tabId: string) => Promise<void>;
  goForward: (tabId: string) => Promise<void>;
  reload: (tabId: string) => Promise<void>;
  stopLoad: (tabId: string) => Promise<void>;
  zoomIn: (tabId: string) => Promise<number | void>;
  zoomOut: (tabId: string) => Promise<number | void>;
  zoomReset: (tabId: string) => Promise<number | void>;

  // History
  getHistory: (limit?: number) => Promise<HistoryItem[]>;
  searchHistory: (query: string) => Promise<HistoryItem[]>;
  clearHistory: () => Promise<void>;
  deleteHistoryItem: (id: string) => Promise<void>;

  // Bookmarks
  addBookmark: (url: string, title: string, favicon?: string) => Promise<Bookmark>;
  removeBookmark: (idOrUrl: string) => Promise<void>;
  getBookmarks: () => Promise<Bookmark[]>;
  isBookmarked: (url: string) => Promise<boolean>;

  // Settings
  getSetting: (key: string, defaultValue: unknown) => Promise<unknown>;
  setSetting: (key: string, value: unknown) => Promise<void>;

  // Privacy shield
  getBlockedCount: () => Promise<number>;
  getShieldStatus: () => Promise<boolean>;
  setShieldStatus: (enabled: boolean) => Promise<void>;

  // Extensions
  getExtensions: () => Promise<ExtensionInfo[]>;
  loadExtension: () => Promise<ExtensionInfo | null>;
  removeExtension: (id: string) => Promise<void>;

  // View visibility
  setViewVisibility: (visible: boolean) => Promise<void>;

  // Window controls
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  close: () => Promise<void>;
  openExternal: (url: string) => Promise<void>;
  getVersion: () => Promise<string>;

  // Events
  on: (channel: string, callback: (...args: unknown[]) => void) => void;
  off: (channel: string, callback: (...args: unknown[]) => void) => void;
}
