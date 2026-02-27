import { Sparkles } from "lucide-react";

export function AppLoader() {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="loader-orbit" aria-live="polite" aria-busy="true" role="status">
        <span className="sr-only">Loading content</span>

        <div className="loader-orbit__ring loader-orbit__ring--outer" />
        <div className="loader-orbit__ring loader-orbit__ring--inner" />

        <div className="loader-orbit__core">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}