import React, { useState, useEffect } from 'react';
import './SettingsModal.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [searchEngine, setSearchEngine] = useState('brave');
  const [adBlocker, setAdBlocker] = useState(true);
  const [trackerBlocker, setTrackerBlocker] = useState(true);
  const [httpsUpgrade, setHttpsUpgrade] = useState(true);
  const [tabSleepMinutes, setTabSleepMinutes] = useState(30);
  const [theme, setTheme] = useState('dark');
  const [appVersion, setAppVersion] = useState('1.0.0');
  const [clearedMsg, setClearedMsg] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      const se = await window.aasth.getSetting('searchEngine', 'brave');
      const ab = await window.aasth.getSetting('adBlockerEnabled', true);
      const tb = await window.aasth.getSetting('trackerBlockerEnabled', true);
      const hu = await window.aasth.getSetting('httpsUpgradeEnabled', true);
      const sm = await window.aasth.getSetting('tabSleepMinutes', 30);
      const th = await window.aasth.getSetting('theme', 'dark');
      const ver = await window.aasth.getVersion();

      setSearchEngine(se as string);
      setAdBlocker(ab as boolean);
      setTrackerBlocker(tb as boolean);
      setHttpsUpgrade(hu as boolean);
      setTabSleepMinutes(Number(sm));
      setTheme(th as string);
      if (ver) setAppVersion(ver);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdate = async (key: string, value: unknown) => {
    await window.aasth.setSetting(key, value);
  };

  const handleSearchEngineChange = (val: string) => {
    setSearchEngine(val);
    handleUpdate('searchEngine', val);
  };

  const handleAdBlockerToggle = () => {
    const next = !adBlocker;
    setAdBlocker(next);
    handleUpdate('adBlockerEnabled', next);
  };

  const handleTrackerBlockerToggle = () => {
    const next = !trackerBlocker;
    setTrackerBlocker(next);
    handleUpdate('trackerBlockerEnabled', next);
  };

  const handleHttpsUpgradeToggle = () => {
    const next = !httpsUpgrade;
    setHttpsUpgrade(next);
    handleUpdate('httpsUpgradeEnabled', next);
  };

  const handleTabSleepChange = (val: number) => {
    setTabSleepMinutes(val);
    handleUpdate('tabSleepMinutes', val);
  };

  const handleClearData = async () => {
    if (window.confirm('Clear all browsing history and cache?')) {
      await window.aasth.clearHistory();
      setClearedMsg(true);
      setTimeout(() => setClearedMsg(false), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop fade-in" onClick={onClose}>
      <div className="modal-card settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge modal-icon-settings">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
            <div>
              <h2 className="modal-title">Settings</h2>
              <p className="modal-subtitle">Customize privacy, performance, and preferences</p>
            </div>
          </div>

          <button className="modal-close-btn" onClick={onClose} title="Close (Esc)">
            ✕
          </button>
        </div>

        <div className="modal-body settings-body">
          {/* Section: Search Engine */}
          <div className="settings-section">
            <h3 className="settings-section-title">🔍 Search Engine</h3>
            <div className="settings-row">
              <div className="settings-label">
                <span>Default Search Engine</span>
                <span className="settings-desc">Used when searching from the address bar or New Tab</span>
              </div>
              <select
                className="settings-select"
                value={searchEngine}
                onChange={(e) => handleSearchEngineChange(e.target.value)}
              >
                <option value="brave">Brave Search (Private & Independent)</option>
                <option value="google">Google</option>
                <option value="duckduckgo">DuckDuckGo</option>
                <option value="bing">Microsoft Bing</option>
                <option value="ecosia">Ecosia</option>
              </select>
            </div>
          </div>

          {/* Section: Privacy & Shields */}
          <div className="settings-section">
            <h3 className="settings-section-title">🛡️ Aasth Shield & Privacy</h3>

            <div className="settings-row">
              <div className="settings-label">
                <span>Ad Blocking</span>
                <span className="settings-desc">Block invasive banners, popups, and video ads</span>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={adBlocker} onChange={handleAdBlockerToggle} />
                <span className="toggle-slider" />
              </label>
            </div>

            <div className="settings-row">
              <div className="settings-label">
                <span>Tracker & Telemetry Blocking</span>
                <span className="settings-desc">Prevent analytics and cross-site user fingerprinting</span>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={trackerBlocker} onChange={handleTrackerBlockerToggle} />
                <span className="toggle-slider" />
              </label>
            </div>

            <div className="settings-row">
              <div className="settings-label">
                <span>Automatic HTTPS Upgrade</span>
                <span className="settings-desc">Upgrade insecure HTTP connections to encrypted HTTPS</span>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={httpsUpgrade} onChange={handleHttpsUpgradeToggle} />
                <span className="toggle-slider" />
              </label>
            </div>
          </div>

          {/* Section: RAM & Performance */}
          <div className="settings-section">
            <h3 className="settings-section-title">⚡ RAM & Performance Saver</h3>

            <div className="settings-row">
              <div className="settings-label">
                <span>Tab Sleeping / Memory Discard</span>
                <span className="settings-desc">Puts inactive background tabs to sleep to drastically reduce RAM usage</span>
              </div>
              <select
                className="settings-select"
                value={tabSleepMinutes}
                onChange={(e) => handleTabSleepChange(Number(e.target.value))}
              >
                <option value={15}>After 15 minutes</option>
                <option value={30}>After 30 minutes (Recommended)</option>
                <option value={60}>After 1 hour</option>
                <option value={0}>Never sleep tabs</option>
              </select>
            </div>
          </div>

          {/* Section: Data & Storage */}
          <div className="settings-section">
            <h3 className="settings-section-title">🗑️ Browsing Data</h3>

            <div className="settings-row">
              <div className="settings-label">
                <span>Clear History & Cached Records</span>
                <span className="settings-desc">Permanently remove saved URLs and local storage history</span>
              </div>
              <button className="btn-secondary btn-danger-hover" onClick={handleClearData}>
                {clearedMsg ? '✓ Cleared!' : 'Clear Browsing Data'}
              </button>
            </div>
          </div>

          {/* Section: About */}
          <div className="settings-section settings-about">
            <div className="about-info">
              <strong>Aasth Browser</strong> — v{appVersion}
              <p>Fast, Private, Chromium-based browser with Brave Search</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
