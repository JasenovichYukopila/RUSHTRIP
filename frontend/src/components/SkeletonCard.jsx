export default function SkeletonCard({ count = 3 }) {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="card-base p-4 flex items-start gap-4"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="w-16 h-16 rounded-lg skeleton-shimmer shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-4 w-3/4 rounded skeleton-shimmer" />
            <div className="h-3 w-1/2 rounded skeleton-shimmer" />
            <div className="h-3 w-1/4 rounded skeleton-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}
