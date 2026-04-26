import { useFocusMode } from '@lib/focusContext';
import KineticText from './KineticText';

export default function Header() {
  const { isFocusMode, toggleFocusMode } = useFocusMode();

  return (
    <nav
      className="border-b relative z-50"
      style={{ backgroundColor: 'var(--ink)', borderColor: 'var(--border)' }}
    >
      <div className="flex justify-between items-center max-w-6xl mx-auto px-4 py-3">
        <a href="/" className="flex flex-col leading-none gap-0.5">
          <span
            className="font-display text-2xl tracking-tight"
            style={{ color: 'var(--bone)' }}
          >
            <KineticText text="SPOTIFUCK" staggerMs={80} />
          </span>
          <span
            className="font-mono text-[9px] tracking-widest"
            style={{ color: 'var(--bone-dim)' }}
          >
            // OFFICE QUEUE SYSTEM
          </span>
        </a>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleFocusMode}
            className="font-mono text-xs tracking-widest transition-colors"
            style={{ color: isFocusMode ? 'var(--brass)' : 'var(--bone-dim)' }}
            aria-label={isFocusMode ? 'Exit focus mode' : 'Focus mode'}
          >
            {isFocusMode ? '// EXIT FOCUS' : '// FOCUS'}
          </button>

          <a
            href="/admin"
            className="font-mono text-xs tracking-widest transition-colors border px-3 py-1.5"
            style={{ color: 'var(--bone-dim)', borderColor: 'var(--border)' }}
          >
            // ADMIN
          </a>
        </div>
      </div>
    </nav>
  );
}
