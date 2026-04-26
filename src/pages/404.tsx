export default function _404() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <p className="font-mono text-[9px] tracking-widest mb-8" style={{ color: 'var(--bone-dim)' }}>
        § 404 // NOT FOUND
      </p>
      <h1 className="font-display text-5xl md:text-7xl leading-none mb-6" style={{ color: 'var(--bone)' }}>
        YOU TUNED<br />PAST IT.
      </h1>
      <p className="text-sm mb-8" style={{ color: 'var(--bone-dim)' }}>
        This page doesn't exist. Go back, or check the manual if you were looking for something technical.
      </p>
      <a
        href="/"
        className="inline-block px-6 py-3 font-mono text-xs font-bold tracking-widest shadow-brass btn-press transition-all"
        style={{ backgroundColor: 'var(--brass)', color: 'var(--ink)' }}
      >
        // BACK TO PLAYER →
      </a>
    </main>
  );
}
