import React, { useState, useEffect } from 'react';
import { ExtensionInfo } from '../../global';
import './ExtensionsModal.css';

interface ExtensionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExtensionsModal: React.FC<ExtensionsModalProps> = ({ isOpen, onClose }) => {
  const [extensions, setExtensions] = useState<ExtensionInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadExtensions();
    }
  }, [isOpen]);

  const loadExtensions = async () => {
    try {
      const list = await window.aasth.getExtensions();
      setExtensions(list);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLoadUnpacked = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const ext = await window.aasth.loadExtension();
      if (ext) {
        setExtensions((prev) => [...prev.filter((e) => e.id !== ext.id), ext]);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to load extension');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    await window.aasth.removeExtension(id);
    setExtensions((prev) => prev.filter((e) => e.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop fade-in" onClick={onClose}>
      <div className="modal-card extensions-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge modal-icon-ext">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
            <div>
              <h2 className="modal-title">Chrome Extensions</h2>
              <p className="modal-subtitle">Load unpacked Chrome extensions or add-ons</p>
            </div>
          </div>

          <div className="modal-header-actions">
            <button className="btn-brand" onClick={handleLoadUnpacked} disabled={loading}>
              {loading ? 'Loading...' : '+ Load Unpacked Extension'}
            </button>
            <button className="modal-close-btn" onClick={onClose} title="Close (Esc)">
              ✕
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="ext-error-banner">
            ⚠️ {errorMsg}
          </div>
        )}

        <div className="modal-body extensions-list">
          {extensions.length === 0 ? (
            <div className="modal-empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
              <p>No Chrome extensions installed.</p>
              <p className="ext-empty-sub">
                Click "Load Unpacked Extension" to select any downloaded Chrome extension directory containing a <code>manifest.json</code>.
              </p>
            </div>
          ) : (
            extensions.map((ext) => (
              <div key={ext.id} className="extension-card">
                <div className="ext-card-icon">🧩</div>
                <div className="ext-card-details">
                  <div className="ext-card-name">
                    <span>{ext.name}</span>
                    <span className="ext-card-ver">v{ext.version}</span>
                  </div>
                  <span className="ext-card-path">{ext.path}</span>
                </div>
                <button
                  className="btn-secondary btn-danger-hover"
                  onClick={() => handleRemove(ext.id)}
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
