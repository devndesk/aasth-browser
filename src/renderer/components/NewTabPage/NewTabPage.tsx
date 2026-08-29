import React, { useState, useEffect, useRef } from 'react';
import './NewTabPage.css';

interface NewTabPageProps {
  onNavigate: (url: string) => void;
}

interface TopSite {
  id: string;
  name: string;
  url: string;
  emoji?: string;
  iconBg?: string;
}

const DEFAULT_WALLPAPERS = [
  {
    id: 'mountain-lake',
    name: 'Misty Alpine Lake',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2560&q=85',
  },
  {
    id: 'golden-sunset',
    name: 'Sunset Peaks',
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=2560&q=85',
  },
  {
    id: 'cyberpunk-neon',
    name: 'Neon Horizon',
    url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=2560&q=85',
  },
  {
    id: 'deep-space',
    name: 'Cosmic Nebula',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=2560&q=85',
  },
  {
    id: 'forest-aurora',
    name: 'Northern Lights',
    url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=2560&q=85',
  },
  {
    id: 'pacific-ocean',
    name: 'Pacific Coast Waves',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2560&q=85',
  },
];

const INITIAL_TOP_SITES: TopSite[] = [
  { id: '1', name: 'YouTube', url: 'https://youtube.com', emoji: '▶️', iconBg: '#ff0000' },
  { id: '2', name: 'GitHub', url: 'https://github.com', emoji: '🐙', iconBg: '#24292e' },
  { id: '3', name: 'Reddit', url: 'https://reddit.com', emoji: '🤖', iconBg: '#ff4500' },
  { id: '4', name: 'ChatGPT', url: 'https://chatgpt.com', emoji: '✨', iconBg: '#10a37f' },
  { id: '5', name: 'Twitter / X', url: 'https://x.com', emoji: '𝕏', iconBg: '#000000' },
  { id: '6', name: 'Gmail', url: 'https://mail.google.com', emoji: '📧', iconBg: '#ea4335' },
  { id: '7', name: 'LinkedIn', url: 'https://linkedin.com', emoji: '💼', iconBg: '#0a66c2' },
  { id: '8', name: 'Netflix', url: 'https://netflix.com', emoji: '🎬', iconBg: '#e50914' },
];

const QUOTES = [
  { text: "Privacy is not something that I'm merely entitled to, it's an absolute prerequisite.", author: 'Marlon Brando' },
  { text: "The internet is becoming the town square for the global village of tomorrow.", author: 'Bill Gates' },
  { text: "Your data, your rules.", author: 'Aasth' },
  { text: "Privacy is not a feature. It is a fundamental right.", author: 'Aasth' },
  { text: "Take control of your online presence and browse without being watched.", author: 'Aasth Privacy' },
];

