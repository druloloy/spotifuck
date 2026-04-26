import { useFocusMode } from '@lib/focusContext';

export default function Header() {
  const { isFocusMode, toggleFocusMode } = useFocusMode();

  if (isFocusMode) return null;

  return (
    <nav className="bg-[var(--spotify-dark-gray)] border-b border-[var(--spotify-medium-gray)] relative z-50">
      <div className="flex justify-between items-center max-w-6xl mx-auto px-4 py-3">
        <a href="/" className="flex items-center gap-2">
          <svg className="w-8 h-8 text-[var(--spotify-green)]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          <span className="text-xl font-bold text-white">Spotifuck</span>
        </a>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleFocusMode}
            title={isFocusMode ? 'Exit focus mode' : 'Enter focus mode'}
            className="text-[var(--spotify-light-gray)] hover:text-white transition-colors p-1 rounded"
            aria-label={isFocusMode ? 'Exit focus mode' : 'Enter focus mode'}
          >
            {isFocusMode ? (
              /* Exit / compress icon */
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 9L4 4m0 0h5m-5 0v5M15 9l5-5m0 0h-5m5 0v5M9 15l-5 5m0 0h5m-5 0v-5M15 15l5 5m0 0h-5m5 0v-5" />
              </svg>
            ) : (
              /* Expand / focus icon */
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </button>

          <a
            href="/admin"
            className="text-[var(--spotify-light-gray)] hover:text-white text-sm transition-colors"
          >
            Admin
          </a>
        </div>
      </div>
    </nav>
  );
}
