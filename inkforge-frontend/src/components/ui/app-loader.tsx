export function AppLoader() {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="loader-ink" aria-live="polite" aria-busy="true" role="status">
        <span className="sr-only">Loading content</span>
        <div className="loader-ink__drop" />
        <div className="loader-ink__puddle" />
        <div className="loader-ink__ripple" />
        <div className="loader-ink__ripple loader-ink__ripple--delay" />
      </div>
    </div>
  );
}
