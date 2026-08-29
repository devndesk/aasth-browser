import { BrowserWindow, WebContentsView, session, dialog } from 'electron';
import * as path from 'path';
import { Database, ExtensionInfo } from './database';

export interface Tab {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  isLoading: boolean;
  isSleeping: boolean;
  view?: WebContentsView;
  sleepTimer?: NodeJS.Timeout;
  canGoBack: boolean;
  canGoForward: boolean;
  zoomFactor: number;
}

export const TOP_BAR_HEIGHT = 82; // 38px TabBar + 44px Toolbar

const isCustomPage = (url?: string) =>
  !url || url === 'aasth://newtab' || url === 'aasth://settings' || url === 'about:blank';

export class WindowManager {
  private mainWindow: BrowserWindow | null = null;
  private tabs: Map<string, Tab> = new Map();
  private activeTabId: string | null = null;
  private tabIdCounter = 0;
  private webviewEntry: string;
  private preloadEntry: string;
  private db: Database;
  private areViewsVisible = true;

  constructor(webviewEntry: string, preloadEntry: string, db: Database) {
    this.webviewEntry = webviewEntry;
    this.preloadEntry = preloadEntry;
    this.db = db;
  }

  createMainWindow(): BrowserWindow {
    this.mainWindow = new BrowserWindow({
      width: 1280,
      height: 820,
      minWidth: 800,
      minHeight: 600,
      frame: false,
      titleBarStyle: 'hidden',
      titleBarOverlay: false,
      backgroundColor: '#0d0d14',
      show: false,
      webPreferences: {
        preload: this.preloadEntry,
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
        webSecurity: true,
      },
    });

    this.mainWindow.loadURL(this.webviewEntry);

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
      setTimeout(() => {
        this.createTab('aasth://newtab');
      }, 350);
    });

    this.mainWindow.on('resize', () => {
      this.resizeTabs();
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    this.restoreExtensions();

    return this.mainWindow;
  }

  private async restoreExtensions(): Promise<void> {
    try {
      const extensions = this.db.getExtensions();
      for (const ext of extensions) {
        if (ext.enabled && ext.path) {
          try {
            await session.defaultSession.loadExtension(ext.path, { allowFileAccess: true });
          } catch (e) {
            console.warn(`[Aasth] Extension load warning (${ext.name}):`, e);
          }
        }
      }
    } catch (err) {
      console.warn('[Aasth] Error restoring extensions:', err);
    }
  }

  createTab(initialUrl: string = 'aasth://newtab'): string {
    if (!this.mainWindow) return '';

    const tabId = `tab-${++this.tabIdCounter}`;
    const custom = isCustomPage(initialUrl);
    const finalUrl = custom ? (initialUrl || 'aasth://newtab') : this.resolveUrl(initialUrl);

    const view = new WebContentsView({
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
        webSecurity: true,
        allowRunningInsecureContent: false,
      },
    });

    let tabTitle = 'New Tab';
    if (finalUrl === 'aasth://settings') tabTitle = 'Settings';
    else if (!custom) tabTitle = 'Loading...';

    const tab: Tab = {
      id: tabId,
      url: finalUrl,
      title: tabTitle,
      isLoading: !custom,
      isSleeping: false,
      view,
      canGoBack: false,
      canGoForward: false,
      zoomFactor: 1.0,
    };

    this.setupViewEvents(tabId, view);
    this.tabs.set(tabId, tab);
    this.mainWindow.contentView.addChildView(view);

    if (!custom) {
      view.webContents.loadURL(finalUrl);
      this.db.addHistory(finalUrl, 'New Tab');
    }

    this.setActiveTab(tabId);
    return tabId;
  }

  private setupViewEvents(tabId: string, view: WebContentsView): void {
    const wc = view.webContents;

    wc.on('page-title-updated', (_, title) => {
      const tab = this.tabs.get(tabId);
      if (tab && !isCustomPage(tab.url)) {
        tab.title = title;
        this.sendToRenderer('tab-updated', { tabId, title, url: wc.getURL() });
        if (wc.getURL() && !wc.getURL().startsWith('about:')) {
          this.db.addHistory(wc.getURL(), title);
        }
      }
    });

    wc.on('did-start-loading', () => {
      const tab = this.tabs.get(tabId);
      if (tab && !isCustomPage(tab.url)) {
        tab.isLoading = true;
        tab.isSleeping = false;
        this.sendToRenderer('tab-loading', { tabId, isLoading: true });
        this.resetSleepTimer(tabId);
      }
    });

    wc.on('did-stop-loading', () => {
      const tab = this.tabs.get(tabId);
      if (tab && !isCustomPage(tab.url)) {
        tab.isLoading = false;
        const currentUrl = wc.getURL();
        tab.url = currentUrl || tab.url;
        tab.canGoBack = wc.canGoBack();
        tab.canGoForward = wc.canGoForward();
        this.sendToRenderer('tab-updated', {
          tabId,
          isLoading: false,
          url: tab.url,
          title: tab.title,
          canGoBack: tab.canGoBack,
          canGoForward: tab.canGoForward,
        });

        if (currentUrl && !currentUrl.startsWith('about:')) {
          this.db.addHistory(currentUrl, tab.title);
        }
        this.startSleepTimer(tabId);
      }
    });

    wc.on('page-favicon-updated', (_, favicons) => {
      const tab = this.tabs.get(tabId);
      if (tab && favicons.length > 0 && !isCustomPage(tab.url)) {
        tab.favicon = favicons[0];
        this.sendToRenderer('tab-updated', { tabId, favicon: favicons[0] });
      }
    });

    wc.setWindowOpenHandler(({ url }) => {
      if (url.startsWith('http')) {
        this.createTab(url);
      }
      return { action: 'deny' };
    });
  }

  private getSleepTimeoutMs(): number {
    const minutes = this.db.getSetting('tabSleepMinutes', 30) as number;
    if (minutes <= 0) return 0;
    return minutes * 60 * 1000;
  }

  private startSleepTimer(tabId: string): void {
    const timeoutMs = this.getSleepTimeoutMs();
    if (timeoutMs <= 0) return;

    const tab = this.tabs.get(tabId);
    if (!tab || tabId === this.activeTabId || isCustomPage(tab.url)) return;

    if (tab.sleepTimer) clearTimeout(tab.sleepTimer);

    tab.sleepTimer = setTimeout(() => {
      this.sleepTab(tabId);
    }, timeoutMs);
  }

  private resetSleepTimer(tabId: string): void {
    const tab = this.tabs.get(tabId);
    if (!tab) return;
    if (tab.sleepTimer) clearTimeout(tab.sleepTimer);
  }

  sleepTab(tabId: string): void {
    const tab = this.tabs.get(tabId);
    if (!tab || !tab.view || tabId === this.activeTabId || tab.isSleeping || isCustomPage(tab.url)) return;

    tab.isSleeping = true;
    tab.view.webContents.loadURL('about:blank');
    this.sendToRenderer('tab-updated', { tabId, isSleeping: true });
  }

  wakeTab(tabId: string): void {
    const tab = this.tabs.get(tabId);
    if (!tab || !tab.isSleeping || !tab.view) return;

    tab.isSleeping = false;
    tab.isLoading = true;
    tab.view.webContents.loadURL(tab.url);
    this.sendToRenderer('tab-updated', { tabId, isSleeping: false, isLoading: true });
  }

  setActiveTab(tabId: string): void {
    if (!this.mainWindow) return;

    const tab = this.tabs.get(tabId);
    if (!tab || !tab.view) return;

    if (tab.isSleeping) {
      this.wakeTab(tabId);
    }

    if (this.activeTabId && this.activeTabId !== tabId) {
      const prevTab = this.tabs.get(this.activeTabId);
      if (prevTab?.view) {
        prevTab.view.setVisible(false);
        this.startSleepTimer(this.activeTabId);
      }
    }

    this.activeTabId = tabId;

    const bounds = this.mainWindow.getContentBounds();
    tab.view.setBounds({
      x: 0,
      y: TOP_BAR_HEIGHT,
      width: bounds.width,
      height: Math.max(0, bounds.height - TOP_BAR_HEIGHT),
    });

    const custom = isCustomPage(tab.url);
    const shouldBeVisible = !custom && this.areViewsVisible;
    tab.view.setVisible(shouldBeVisible);

    this.resetSleepTimer(tabId);

    this.sendToRenderer('active-tab-changed', {
      tabId,
      url: tab.url,
      title: tab.title,
      isSleeping: tab.isSleeping,
      canGoBack: custom ? false : tab.view.webContents.canGoBack(),
      canGoForward: custom ? false : tab.view.webContents.canGoForward(),
    });
  }

  closeTab(tabId: string): void {
    const tab = this.tabs.get(tabId);
    if (!tab) return;

    if (tab.sleepTimer) clearTimeout(tab.sleepTimer);

    if (tab.view) {
      this.mainWindow?.contentView.removeChildView(tab.view);
      tab.view.webContents.close();
    }

    this.tabs.delete(tabId);

    if (this.activeTabId === tabId) {
      const remaining = Array.from(this.tabs.keys());
      if (remaining.length > 0) {
        this.setActiveTab(remaining[remaining.length - 1]);
      } else {
        this.createTab('aasth://newtab');
      }
    }

    this.sendToRenderer('tab-closed', { tabId });
  }

  navigate(tabId: string, url: string): void {
    const tab = this.tabs.get(tabId);
    if (!tab?.view) return;

    if (url === 'aasth://newtab' || !url || url === 'about:blank') {
      tab.url = 'aasth://newtab';
      tab.title = 'New Tab';
      tab.view.setVisible(false);
      this.sendToRenderer('active-tab-changed', {
        tabId,
        url: 'aasth://newtab',
        title: 'New Tab',
        canGoBack: false,
        canGoForward: false,
      });
      return;
    }

    if (url === 'aasth://settings') {
      tab.url = 'aasth://settings';
      tab.title = 'Settings';
      tab.view.setVisible(false);
      this.sendToRenderer('active-tab-changed', {
        tabId,
        url: 'aasth://settings',
        title: 'Settings',
        canGoBack: false,
        canGoForward: false,
      });
      return;
    }

    const finalUrl = this.resolveUrl(url);
    tab.url = finalUrl;
    tab.isLoading = true;

    if (this.areViewsVisible && tabId === this.activeTabId) {
      tab.view.setVisible(true);
    }

    tab.view.webContents.loadURL(finalUrl);
  }

  private resolveUrl(input: string): string {
    const trimmed = input.trim();
    if (!trimmed) return 'aasth://newtab';
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('file://')) {
      return trimmed;
    }
    if (trimmed.startsWith('about:') || trimmed.startsWith('aasth:')) {
      return trimmed;
    }
    if ((trimmed.includes('.') && !trimmed.includes(' ')) || trimmed.startsWith('localhost:')) {
      return `https://${trimmed}`;
    }

    const engine = this.db.getSetting('searchEngine', 'brave') as string;
    switch (engine) {
      case 'google':
        return `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`;
      case 'duckduckgo':
        return `https://duckduckgo.com/?q=${encodeURIComponent(trimmed)}`;
      case 'bing':
        return `https://www.bing.com/search?q=${encodeURIComponent(trimmed)}`;
      case 'ecosia':
        return `https://www.ecosia.org/search?q=${encodeURIComponent(trimmed)}`;
      case 'brave':
      default:
        return `https://search.brave.com/search?q=${encodeURIComponent(trimmed)}`;
    }
  }

  goBack(tabId: string): void {
    const tab = this.tabs.get(tabId);
    if (tab?.view?.webContents.canGoBack()) {
      tab.view.webContents.goBack();
    }
  }

  goForward(tabId: string): void {
    const tab = this.tabs.get(tabId);
    if (tab?.view?.webContents.canGoForward()) {
      tab.view.webContents.goForward();
    }
  }

  reload(tabId: string): void {
    const tab = this.tabs.get(tabId);
    tab?.view?.webContents.reload();
  }

  stopLoad(tabId: string): void {
    const tab = this.tabs.get(tabId);
    tab?.view?.webContents.stop();
  }

  zoomIn(tabId: string): number {
    const tab = this.tabs.get(tabId);
    if (!tab?.view) return 1.0;
    tab.zoomFactor = Math.min(3.0, tab.zoomFactor + 0.1);
    tab.view.webContents.setZoomFactor(tab.zoomFactor);
    return tab.zoomFactor;
  }

  zoomOut(tabId: string): number {
    const tab = this.tabs.get(tabId);
    if (!tab?.view) return 1.0;
    tab.zoomFactor = Math.max(0.5, tab.zoomFactor - 0.1);
    tab.view.webContents.setZoomFactor(tab.zoomFactor);
    return tab.zoomFactor;
  }

  zoomReset(tabId: string): number {
    const tab = this.tabs.get(tabId);
    if (!tab?.view) return 1.0;
    tab.zoomFactor = 1.0;
    tab.view.webContents.setZoomFactor(1.0);
    return 1.0;
  }

  getZoomFactor(tabId: string): number {
    const tab = this.tabs.get(tabId);
    return tab?.zoomFactor ?? 1.0;
  }

  setViewVisibility(visible: boolean): void {
    this.areViewsVisible = visible;
    if (this.activeTabId) {
      const tab = this.tabs.get(this.activeTabId);
      if (tab?.view && !isCustomPage(tab.url)) {
        tab.view.setVisible(visible);
      }
    }
  }

  resizeTabs(): void {
    if (!this.mainWindow) return;
    const bounds = this.mainWindow.getContentBounds();

    this.tabs.forEach((tab, tabId) => {
      if (tabId === this.activeTabId && tab.view) {
        tab.view.setBounds({
          x: 0,
          y: TOP_BAR_HEIGHT,
          width: bounds.width,
          height: Math.max(0, bounds.height - TOP_BAR_HEIGHT),
        });
      }
    });
  }

  async selectAndLoadExtension(): Promise<ExtensionInfo | null> {
    if (!this.mainWindow) return null;
    const result = await dialog.showOpenDialog(this.mainWindow, {
      title: 'Select Unpacked Chrome Extension Folder',
      properties: ['openDirectory'],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    const extPath = result.filePaths[0];
    try {
      const loaded = await session.defaultSession.loadExtension(extPath, {
        allowFileAccess: true,
      });

      const extInfo: ExtensionInfo = {
        id: loaded.id,
        name: loaded.name,
        version: loaded.version,
        path: extPath,
        enabled: true,
      };

      this.db.addExtension(extInfo);
      return extInfo;
    } catch (err) {
      console.error('[Aasth] Extension load error:', err);
      throw err;
    }
  }

  getAllTabs(): Tab[] {
    return Array.from(this.tabs.values()).map((tab) => ({
      ...tab,
      view: undefined,
      sleepTimer: undefined,
    }));
  }

  getActiveTabId(): string | null {
    return this.activeTabId;
  }

  getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  private sendToRenderer(channel: string, data: unknown): void {
    this.mainWindow?.webContents.send(channel, data);
  }
}
