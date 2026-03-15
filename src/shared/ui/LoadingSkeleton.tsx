// LoadingSkeleton.tsx
// Provides skeleton placeholders for loading states (tables, cards, etc.).

// LoadingSkeleton - table variant for employee list and similar tables
export function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {/* Header row */}
      <div className="flex gap-4 border-b border-slate-200 pb-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-4 flex-1 rounded bg-slate-200"
            style={{ maxWidth: i === 1 ? 40 : undefined }}
          />
        ))}
      </div>
      {/* Body rows */}
      {[1, 2, 3, 4, 5, 6].map((row) => (
        <div key={row} className="flex gap-4 py-3">
          <div className="h-4 w-4 shrink-0 rounded bg-slate-200" />
          <div className="h-4 flex-1 rounded bg-slate-100" />
          <div className="h-4 w-16 rounded bg-slate-100" />
          <div className="h-4 w-24 rounded bg-slate-100" />
          <div className="h-4 w-20 rounded bg-slate-100" />
          <div className="h-4 w-12 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

export default LoadingSkeleton;
