import React, { useState, useEffect } from 'react';
import { Bookmark } from '../../global';
import './BookmarksModal.css';

interface BookmarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (url: string) => void;
  currentUrl?: string;
  currentTitle?: string;
}

export const BookmarksModal: React.FC<BookmarksModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  currentUrl,
  currentTitle,
}) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCurrentBookmarked, setIsCurrentBookmarked] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadBookmarks();
    }
  }, [isOpen, currentUrl]);

  const loadBookmarks = async () => {
    try {
      const items = await window.aasth.getBookmarks();
      setBookmarks(items);
      if (currentUrl) {
        const bookmarked = await window.aasth.isBookmarked(currentUrl);
        setIsCurrentBookmarked(bookmarked);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleCurrent = async () => {
    if (!currentUrl) return;
    if (isCurrentBookmarked) {
      await window.aasth.removeBookmark(currentUrl);
      setIsCurrentBookmarked(false);
    } else {
      await window.aasth.addBookmark(currentUrl, currentTitle || currentUrl);
      setIsCurrentBookmarked(true);
    }
    loadBookmarks();
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await window.aasth.removeBookmark(id);
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
    if (currentUrl) {
      const bookmarked = await window.aasth.isBookmarked(currentUrl);
      setIsCurrentBookmarked(bookmarked);
    }
  };

  const handleItemClick = (url: string) => {
    onNavigate(url);
    onClose();
  };

  const filteredBookmarks = bookmarks.filter(
    (b) =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop fade-in" onClick={onClose}>
      <div className="modal-card bookmarks-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge modal-icon-star">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <div>
              <h2 className="modal-title">Bookmarks</h2>
              <p className="modal-subtitle">{bookmarks.length} saved websites</p>
            </div>
          </div>

          <div className="modal-header-actions">
            {currentUrl && currentUrl !== 'aasth://newtab' && !currentUrl.startsWith('about:') && (
              <button
                className={`btn-secondary ${isCurrentBookmarked ? 'btn-bookmarked' : ''}`}
                onClick={handleToggleCurrent}
              >
                {isCurrentBookmarked ? '★ Bookmarked' : '☆ Bookmark Current Page'}
              </button>
            )}
            <button className="modal-close-btn" onClick={onClose} title="Close (Esc)">
              ✕
            </button>
          </div>
        </div>

        <div className="modal-search-bar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search saved bookmarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => setSearchQuery('')}>✕</button>
          )}
        </div>

        <div className="modal-body bookmarks-list">
          {filteredBookmarks.length === 0 ? (
            <div className="modal-empty-state">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <p>{searchQuery ? 'No bookmarks match your search' : 'No bookmarks saved yet. Click the star icon to bookmark any page!'}</p>
            </div>
          ) : (
            filteredBookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="bookmark-item"
                onClick={() => handleItemClick(bookmark.url)}
              >
                <div className="bookmark-item-icon">
                  {bookmark.favicon ? (
                    <img src={bookmark.favicon} alt="" className="bookmark-favicon" />
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  )}
                </div>
                <div className="bookmark-item-info">
                  <span className="bookmark-item-title">{bookmark.title || bookmark.url}</span>
                  <span className="bookmark-item-url">{bookmark.url}</span>
                </div>
                <button
                  className="bookmark-item-delete"
                  onClick={(e) => handleDelete(e, bookmark.id)}
                  title="Remove bookmark"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
