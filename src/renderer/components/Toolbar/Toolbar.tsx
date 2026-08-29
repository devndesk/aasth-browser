import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import './Toolbar.css';

interface ToolbarProps {
  url: string;
  isLoading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  blockedCount: number;
  isBookmarked: boolean;
  onNavigate: (url: string) => void;
  onBack: () => void;
  onForward: () => void;
  onReload: () => void;
  onNewTab: () => void;
  onToggleBookmark: () => void;
  onOpenHistory: () => void;
  onOpenBookmarks: () => void;
  onOpenSettings: () => void;
  onOpenExtensions: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  url,
  isLoading,
  canGoBack,
  canGoForward,
  blockedCount,
  isBookmarked,
  onNavigate,
  onBack,
  onForward,
  onReload,
  onNewTab,
  onToggleBookmark,
  onOpenHistory,
  onOpenBookmarks,
  onOpenSettings,
  onOpenExtensions,
  onZoomIn,
  onZoomOut,
  onZoomReset,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showShield, setShowShield] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [shieldActive, setShieldActive] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isFocused) {
      setInputValue(formatDisplayUrl(url));
    }
  }, [url, isFocused]);

  useEffect(() => {
    window.aasth.getShieldStatus().then((status) => {
      setShieldActive(status);
    }).catch(() => {});
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
      onNavigate(inputValue);
    } else if (e.key === 'Escape') {
      setInputValue(formatDisplayUrl(url));
      inputRef.current?.blur();
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    setInputValue(url === 'aasth://newtab' ? '' : url);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setInputValue(formatDisplayUrl(url));
  };

  const handleToggleShield = async () => {
    const next = !shieldActive;
    setShieldActive(next);
    await window.aasth.setShieldStatus(next);
  };

  const isSecure = url?.startsWith('https://');
  const isNewTab = url === 'aasth://newtab' || !url;
  const isSettings = url === 'aasth://settings';

  return (
    <div className="toolbar" id="toolbar">
      {/* Navigation Controls */}
      <div className="toolbar-nav">
        <button
          className={`toolbar-btn ${!canGoBack ? 'toolbar-btn--disabled' : ''}`}
          onClick={onBack}
          disabled={!canGoBack}
          title="Go Back (Alt+Left)"
          id="btn-back"
        >
          <svg width="15" height="15" viewBox="0 0 16 16">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </button>

        <button
          className={`toolbar-btn ${!canGoForward ? 'toolbar-btn--disabled' : ''}`}
          onClick={onForward}
          disabled={!canGoForward}
          title="Go Forward (Alt+Right)"
          id="btn-forward"
        >
          <svg width="15" height="15" viewBox="0 0 16 16">
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </button>

        <button
          className="toolbar-btn"
          onClick={onReload}
          title={isLoading ? 'Stop (Esc)' : 'Reload (Ctrl+R)'}
          id="btn-reload"
        >
          {isLoading ? (
            <svg width="14" height="14" viewBox="0 0 15 15">
              <line x1="2" y1="2" x2="13" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="13" y1="2" x2="2" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 15 15">
              <path d="M13 7.5A5.5 5.5 0 1 1 7.5 2a5.5 5.5 0 0 1 4 1.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
              <path d="M10 2l1.5 1.7L10 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          )}
        </button>

        <button
          className="toolbar-btn"
          onClick={() => onNavigate('aasth://newtab')}
          title="Home (New Tab Page)"
          id="btn-home"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </button>
      </div>

      {/* Omnibox / Address Bar */}
      <div className={`toolbar-omnibox ${isFocused ? 'toolbar-omnibox--focused' : ''}`} id="omnibox">
        <div className="omnibox-security" title={isSecure ? 'Secure connection' : isSettings ? 'Settings' : 'Insecure or local page'}>
          {isSecure ? (
            <svg width="12" height="12" viewBox="0 0 12 12" className="icon-secure">
              <rect x="2" y="5" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1" fill="none" />
              <path d="M4 5V4a2 2 0 1 1 4 0v1" stroke="currentColor" strokeWidth="1" fill="none" />
            </svg>
          ) : isSettings ? (
            <span style={{ fontSize: 11 }}>⚙️</span>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" className="icon-insecure">
              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1" fill="none" />
              <line x1="6" y1="3.5" x2="6" y2="7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <circle cx="6" cy="8.5" r="0.6" fill="currentColor" />
            </svg>
          )}
        </div>

        <input
          ref={inputRef}
          id="address-bar"
          className="omnibox-input"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Search with Aasth or enter URL..."
          autoComplete="off"
          spellCheck={false}
        />

        {/* Bookmark Star Button inside Omnibox */}
        {!isNewTab && !isSettings && (
          <button
            className={`omnibox-star-btn ${isBookmarked ? 'omnibox-star-btn--active' : ''}`}
            onClick={onToggleBookmark}
            title={isBookmarked ? 'Bookmarked (Ctrl+D)' : 'Bookmark this tab (Ctrl+D)'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={isBookmarked ? '#f59e0b' : 'none'} stroke={isBookmarked ? '#f59e0b' : 'currentColor'} strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        )}

        {isLoading && <div className="omnibox-progress" />}
      </div>

      {/* Right side tools */}
      <div className="toolbar-actions">
        {/* Shield Icon with live badge */}
        <div className="dropdown-wrapper">
          <button
            className={`toolbar-btn toolbar-shield ${shieldActive ? 'toolbar-shield--active' : 'toolbar-shield--inactive'}`}
            onClick={() => {
              setShowShield(!showShield);
              setShowMenu(false);
            }}
            title="Aasth Shield — Privacy & Ad Blocker"
            id="btn-shield"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L3 4v4c0 3 2.5 5 5 6 2.5-1 5-3 5-6V4L8 2z" fill="var(--color-brand)" opacity="0.25" stroke="var(--color-brand)" strokeWidth="1.2" />
              <path d="M5.5 8l2 2 3-3" stroke="var(--color-brand)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {blockedCount > 0 && (
              <span className="shield-badge">{blockedCount > 999 ? '999+' : blockedCount}</span>
            )}
          </button>

          {showShield && (
            <div className="shield-popup fade-in" id="shield-popup">
              <div className="shield-popup-header">
                <div className="shield-popup-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 2L3 5v5c0 4 3 6.5 7 8 4-1.5 7-4 7-8V5L10 2z" fill="url(#shieldGrad)" opacity="0.3" />
                    <path d="M10 2L3 5v5c0 4 3 6.5 7 8 4-1.5 7-4 7-8V5L10 2z" stroke="url(#shieldGrad)" strokeWidth="1.5" fill="none" />
                    <path d="M7 10l2 2.5 4-4" stroke="url(#shieldGrad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <defs>
                      <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div>
                  <div className="shield-popup-title">Aasth Shield</div>
                  <div className="shield-popup-subtitle">
                    {shieldActive ? 'Protection is ACTIVE' : 'Protection is PAUSED'}
                  </div>
                </div>
                <label className="toggle-switch" style={{ marginLeft: 'auto' }}>
                  <input type="checkbox" checked={shieldActive} onChange={handleToggleShield} />
                  <span className="toggle-slider" />
                </label>
              </div>

              <div className="shield-popup-stats">
                <div className="shield-stat">
                  <span className="shield-stat-value">{blockedCount}</span>
                  <span className="shield-stat-label">Ads & Trackers Blocked</span>
                </div>
              </div>

              <div className="shield-popup-features">
                <div className={`shield-feature ${shieldActive ? 'shield-feature--on' : ''}`}>
                  <span>🚫 Ad Blocking</span>
                  <span className="shield-on">{shieldActive ? 'ON' : 'OFF'}</span>
                </div>
                <div className={`shield-feature ${shieldActive ? 'shield-feature--on' : ''}`}>
                  <span>🔒 Tracker Blocking</span>
                  <span className="shield-on">{shieldActive ? 'ON' : 'OFF'}</span>
                </div>
                <div className={`shield-feature ${shieldActive ? 'shield-feature--on' : ''}`}>
                  <span>⬆️ HTTPS Upgrade</span>
                  <span className="shield-on">{shieldActive ? 'ON' : 'OFF'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Bookmarks Button */}
        <button
          className="toolbar-btn"
          onClick={onOpenBookmarks}
          title="Bookmarks (Ctrl+B)"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>

        {/* Profile Button */}
        <button
          className="toolbar-btn"
          title="Profile"
          id="btn-profile"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>

        {/* Menu (3 dots) dropdown */}
        <div className="dropdown-wrapper">
          <button
            className="toolbar-btn"
            onClick={() => {
              setShowMenu(!showMenu);
              setShowShield(false);
            }}
            title="Aasth Menu"
            id="btn-menu"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>

          {showMenu && (
            <div className="toolbar-menu-dropdown fade-in">
              <div className="menu-item" onClick={() => { onNewTab(); setShowMenu(false); }}>
                <span>✨ New Tab</span>
                <kbd>Ctrl+T</kbd>
              </div>
              <div className="menu-divider" />
              <div className="menu-item" onClick={() => { onOpenHistory(); setShowMenu(false); }}>
                <span>📜 History</span>
                <kbd>Ctrl+H</kbd>
              </div>
              <div className="menu-item" onClick={() => { onOpenBookmarks(); setShowMenu(false); }}>
                <span>⭐ Bookmarks</span>
                <kbd>Ctrl+B</kbd>
              </div>
              <div className="menu-item" onClick={() => { onOpenExtensions(); setShowMenu(false); }}>
                <span>🧩 Extensions</span>
              </div>
              <div className="menu-divider" />
              <div className="menu-zoom-row">
                <span>Zoom</span>
                <div className="zoom-controls">
                  <button onClick={onZoomOut} title="Zoom Out">−</button>
                  <button onClick={onZoomReset} title="Reset Zoom">100%</button>
                  <button onClick={onZoomIn} title="Zoom In">+</button>
                </div>
              </div>
              <div className="menu-divider" />
              <div className="menu-item" onClick={() => { onOpenSettings(); setShowMenu(false); }}>
                <span>⚙️ Settings</span>
                <kbd>Ctrl+,</kbd>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function formatDisplayUrl(url: string): string {
  if (!url || url === 'aasth://newtab' || url.startsWith('about:')) return '';
  return url;
}

export default Toolbar;
