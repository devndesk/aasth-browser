import React from 'react';
import { Bookmark } from '../../global';
import './BookmarksBar.css';

interface BookmarksBarProps {
  bookmarks: Bookmark[];
  onNavigate: (url: string) => void;
  onOpenBookmarksModal: () => void;
}

export const BookmarksBar: React.FC<BookmarksBarProps> = ({
  bookmarks,
  onNavigate,
  onOpenBookmarksModal,
}) => {
  if (!bookmarks || bookmarks.length === 0) return null;

  return (
    <div className="bookmarks-bar" id="bookmarks-bar">
      <div className="bookmarks-bar-list">
        {bookmarks.slice(0, 12).map((b) => (
          <button
            key={b.id}
            className="bookmark-chip"
            onClick={() => onNavigate(b.url)}
            title={b.url}
          >
            {b.favicon ? (
              <img src={b.favicon} alt="" className="bookmark-chip-icon" />
            ) : (
              <span className="bookmark-chip-dot">★</span>
            )}
            <span className="bookmark-chip-title">{b.title || b.url}</span>
          </button>
        ))}
      </div>

      <button
        className="bookmarks-bar-all"
        onClick={onOpenBookmarksModal}
        title="View all bookmarks (Ctrl+B)"
      >
        <span>All Bookmarks</span>
      </button>
    </div>
  );
};

export default BookmarksBar;
