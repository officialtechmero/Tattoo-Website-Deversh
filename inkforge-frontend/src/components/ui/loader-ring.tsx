type LoaderRingProps = {
  size?: "sm" | "md";
  className?: string;
};

export function LoaderRing({ size = "md", className = "" }: LoaderRingProps) {
  const sizeClass = size === "sm" ? "loader-ring--sm" : "";
  return (
    <div
      className={`loader-ring ${sizeClass} ${className}`.trim()}
      aria-live="polite"
      aria-busy="true"
      role="status"
    >
      <span className="sr-only">Loading content</span>
    </div>
  );
}
