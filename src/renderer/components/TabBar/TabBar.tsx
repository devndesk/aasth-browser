import React, { useRef } from 'react';
import { TabInfo } from '../../global';
import './TabBar.css';

interface TabBarProps {
  tabs: TabInfo[];
  activeTabId: string | null;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onNewTab: () => void;
}

const TabBar: React.FC<TabBarProps> = ({ tabs, activeTabId, onTabClick, onTabClose, onNewTab }) => {
  const tabListRef = useRef<HTMLDivElement>(null);

  const handleTabClose = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    onTabClose(tabId);
  };

  const getDisplayTitle = (tab: TabInfo) => {
    if (tab.isSleeping) return `💤 ${tab.title}`;
    if (tab.url === 'aasth://settings') return 'Settings';
    if (tab.isLoading) return tab.title || 'Loading...';
    return tab.title || 'New Tab';
  };

  const getFaviconUrl = (tab: TabInfo) => {
    if (tab.favicon) return tab.favicon;
    if (tab.url && !tab.url.startsWith('about:') && !tab.url.startsWith('aasth:')) {
      try {
        const domain = new URL(tab.url).origin;
        return `${domain}/favicon.ico`;
      } catch {}
    }
    return null;
  };

  // Window control handlers
  const handleMinimize = () => window.aasth.minimize();
  const handleMaximize = () => window.aasth.maximize();
  const handleClose = () => window.aasth.close();

  return (
    <div className="tabbar" id="tabbar">
      {/* App Logo & Brand Icon */}
      <div className="tabbar-brand">
        <div className="brand-gem" title="Aasth Browser" style={{ background: 'transparent' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <defs>
              <mask id="cut8">
                <rect width="24" height="24" fill="white" />
                <line x1="2" y1="22" x2="22" y2="2" stroke="black" strokeWidth="3" />
              </mask>
            </defs>
            <g mask="url(#cut8)" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="7" r="5" />
              <circle cx="12" cy="17" r="5" />
            </g>
          </svg>
        </div>
      </div>

      {/* Tabs list */}
      <div className="tabbar-list" ref={tabListRef}>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            id={`tab-${tab.id}`}
            className={`tab ${tab.id === activeTabId ? 'tab--active' : ''} ${tab.isSleeping ? 'tab--sleeping' : ''}`}
            onClick={() => onTabClick(tab.id)}
            title={tab.url}
          >
            <div className="tab-favicon">
              {tab.isLoading ? (
                <div className="tab-spinner" />
              ) : tab.url === 'aasth://settings' ? (
                <span style={{ fontSize: 11 }}>⚙️</span>
              ) : (
                <FaviconImg url={getFaviconUrl(tab)} />
              )}
            </div>

            <span className="tab-title">{getDisplayTitle(tab)}</span>

            <button
              className="tab-close"
              onClick={(e) => handleTabClose(e, tab.id)}
              title="Close tab (Ctrl+W)"
              id={`close-tab-${tab.id}`}
            >
              <svg width="10" height="10" viewBox="0 0 10 10">
                <line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>

            {tab.id === activeTabId && <div className="tab-indicator" />}
          </div>
        ))}

        {/* New Tab (+) button */}
        <button
          className="tabbar-new"
          onClick={onNewTab}
          title="New Tab (Ctrl+T)"
          id="btn-new-tab"
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <line x1="6" y1="1" x2="6" y2="11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="1" y1="6" x2="11" y2="6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Drag region in the empty space between tabs and window controls */}
      <div className="tabbar-drag-area" />

      {/* Chrome/Brave-style Window Control Buttons */}
      <div className="window-controls">
        <button className="window-control-btn btn-minimize" onClick={handleMinimize} title="Minimize">
          <svg width="10" height="2" viewBox="0 0 10 2">
            <rect width="10" height="2" fill="currentColor" rx="1" />
          </svg>
        </button>
        <button className="window-control-btn btn-maximize" onClick={handleMaximize} title="Maximize">
          <svg width="10" height="10" viewBox="0 0 10 10">
            <rect x="0.5" y="0.5" width="9" height="9" stroke="currentColor" strokeWidth="1" fill="none" rx="1.5" />
          </svg>
        </button>
        <button className="window-control-btn btn-close" onClick={handleClose} title="Close">
          <svg width="10" height="10" viewBox="0 0 10 10">
            <line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const FaviconImg: React.FC<{ url: string | null }> = ({ url }) => {
  if (!url) return <DefaultFavicon />;

  return (
    <img
      src={url}
      width={14}
      height={14}
      alt=""
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
    />
  );
};

const DefaultFavicon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="5.5" stroke="var(--color-text-muted)" strokeWidth="1" />
    <line x1="1.5" y1="7" x2="12.5" y2="7" stroke="var(--color-text-muted)" strokeWidth="1" />
    <path d="M7 1.5 Q10 7 7 12.5 Q4 7 7 1.5" stroke="var(--color-text-muted)" strokeWidth="1" fill="none" />
  </svg>
);

export default TabBar;
