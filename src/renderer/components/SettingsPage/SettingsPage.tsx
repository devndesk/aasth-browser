import React, { useState, useEffect } from 'react';
import './SettingsPage.css';

interface SettingsPageProps {
  onNavigate: (url: string) => void;
}

type SettingsTab =
  | 'get-started'
  | 'appearance'
  | 'shields'
  | 'search'
  | 'performance'
  | 'extensions'
  | 'data'
  | 'about';

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const [activeCategory, setActiveCategory] = useState<SettingsTab>('get-started');
  const [searchFilter, setSearchFilter] = useState('');
  
  // Settings values
  const [searchEngine, setSearchEngine] = useState('brave');
  const [adBlocker, setAdBlocker] = useState(true);
  const [trackerBlocker, setTrackerBlocker] = useState(true);
  const [httpsUpgrade, setHttpsUpgrade] = useState(true);
  const [tabSleepMinutes, setTabSleepMinutes] = useState(30);
  const [theme, setTheme] = useState('dark');
  const [startupOption, setStartupOption] = useState<'newtab' | 'continue'>('newtab');
  const [extensions, setExtensions] = useState<any[]>([]);
  const [appVersion, setAppVersion] = useState('1.0.0');
  const [clearedMsg, setClearedMsg] = useState(false);

  // Additional mock settings
  const [showBookmarksBar, setShowBookmarksBar] = useState(true);
  const [showHomeBtn, setShowHomeBtn] = useState(true);
  const [fontSize, setFontSize] = useState('medium');
  const [pageZoom, setPageZoom] = useState('100%');
  
  const [blockFingerprinting, setBlockFingerprinting] = useState(true);
  const [blockCookies, setBlockCookies] = useState(true);
  const [blockWebRTC, setBlockWebRTC] = useState(false);

  const [memorySaver, setMemorySaver] = useState(true);
  const [energySaver, setEnergySaver] = useState(true);
  const [preloadPages, setPreloadPages] = useState(true);
  const [searchSuggestions, setSearchSuggestions] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const se = await window.aasth.getSetting('searchEngine', 'brave');
      const ab = await window.aasth.getSetting('adBlockerEnabled', true);
      const tb = await window.aasth.getSetting('trackerBlockerEnabled', true);
      const hu = await window.aasth.getSetting('httpsUpgradeEnabled', true);
      const sm = await window.aasth.getSetting('tabSleepMinutes', 30);
      const th = await window.aasth.getSetting('theme', 'dark');
      const extList = await window.aasth.getExtensions();
      const ver = await window.aasth.getVersion();

      if (se) setSearchEngine(se as string);
      if (ab !== undefined) setAdBlocker(ab as boolean);
      if (tb !== undefined) setTrackerBlocker(tb as boolean);
      if (hu !== undefined) setHttpsUpgrade(hu as boolean);
      if (sm) setTabSleepMinutes(Number(sm));
      if (th) setTheme(th as string);
      if (extList) setExtensions(extList);
      if (ver) setAppVersion(ver);
    } catch (e) {
      console.error('Settings load error:', e);
    }
  };

  const updateSetting = async (key: string, val: unknown) => {
    await window.aasth.setSetting(key, val);
  };

  const handleClearData = async () => {
    if (window.confirm('Clear all browsing history and cache?')) {
      await window.aasth.clearHistory();
      setClearedMsg(true);
      setTimeout(() => setClearedMsg(false), 3000);
    }
  };

  const handleLoadExtension = async () => {
    try {
      const ext = await window.aasth.loadExtension();
      if (ext) {
        setExtensions((prev) => [...prev.filter((e) => e.id !== ext.id), ext]);
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to load extension');
    }
  };

  const handleRemoveExtension = async (id: string) => {
    await window.aasth.removeExtension(id);
    setExtensions((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="settings-page" id="settings-page">
      {/* Settings Top Header */}
      <div className="settings-page-header">
        <div className="settings-header-title">
          <div className="settings-header-gem">⚙️</div>
          <h2>Settings</h2>
        </div>

        <div className="settings-search-bar">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search settings..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="settings-page-content">
        {/* Left Sidebar Menu (Brave-style) */}
        <div className="settings-sidebar">
          <button
            className={`sidebar-nav-item ${activeCategory === 'get-started' ? 'sidebar-nav-item--active' : ''}`}
            onClick={() => setActiveCategory('get-started')}
          >
            <span>🚀 Get Started</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeCategory === 'appearance' ? 'sidebar-nav-item--active' : ''}`}
            onClick={() => setActiveCategory('appearance')}
          >
            <span>🎨 Appearance</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeCategory === 'shields' ? 'sidebar-nav-item--active' : ''}`}
            onClick={() => setActiveCategory('shields')}
          >
            <span>🛡️ Shields & Privacy</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeCategory === 'search' ? 'sidebar-nav-item--active' : ''}`}
            onClick={() => setActiveCategory('search')}
          >
            <span>🔍 Search Engine</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeCategory === 'performance' ? 'sidebar-nav-item--active' : ''}`}
            onClick={() => setActiveCategory('performance')}
          >
            <span>⚡ Performance & RAM</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeCategory === 'extensions' ? 'sidebar-nav-item--active' : ''}`}
            onClick={() => setActiveCategory('extensions')}
          >
            <span>🧩 Extensions</span>
          </button>

          <button
            className={`sidebar-nav-item ${activeCategory === 'data' ? 'sidebar-nav-item--active' : ''}`}
            onClick={() => setActiveCategory('data')}
          >
            <span>🗑️ Browsing Data</span>
          </button>

          <div className="sidebar-divider" />

          <button
            className={`sidebar-nav-item ${activeCategory === 'about' ? 'sidebar-nav-item--active' : ''}`}
            onClick={() => setActiveCategory('about')}
          >
            <span>ℹ️ About Aasth</span>
          </button>
        </div>

        {/* Right Content Panels */}
        <div className="settings-main-panel">
          {/* Category: Get Started */}
          {(activeCategory === 'get-started' || searchFilter) && (
            <div className="settings-group">
              <h3 className="settings-group-title">Get Started</h3>

              <div className="settings-card">
                <div className="settings-card-row">
                  <div>
                    <div className="settings-card-label">On startup</div>
                    <div className="settings-card-desc">Choose what opens when you launch Aasth Browser</div>
                  </div>
                </div>

                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="startup"
                      checked={startupOption === 'newtab'}
                      onChange={() => setStartupOption('newtab')}
                    />
                    <span>Open the New Tab dashboard</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="startup"
                      checked={startupOption === 'continue'}
                      onChange={() => setStartupOption('continue')}
                    />
                    <span>Continue where you left off</span>
                  </label>
                </div>
              </div>

              <div className="settings-card">
                <div className="settings-card-row">
                  <div>
                    <div className="settings-card-label">Default Browser</div>
                    <div className="settings-card-desc">Aasth is ready as your fast daily driver</div>
                  </div>
                  <span className="badge-pill">Active</span>
                </div>
              </div>
            </div>
          )}

          {/* Category: Appearance */}
          {(activeCategory === 'appearance' || searchFilter) && (
            <div className="settings-group">
              <h3 className="settings-group-title">Appearance</h3>

              <div className="settings-card">
                <div className="settings-card-row">
                  <div>
                    <div className="settings-card-label">Color Theme</div>
                    <div className="settings-card-desc">Select dark mode palette</div>
                  </div>
                  <select
                    className="settings-select-field"
                    value={theme}
                    onChange={(e) => {
                      setTheme(e.target.value);
                      updateSetting('theme', e.target.value);
                    }}
                  >
                    <option value="dark">Dark Nebula (Default)</option>
                    <option value="midnight">Midnight Space</option>
                    <option value="cyberpunk">Cyberpunk Violet</option>
                  </select>
                </div>

                <div className="settings-card-row">
                  <div>
                    <div className="settings-card-label">New Tab Wallpaper</div>
                    <div className="settings-card-desc">Switch between curated HD landscapes on the dashboard</div>
                  </div>
                  <button className="btn-secondary" onClick={() => onNavigate('aasth://newtab')}>
                    Go to Dashboard ↗
                  </button>
                </div>

                <div className="settings-card-row">
                  <div>
                    <div className="settings-card-label">Show Bookmarks Bar</div>
                    <div className="settings-card-desc">Display bookmarks under the address bar</div>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={showBookmarksBar} onChange={(e) => setShowBookmarksBar(e.target.checked)} />
                    <span className="toggle-slider" />
                  </label>
                </div>
                
                <div className="settings-card-row">
                  <div>
                    <div className="settings-card-label">Show Home Button</div>
                    <div className="settings-card-desc">Show the home button on the toolbar</div>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={showHomeBtn} onChange={(e) => setShowHomeBtn(e.target.checked)} />
                    <span className="toggle-slider" />
                  </label>
                </div>

                <div className="settings-card-row">
                  <div>
                    <div className="settings-card-label">Font Size</div>
                    <div className="settings-card-desc">Customize default web page text size</div>
                  </div>
                  <select className="settings-select-field" value={fontSize} onChange={(e) => setFontSize(e.target.value)}>
                    <option value="small">Small</option>
                    <option value="medium">Medium (Recommended)</option>
                    <option value="large">Large</option>
                    <option value="very-large">Very Large</option>
                  </select>
                </div>

                <div className="settings-card-row">
                  <div>
                    <div className="settings-card-label">Page Zoom</div>
                    <div className="settings-card-desc">Set default zoom level for all websites</div>
                  </div>
                  <select className="settings-select-field" value={pageZoom} onChange={(e) => setPageZoom(e.target.value)}>
                    <option value="80%">80%</option>
                    <option value="90%">90%</option>
                    <option value="100%">100%</option>
                    <option value="110%">110%</option>
                    <option value="125%">125%</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Category: Shields & Privacy */}
          {(activeCategory === 'shields' || searchFilter) && (
            <div className="settings-group">
              <h3 className="settings-group-title">🛡️ Aasth Shield & Privacy Protection</h3>

              <div className="settings-card">
                <div className="settings-card-row">
                  <div>
                    <div className="settings-card-label">Block Ads & Popups</div>
                    <div className="settings-card-desc">Prevents banners, video ads, and intrusive popups</div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={adBlocker}
                      onChange={(e) => {
                        setAdBlocker(e.target.checked);
                        updateSetting('adBlockerEnabled', e.target.checked);
                      }}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>

                <div className="settings-card-row">
                  <div>
                    <div className="settings-card-label">Block Trackers & Telemetry</div>
                    <div className="settings-card-desc">Stops background analytics, Hotjar, Google Tag Manager, and user trackers</div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={trackerBlocker}
                      onChange={(e) => {
                        setTrackerBlocker(e.target.checked);
                        updateSetting('trackerBlockerEnabled', e.target.checked);
                      }}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>

                <div className="settings-card-row">
                  <div>
                    <div className="settings-card-label">Upgrade Connections to HTTPS</div>
                    <div className="settings-card-desc">Automatically encrypts insecure HTTP requests to HTTPS</div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={httpsUpgrade}
                      onChange={(e) => {
                        setHttpsUpgrade(e.target.checked);
                        updateSetting('httpsUpgradeEnabled', e.target.checked);
                      }}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>

                <div className="settings-card-row">
                  <div>
                    <div className="settings-card-label">Block Fingerprinting</div>
                    <div className="settings-card-desc">Prevent sites from identifying you based on your browser and device configuration</div>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={blockFingerprinting} onChange={(e) => setBlockFingerprinting(e.target.checked)} />
                    <span className="toggle-slider" />
                  </label>
                </div>

                <div className="settings-card-row">
                  <div>
                    <div className="settings-card-label">Block Cross-Site Cookies</div>
                    <div className="settings-card-desc">Prevent third-party trackers from following you across websites</div>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={blockCookies} onChange={(e) => setBlockCookies(e.target.checked)} />
                    <span className="toggle-slider" />
                  </label>
                </div>

                <div className="settings-card-row">
                  <div>
                    <div className="settings-card-label">Block WebRTC IP Leak</div>
                    <div className="settings-card-desc">Prevent sites from discovering your true IP address through WebRTC</div>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={blockWebRTC} onChange={(e) => setBlockWebRTC(e.target.checked)} />
                    <span className="toggle-slider" />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Category: Search Engine */}
          {(activeCategory === 'search' || searchFilter) && (
            <div className="settings-group">
              <h3 className="settings-group-title">🔍 Search Engine</h3>

              <div className="settings-card">
                <div className="settings-card-row">
                  <div>
                    <div className="settings-card-label">Search engine used in address bar & New Tab</div>
                    <div className="settings-card-desc">Default query handler when searching keywords</div>
                  </div>
                  <select
                    className="settings-select-field"
                    value={searchEngine}
                    onChange={(e) => {
                      setSearchEngine(e.target.value);
                      updateSetting('searchEngine', e.target.value);
                    }}
                  >
                    <option value="brave">Brave Search (Private & Independent)</option>
                    <option value="google">Google</option>
                    <option value="duckduckgo">DuckDuckGo</option>
                    <option value="bing">Microsoft Bing</option>
                    <option value="ecosia">Ecosia</option>
                  </select>
                </div>

                <div className="settings-card-row">
                  <div>
                    <div className="settings-card-label">Show search suggestions</div>
                    <div className="settings-card-desc">Send typed text to your default search engine to show autocomplete suggestions</div>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={searchSuggestions} onChange={(e) => setSearchSuggestions(e.target.checked)} />
                    <span className="toggle-slider" />
                  </label>
                </div>

                <div className="settings-card-row">
                  <div>
                    <div className="settings-card-label">Manage search engines and site search</div>
                    <div className="settings-card-desc">Add, edit, or remove custom search engines</div>
                  </div>
                  <button className="btn-secondary">Manage</button>
                </div>
              </div>
            </div>
          )}

          {/* Category: Performance & RAM */}
          {(activeCategory === 'performance' || searchFilter) && (
            <div className="settings-group">
              <h3 className="settings-group-title">⚡ Performance & RAM Saver</h3>

              <div className="settings-card">
                <div className="settings-card-row">
                  <div>
                    <div className="settings-card-label">Smart Tab Sleeping</div>
                    <div className="settings-card-desc">Frees RAM memory from background inactive tabs</div>
                  </div>
                  <select
                    className="settings-select-field"
                    value={tabSleepMinutes}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setTabSleepMinutes(v);
                      updateSetting('tabSleepMinutes', v);
                    }}
                  >
                    <option value={15}>After 15 minutes</option>
                    <option value={30}>After 30 minutes (Recommended)</option>
                    <option value={60}>After 1 hour</option>
                    <option value={0}>Never sleep tabs</option>
                  </select>
                </div>

                <div className="settings-card-row">
                  <div>
                    <div className="settings-card-label">Memory Saver</div>
                    <div className="settings-card-desc">Frees up memory from inactive tabs so active tabs and other apps run faster</div>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={memorySaver} onChange={(e) => setMemorySaver(e.target.checked)} />
                    <span className="toggle-slider" />
                  </label>
                </div>

                <div className="settings-card-row">
                  <div>
                    <div className="settings-card-label">Energy Saver</div>
                    <div className="settings-card-desc">Conserve battery power by limiting background activity and visual effects</div>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={energySaver} onChange={(e) => setEnergySaver(e.target.checked)} />
                    <span className="toggle-slider" />
                  </label>
                </div>

                <div className="settings-card-row">
                  <div>
                    <div className="settings-card-label">Preload pages</div>
                    <div className="settings-card-desc">Preloads pages that you might visit to make browsing and searching faster</div>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={preloadPages} onChange={(e) => setPreloadPages(e.target.checked)} />
                    <span className="toggle-slider" />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Category: Extensions */}
          {(activeCategory === 'extensions' || searchFilter) && (
            <div className="settings-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 className="settings-group-title" style={{ margin: 0 }}>🧩 Chrome Extensions</h3>
                <button className="btn-brand" onClick={handleLoadExtension}>
                  + Load Unpacked Extension
                </button>
              </div>

              <div className="settings-card">
                {extensions.length === 0 ? (
                  <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>
                    No Chrome extensions installed yet. Click "+ Load Unpacked Extension" to install any unpacked extension directory.
                  </div>
                ) : (
                  extensions.map((ext) => (
                    <div key={ext.id} className="settings-card-row">
                      <div>
                        <div className="settings-card-label">{ext.name} <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>v{ext.version}</span></div>
                        <div className="settings-card-desc">{ext.path}</div>
                      </div>
                      <button className="btn-secondary btn-danger-hover" onClick={() => handleRemoveExtension(ext.id)}>
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Category: Browsing Data */}
          {(activeCategory === 'data' || searchFilter) && (
            <div className="settings-group">
              <h3 className="settings-group-title">🗑️ Browsing Data</h3>

              <div className="settings-card">
                <div className="settings-card-row">
                  <div>
                    <div className="settings-card-label">Clear History & Cached Records</div>
                    <div className="settings-card-desc">Permanently wipe all visited history and local storage records</div>
                  </div>
                  <button className="btn-secondary btn-danger-hover" onClick={handleClearData}>
                    {clearedMsg ? '✓ Cleared!' : 'Clear Browsing Data'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Category: About */}
          {(activeCategory === 'about' || searchFilter) && (
            <div className="settings-group">
              <h3 className="settings-group-title">About Aasth</h3>

              <div className="settings-card">
                <div className="settings-card-row">
                  <div>
                    <div className="settings-card-label">Aasth Browser</div>
                    <div className="settings-card-desc">Fast, Private Chromium-Based Personal Web Browser</div>
                  </div>
                  <span className="badge-pill">v{appVersion}</span>
                </div>
                <div className="settings-card-row">
                  <div>
                    <div className="settings-card-label">Rendering & JS Engine</div>
                    <div className="settings-card-desc">Chromium Blink Engine + V8 JavaScript Engine</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
