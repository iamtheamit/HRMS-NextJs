// LoadingSkeleton.tsx
// Provides skeleton placeholders for loading states (tables, cards, etc.).

export function LoadingSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-4">
      {/* Header skeleton */}
      <div className="flex gap-4 border-b border-slate-100 pb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-3 flex-1 rounded-md bg-slate-100"
            style={{ maxWidth: i === 0 ? 32 : undefined }}
          />
        ))}
      </div>
      {/* Row skeletons */}
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="flex items-center gap-4 py-2">
          <div className="h-8 w-8 shrink-0 rounded-full bg-slate-100" />
          <div className="h-3 flex-1 rounded-md bg-slate-100" />
          <div className="h-3 w-16 rounded-md bg-slate-100" />
          <div className="h-3 w-20 rounded-md bg-slate-100" />
          <div className="h-3 w-14 rounded-md bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

export default LoadingSkeleton;