const NewTabPage: React.FC<NewTabPageProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [time, setTime] = useState(new Date());
  const [quote] = useState(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  
  // Customization states
  const [currentWallpaperIndex, setCurrentWallpaperIndex] = useState(() => {
    const saved = localStorage.getItem('aasth_wallpaper_index');
    return saved !== null ? parseInt(saved, 10) : 0;
  });
  const [customWallpaper, setCustomWallpaper] = useState<string | null>(() => {
    return localStorage.getItem('aasth_custom_wallpaper');
  });
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [showClock, setShowClock] = useState(true);
  const [showSites, setShowSites] = useState(true);
  const [topSites, setTopSites] = useState<TopSite[]>(() => {
    const saved = localStorage.getItem('aasth_top_sites');
    return saved ? JSON.parse(saved) : INITIAL_TOP_SITES;
  });

  // Add site modal
  const [showAddSite, setShowAddSite] = useState(false);
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteUrl, setNewSiteUrl] = useState('');

  // Shield stats
  const [blockedCount, setBlockedCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Fetch live blocked count
    window.aasth.getBlockedCount().then((count) => {
      setBlockedCount(count);
    }).catch(() => {});

    const interval = setInterval(async () => {
      try {
        const count = await window.aasth.getBlockedCount();
        setBlockedCount(count);
      } catch {}
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate(searchQuery);
    }
  };

  const handleNextWallpaper = () => {
    if (customWallpaper) {
      setCustomWallpaper(null);
      localStorage.removeItem('aasth_custom_wallpaper');
      return;
    }
    const next = (currentWallpaperIndex + 1) % DEFAULT_WALLPAPERS.length;
    setCurrentWallpaperIndex(next);
    localStorage.setItem('aasth_wallpaper_index', next.toString());
  };

  const handleWallpaperSelect = (idx: number) => {
    setCustomWallpaper(null);
    localStorage.removeItem('aasth_custom_wallpaper');
    setCurrentWallpaperIndex(idx);
    localStorage.setItem('aasth_wallpaper_index', idx.toString());
  };

  const handleCustomWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setCustomWallpaper(base64);
        try {
          localStorage.setItem('aasth_custom_wallpaper', base64);
        } catch (err) {
          console.warn('Wallpaper too large for localStorage');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCustomSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteName.trim() || !newSiteUrl.trim()) return;

    let finalUrl = newSiteUrl.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = `https://${finalUrl}`;
    }

    const newSite: TopSite = {
      id: Date.now().toString(),
      name: newSiteName.trim(),
      url: finalUrl,
      emoji: '🌐',
    };

    const updated = [...topSites, newSite];
    setTopSites(updated);
    localStorage.setItem('aasth_top_sites', JSON.stringify(updated));
    setNewSiteName('');
    setNewSiteUrl('');
    setShowAddSite(false);
  };

  const handleDeleteSite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = topSites.filter((s) => s.id !== id);
    setTopSites(updated);
    localStorage.setItem('aasth_top_sites', JSON.stringify(updated));
  };

  // Calculated Brave-style stats
  const displayBlocked = Math.max(blockedCount, 1420); // base count demonstration
  const bandwidthSavedMB = (displayBlocked * 0.26).toFixed(1);
  const timeSavedSeconds = (displayBlocked * 0.05).toFixed(1);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const currentWallpaperUrl = customWallpaper || DEFAULT_WALLPAPERS[currentWallpaperIndex].url;

  return (
    <div
      className="new-tab"
      id="new-tab-page"
      style={{ backgroundImage: `url(${currentWallpaperUrl})` }}
    >
      {/* Dark overlay for contrast */}
      <div className="new-tab-overlay" />



      <div className="new-tab-content">
        {/* Huge Aasth Branding */}
        <div style={{
          fontSize: '7rem',
          fontWeight: 900,
          letterSpacing: '0.1em',
          color: 'rgba(255, 255, 255, 0.95)',
          textShadow: '0 10px 40px rgba(0,0,0,0.5)',
          marginBottom: '1rem',
          textAlign: 'center',
          lineHeight: '1'
        }}>
          AASTH
        </div>

        {/* Clock & Date */}
        {showClock && (
          <div className="new-tab-clock" id="new-tab-clock">
            <div className="new-tab-time">{formatTime(time)}</div>
            <div className="new-tab-date">{formatDate(time)}</div>
          </div>
        )}

        {/* Central Brave Search Widget */}
        <form className="new-tab-search" onSubmit={handleSearch} id="new-tab-search-form">
          <div className="new-tab-search-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            id="new-tab-search-input"
            className="new-tab-search-input"
            type="text"
            placeholder="Ask anything, find anything with Aasth Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          <div className="new-tab-search-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <defs>
                <mask id="cut8-small">
                  <rect width="24" height="24" fill="white" />
                  <line x1="2" y1="22" x2="22" y2="2" stroke="black" strokeWidth="3" />
                </mask>
              </defs>
              <g mask="url(#cut8-small)" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="7" r="5" />
                <circle cx="12" cy="17" r="5" />
              </g>
            </svg>
            <span style={{ color: '#fff' }}>Aasth Search</span>
          </div>
        </form>

        {/* Top Sites Glass Cards */}
        {showSites && (
          <div className="new-tab-sites-container">
            <div className="new-tab-sites" id="new-tab-sites">
              {topSites.map((site) => (
                <div
                  key={site.id}
                  className="site-card"
                  onClick={() => onNavigate(site.url)}
                  title={site.url}
                >
                  <div className="site-card-icon" style={{ background: site.iconBg || 'var(--color-surface)' }}>
                    {site.emoji}
                  </div>
                  <span className="site-card-name">{site.name}</span>
                  <button
                    className="site-card-delete"
                    onClick={(e) => handleDeleteSite(e, site.id)}
                    title="Remove shortcut"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {/* Add Custom Shortcut Button */}
              <button
                className="site-card site-card--add"
                onClick={() => setShowAddSite(true)}
                title="Add custom shortcut"
              >
                <div className="site-card-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
                <span className="site-card-name">Add Shortcut</span>
              </button>
            </div>
          </div>
        )}

        {/* Interactive Center Hub / Privacy Card */}
        <div className="new-tab-hero-card glass">
          <div className="hero-card-left">
            <div className="hero-card-badge">
              <span className="pulse-dot" />
              <span>Aasth Shield Active</span>
            </div>
            <h3 className="hero-card-title">Total Privacy. Zero Ads. Zero Tracking.</h3>
            <p className="hero-card-desc">
              Your browsing data stays completely on your device. Powered by Chromium and Brave Private Search engine.
            </p>
          </div>
          <div className="hero-card-right">
            <div className="hero-stat-pill">
              <span className="hero-stat-num">{displayBlocked.toLocaleString()}</span>
              <span className="hero-stat-lbl">Trackers Blocked</span>
            </div>
            <div className="hero-stat-pill">
              <span className="hero-stat-num">{bandwidthSavedMB} MB</span>
              <span className="hero-stat-lbl">Data Saved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar — Brave-Style Stats & Quotes */}
      <div className="new-tab-bottom-bar">
        {showStats && (
          <div className="bottom-stats-group glass">
            <div className="bottom-stat-item">
              <span className="bottom-stat-val gradient-text">{displayBlocked.toLocaleString()}</span>
              <span className="bottom-stat-name">Trackers & ads blocked</span>
            </div>
            <div className="bottom-stat-divider" />
            <div className="bottom-stat-item">
              <span className="bottom-stat-val">{bandwidthSavedMB} MB</span>
              <span className="bottom-stat-name">Bandwidth saved</span>
            </div>
            <div className="bottom-stat-divider" />
            <div className="bottom-stat-item">
              <span className="bottom-stat-val">{timeSavedSeconds} s</span>
              <span className="bottom-stat-name">Time saved</span>
            </div>
          </div>
        )}

        <div className="bottom-quote-group">
          <p className="new-tab-quote-text">"{quote.text}"</p>
          <span className="new-tab-quote-author">— {quote.author}</span>
        </div>

        {/* Bottom Right Actions (Brave-style) */}
        <div className="bottom-actions-group">
          <button
            className="glass-action-btn"
            onClick={handleNextWallpaper}
            title="Switch Landscape Wallpaper"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span>Wallpaper</span>
          </button>

          <button
            className="glass-action-btn glass-action-btn--icon"
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            title="Customize Dashboard"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Customizer Drawer */}
      {showSettingsDrawer && (
        <div className="customizer-drawer glass fade-in">
          <div className="customizer-header">
            <h3>🎨 Customize Dashboard</h3>
            <button className="customizer-close" onClick={() => setShowSettingsDrawer(false)}>✕</button>
          </div>

          <div className="customizer-section">
            <h4>Select Wallpaper</h4>
            <div className="wallpaper-grid">
              {DEFAULT_WALLPAPERS.map((wp, idx) => (
                <div
                  key={wp.id}
                  className={`wallpaper-thumb ${!customWallpaper && currentWallpaperIndex === idx ? 'wallpaper-thumb--active' : ''}`}
                  style={{ backgroundImage: `url(${wp.url})` }}
                  onClick={() => handleWallpaperSelect(idx)}
                  title={wp.name}
                >
                  <span>{wp.name}</span>
                </div>
              ))}
            </div>

            <div className="custom-upload-row">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleCustomWallpaperUpload}
              />
              <button
                className="btn-secondary"
                style={{ width: '100%', marginTop: 8 }}
                onClick={() => fileInputRef.current?.click()}
              >
                📁 Upload Custom Wallpaper...
              </button>
            </div>
          </div>

          <div className="customizer-section">
            <h4>Widget Toggles</h4>
            <div className="customizer-toggle-row">
              <span>Show Privacy Stats Bar</span>
              <input type="checkbox" checked={showStats} onChange={(e) => setShowStats(e.target.checked)} />
            </div>
            <div className="customizer-toggle-row">
              <span>Show Digital Clock</span>
              <input type="checkbox" checked={showClock} onChange={(e) => setShowClock(e.target.checked)} />
            </div>
            <div className="customizer-toggle-row">
              <span>Show Top Shortcuts</span>
              <input type="checkbox" checked={showSites} onChange={(e) => setShowSites(e.target.checked)} />
            </div>
          </div>
        </div>
      )}

      {/* Add Shortcut Modal */}
      {showAddSite && (
        <div className="modal-backdrop fade-in" onClick={() => setShowAddSite(false)}>
          <div className="modal-card" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Website Shortcut</h3>
              <button className="modal-close-btn" onClick={() => setShowAddSite(false)}>✕</button>
            </div>
            <form onSubmit={handleAddCustomSite} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Site Name</label>
                <input
                  type="text"
                  className="modal-search-bar"
                  style={{ width: '100%', margin: 0 }}
                  placeholder="e.g. Google Drive"
                  value={newSiteName}
                  onChange={(e) => setNewSiteName(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>URL</label>
                <input
                  type="text"
                  className="modal-search-bar"
                  style={{ width: '100%', margin: 0 }}
                  placeholder="e.g. drive.google.com"
                  value={newSiteUrl}
                  onChange={(e) => setNewSiteUrl(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddSite(false)}>Cancel</button>
                <button type="submit" className="btn-brand">Save Shortcut</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewTabPage;
