import React from 'react';
import './TitleBar.css';

const TitleBar: React.FC = () => {
  const handleMinimize = () => window.aasth.minimize();
  const handleMaximize = () => window.aasth.maximize();
  const handleClose = () => window.aasth.close();

  return (
    <div className="titlebar" id="titlebar">
      <div className="titlebar-drag-region" />
      <div className="titlebar-logo">
        <div className="titlebar-logo-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5z" fill="url(#logoGrad)" />
            <path d="M2 17l10 5 10-5" stroke="url(#logoGrad)" strokeWidth="2" fill="none" />
            <path d="M2 12l10 5 10-5" stroke="url(#logoGrad)" strokeWidth="2" fill="none" />
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <span className="titlebar-name">Aasth</span>
      </div>

      <div className="titlebar-controls">
        <button
          className="titlebar-btn titlebar-btn--minimize"
          onClick={handleMinimize}
          title="Minimize"
          id="btn-minimize"
        >
          <svg width="10" height="1" viewBox="0 0 10 1">
            <rect width="10" height="1" fill="currentColor" />
          </svg>
        </button>
        <button
          className="titlebar-btn titlebar-btn--maximize"
          onClick={handleMaximize}
          title="Maximize"
          id="btn-maximize"
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <rect x="0.5" y="0.5" width="9" height="9" rx="1" stroke="currentColor" strokeWidth="1" fill="none" />
          </svg>
        </button>
        <button
          className="titlebar-btn titlebar-btn--close"
          onClick={handleClose}
          title="Close"
          id="btn-close"
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <line x1="0" y1="0" x2="10" y2="10" stroke="currentColor" strokeWidth="1.5" />
            <line x1="10" y1="0" x2="0" y2="10" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TitleBar;
