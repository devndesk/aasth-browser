import React, { useState, useEffect, useCallback } from 'react';
import TabBar from './components/TabBar/TabBar';
import Toolbar from './components/Toolbar/Toolbar';
import BookmarksBar from './components/BookmarksBar/BookmarksBar';
import NewTabPage from './components/NewTabPage/NewTabPage';
import SettingsPage from './components/SettingsPage/SettingsPage';
import { HistoryModal } from './components/Modals/HistoryModal';
import { BookmarksModal } from './components/Modals/BookmarksModal';
import { SettingsModal } from './components/Modals/SettingsModal';
import { ExtensionsModal } from './components/Modals/ExtensionsModal';
import { TabInfo, Bookmark } from './global';
import './App.css';

const isNewTabUrl = (url?: string) =>
  !url || url === 'about:blank' || url === 'https://search.brave.com' || url === 'aasth://newtab';

const App: React.FC = () => {
  const [tabs, setTabs] = useState<TabInfo[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState('');
  const [blockedCount, setBlockedCount] = useState(0);
  const [showNewTab, setShowNewTab] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [showBookmarksBar] = useState(true);

  // Modals state
  const [showHistory, setShowHistory] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showExtensions, setShowExtensions] = useState(false);

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const isSettingsPage = currentUrl === 'aasth://settings';

  // Load Bookmarks & Tabs on mount
  useEffect(() => {
    const init = async () => {
      try {
        const existingTabs = await window.aasth.getAllTabs();
        if (existingTabs && existingTabs.length > 0) {
          setTabs(existingTabs);
          const last = existingTabs[existingTabs.length - 1];
          setActiveTabId(last.id);
          setCurrentUrl(last.url || '');
          setShowNewTab(isNewTabUrl(last.url));
        }

        const bList = await window.aasth.getBookmarks();
        if (bList) setBookmarks(bList);
      } catch (e) {
        console.error('Init error:', e);
      }
    };
    init();
  }, []);

  // Hide WebContentsView native layer whenever any modal is open
  useEffect(() => {
    const anyOpen = showHistory || showBookmarks || showSettings || showExtensions;
    window.aasth.setViewVisibility(!anyOpen).catch(() => {});
  }, [showHistory, showBookmarks, showSettings, showExtensions]);

  // Check bookmark state on URL change
  useEffect(() => {
    if (currentUrl && !isNewTabUrl(currentUrl) && !isSettingsPage) {
      window.aasth.isBookmarked(currentUrl).then(setIsBookmarked).catch(() => setIsBookmarked(false));
    } else {
      setIsBookmarked(false);
    }
  }, [currentUrl, isSettingsPage]);

  // Tab events from Electron main process
  useEffect(() => {
    window.aasth.on('tab-updated', (data: unknown) => {
      const update = data as Partial<TabInfo> & { tabId: string };
      setTabs((prev) =>
        prev.map((t) => (t.id === update.tabId ? { ...t, ...update } : t))
      );
      if (update.tabId === activeTabId && update.url) {
        setCurrentUrl(update.url);
        setShowNewTab(isNewTabUrl(update.url));
      }
    });

    window.aasth.on('tab-loading', (data: unknown) => {
      const { tabId, isLoading } = data as { tabId: string; isLoading: boolean };
      setTabs((prev) =>
        prev.map((t) => (t.id === tabId ? { ...t, isLoading } : t))
      );
    });

    window.aasth.on('tab-closed', (data: unknown) => {
      const { tabId } = data as { tabId: string };
      setTabs((prev) => prev.filter((t) => t.id !== tabId));
    });

    window.aasth.on('active-tab-changed', (data: unknown) => {
      const info = data as {
        tabId: string;
        url: string;
        title: string;
        canGoBack: boolean;
        canGoForward: boolean;
        isSleeping?: boolean;
      };
      setActiveTabId(info.tabId);
      setCurrentUrl(info.url || 'aasth://newtab');
      setShowNewTab(isNewTabUrl(info.url));

      setTabs((prev) => {
        const exists = prev.some((t) => t.id === info.tabId);
        if (!exists) {
          return [
            ...prev,
            {
              id: info.tabId,
              url: info.url,
              title: info.title || 'New Tab',
              isLoading: false,
              isSleeping: info.isSleeping || false,
              canGoBack: info.canGoBack || false,
              canGoForward: info.canGoForward || false,
            },
          ];
        }
        return prev.map((t) =>
          t.id === info.tabId
            ? {
                ...t,
                url: info.url,
                title: info.title,
                canGoBack: info.canGoBack,
                canGoForward: info.canGoForward,
                isSleeping: info.isSleeping ?? t.isSleeping,
              }
            : t
        );
      });
    });

    window.aasth.on('open-new-tab', (data: unknown) => {
      const url = data as string;
      handleNewTab(url);
    });

    const interval = setInterval(async () => {
      try {
        const count = await window.aasth.getBlockedCount();
        setBlockedCount(count);
      } catch {}
    }, 2500);

    return () => clearInterval(interval);
  }, [activeTabId]);

  const handleNewTab = useCallback(async (url?: string) => {
    const tabUrl = url || 'aasth://newtab';
    await window.aasth.createTab(tabUrl);
  }, []);

  const handleCloseTab = useCallback(async (tabId: string) => {
    await window.aasth.closeTab(tabId);
  }, []);

  const handleTabClick = useCallback(async (tabId: string) => {
    await window.aasth.setActiveTab(tabId);
  }, []);

  const handleNavigate = useCallback(
    async (url: string) => {
      if (!activeTabId) return;
      setCurrentUrl(url);
      setShowNewTab(isNewTabUrl(url));
      await window.aasth.navigate(activeTabId, url);
    },
    [activeTabId]
  );

  const handleBack = useCallback(async () => {
    if (activeTabId) await window.aasth.goBack(activeTabId);
  }, [activeTabId]);

  const handleForward = useCallback(async () => {
    if (activeTabId) await window.aasth.goForward(activeTabId);
  }, [activeTabId]);

  const handleReload = useCallback(async () => {
    if (!activeTabId) return;
    if (activeTab?.isLoading) await window.aasth.stopLoad(activeTabId);
    else await window.aasth.reload(activeTabId);
  }, [activeTabId, activeTab]);

  const refreshBookmarks = useCallback(async () => {
    try {
      const bList = await window.aasth.getBookmarks();
      if (bList) setBookmarks(bList);
    } catch {}
  }, []);

  const handleToggleBookmark = useCallback(async () => {
    if (!currentUrl || isNewTabUrl(currentUrl) || isSettingsPage) return;
    if (isBookmarked) {
      await window.aasth.removeBookmark(currentUrl);
      setIsBookmarked(false);
    } else {
      await window.aasth.addBookmark(currentUrl, activeTab?.title || currentUrl, activeTab?.favicon);
      setIsBookmarked(true);
    }
    refreshBookmarks();
  }, [currentUrl, isBookmarked, isSettingsPage, activeTab, refreshBookmarks]);

  const handleZoomIn = useCallback(async () => {
    if (activeTabId) await window.aasth.zoomIn(activeTabId);
  }, [activeTabId]);

  const handleZoomOut = useCallback(async () => {
    if (activeTabId) await window.aasth.zoomOut(activeTabId);
  }, [activeTabId]);

  const handleZoomReset = useCallback(async () => {
    if (activeTabId) await window.aasth.zoomReset(activeTabId);
  }, [activeTabId]);

  const handleOpenSettings = useCallback(() => {
    handleNavigate('aasth://settings');
  }, [handleNavigate]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      if (e.key === 'Escape') {
        setShowHistory(false);
        setShowBookmarks(false);
        setShowSettings(false);
        setShowExtensions(false);
        return;
      }

      if (isCtrlOrCmd) {
        switch (e.key.toLowerCase()) {
          case 't':
            e.preventDefault();
            handleNewTab();
            break;
          case 'w':
            e.preventDefault();
            if (activeTabId) handleCloseTab(activeTabId);
            break;
          case 'h':
            e.preventDefault();
            setShowHistory((prev) => !prev);
            setShowBookmarks(false);
            setShowSettings(false);
            setShowExtensions(false);
            break;
          case 'b':
            e.preventDefault();
            setShowBookmarks((prev) => !prev);
            setShowHistory(false);
            setShowSettings(false);
            setShowExtensions(false);
            break;
          case ',':
            e.preventDefault();
            handleOpenSettings();
            break;
          case 'd':
            e.preventDefault();
            handleToggleBookmark();
            break;
          case '=':
          case '+':
            e.preventDefault();
            handleZoomIn();
            break;
          case '-':
            e.preventDefault();
            handleZoomOut();
            break;
          case '0':
            e.preventDefault();
            handleZoomReset();
            break;
          default:
            if (e.key >= '1' && e.key <= '9') {
              const idx = parseInt(e.key, 10) - 1;
              if (idx < tabs.length) {
                e.preventDefault();
                handleTabClick(tabs[idx].id);
              }
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeTabId,
    tabs,
    handleNewTab,
    handleCloseTab,
    handleTabClick,
    handleToggleBookmark,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
    handleOpenSettings,
  ]);

  return (
    <div className="app">
      {/* Top TabBar with integrated Window Controls & Brand Icon (38px) */}
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabClick={handleTabClick}
        onTabClose={handleCloseTab}
        onNewTab={() => handleNewTab()}
      />

      {/* Navigation Toolbar (44px) */}
      <Toolbar
        url={currentUrl}
        isLoading={activeTab?.isLoading || false}
        canGoBack={activeTab?.canGoBack || false}
        canGoForward={activeTab?.canGoForward || false}
        blockedCount={blockedCount}
        isBookmarked={isBookmarked}
        onNavigate={handleNavigate}
        onBack={handleBack}
        onForward={handleForward}
        onReload={handleReload}
        onNewTab={() => handleNewTab()}
        onToggleBookmark={handleToggleBookmark}
        onOpenHistory={() => setShowHistory(true)}
        onOpenBookmarks={() => setShowBookmarks(true)}
        onOpenSettings={handleOpenSettings}
        onOpenExtensions={() => setShowExtensions(true)}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
      />

      {/* Bookmarks Bar on top for quick access */}
      {showBookmarksBar && bookmarks.length > 0 && !showNewTab && !isSettingsPage && (
        <BookmarksBar
          bookmarks={bookmarks}
          onNavigate={handleNavigate}
          onOpenBookmarksModal={() => setShowBookmarks(true)}
        />
      )}

      {/* Brave-style New Tab Page Dashboard */}
      {showNewTab && !isSettingsPage && activeTabId && (
        <NewTabPage onNavigate={handleNavigate} />
      )}

      {/* Full-Page Settings (aasth://settings) */}
      {isSettingsPage && (
        <SettingsPage onNavigate={handleNavigate} />
      )}

      {/* Quick Modals */}
      <HistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onNavigate={handleNavigate}
      />

      <BookmarksModal
        isOpen={showBookmarks}
        onClose={() => {
          setShowBookmarks(false);
          refreshBookmarks();
        }}
        onNavigate={handleNavigate}
        currentUrl={currentUrl}
        currentTitle={activeTab?.title}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      <ExtensionsModal
        isOpen={showExtensions}
        onClose={() => setShowExtensions(false)}
      />
    </div>
  );
};

export default App;
