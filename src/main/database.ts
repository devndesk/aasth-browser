import * as path from 'path';
import * as fs from 'fs';

const DB_PATH = path.join(
  process.env.APPDATA || process.env.HOME || '.',
  'aasth-browser',
  'data.json'
);

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
  path: string;
  enabled: boolean;
}

interface DBData {
  history: HistoryItem[];
  bookmarks: Bookmark[];
  settings: Record<string, unknown>;
  extensions: ExtensionInfo[];
}

export class Database {
  private data: DBData;

  constructor() {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    if (fs.existsSync(DB_PATH)) {
      try {
        const raw = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
        this.data = {
          history: raw.history || [],
          bookmarks: raw.bookmarks || [],
          settings: { ...this.defaultSettings(), ...(raw.settings || {}) },
          extensions: raw.extensions || [],
        };
      } catch {
        this.data = this.defaultData();
      }
    } else {
      this.data = this.defaultData();
      this.save();
    }
  }

  private defaultSettings(): Record<string, unknown> {
    return {
      theme: 'dark',
      searchEngine: 'brave',
      adBlockerEnabled: true,
      trackerBlockerEnabled: true,
      httpsUpgradeEnabled: true,
      tabSleepMinutes: 30,
      openNewTabOnStartup: true,
    };
  }

  private defaultData(): DBData {
    return {
      history: [],
      bookmarks: [
        { id: 'b1', title: 'Brave Search', url: 'https://search.brave.com', createdAt: Date.now() },
        { id: 'b2', title: 'GitHub', url: 'https://github.com', createdAt: Date.now() },
        { id: 'b3', title: 'YouTube', url: 'https://youtube.com', createdAt: Date.now() },
      ],
      settings: this.defaultSettings(),
      extensions: [],
    };
  }

  private save(): void {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('[Aasth DB] Save error:', err);
    }
  }

  addHistory(url: string, title: string): void {
    if (!url || url === 'about:blank' || url.startsWith('about:') || url === 'aasth://newtab') return;
    
    const item: HistoryItem = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
      url,
      title: title || url,
      visitedAt: Date.now(),
    };

    // Remove duplicate for the same URL to keep history tidy
    this.data.history = this.data.history.filter((h) => h.url !== url);
    this.data.history.unshift(item);

    // Keep last 1000 items
    if (this.data.history.length > 1000) {
      this.data.history = this.data.history.slice(0, 1000);
    }

    this.save();
  }

  getHistory(limit = 100): HistoryItem[] {
    return this.data.history.slice(0, limit);
  }

  deleteHistoryItem(id: string): void {
    this.data.history = this.data.history.filter((h) => h.id !== id);
    this.save();
  }

  searchHistory(query: string): HistoryItem[] {
    const q = query.toLowerCase();
    return this.data.history
      .filter((h) => (h.url && h.url.toLowerCase().includes(q)) || (h.title && h.title.toLowerCase().includes(q)))
      .slice(0, 50);
  }

  clearHistory(): void {
    this.data.history = [];
    this.save();
  }

  addBookmark(url: string, title: string, favicon?: string, folder?: string): Bookmark {
    // If already bookmarked, update title/favicon
    const existing = this.data.bookmarks.find((b) => b.url === url);
    if (existing) {
      existing.title = title || existing.title;
      if (favicon) existing.favicon = favicon;
      this.save();
      return existing;
    }

    const bookmark: Bookmark = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
      url,
      title: title || url,
      favicon,
      createdAt: Date.now(),
      folder,
    };
    this.data.bookmarks.unshift(bookmark);
    this.save();
    return bookmark;
  }

  removeBookmark(idOrUrl: string): void {
    this.data.bookmarks = this.data.bookmarks.filter(
      (b) => b.id !== idOrUrl && b.url !== idOrUrl
    );
    this.save();
  }

  getBookmarks(): Bookmark[] {
    return this.data.bookmarks;
  }

  isBookmarked(url: string): boolean {
    return this.data.bookmarks.some((b) => b.url === url);
  }

  getSetting<T>(key: string, defaultValue: T): T {
    return (this.data.settings[key] as T) ?? defaultValue;
  }

  setSetting(key: string, value: unknown): void {
    this.data.settings[key] = value;
    this.save();
  }

  getAllSettings(): Record<string, unknown> {
    return this.data.settings;
  }

  addExtension(ext: ExtensionInfo): void {
    this.data.extensions = this.data.extensions.filter((e) => e.id !== ext.id);
    this.data.extensions.push(ext);
    this.save();
  }

  removeExtension(id: string): void {
    this.data.extensions = this.data.extensions.filter((e) => e.id !== id);
    this.save();
  }

  getExtensions(): ExtensionInfo[] {
    return this.data.extensions;
  }
}
