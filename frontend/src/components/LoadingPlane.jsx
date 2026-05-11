export default function LoadingPlane() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative w-64 sm:w-80">
        <div className="h-px w-full bg-border relative overflow-hidden rounded-full">
          <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-transparent via-accent/40 to-transparent animate-flyPlane" />
        </div>
        <svg
          viewBox="0 0 24 24"
          className="absolute top-1/2 left-0 w-6 h-6 text-accent -translate-y-1/2 animate-flyPlane"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 2L11 13" />
          <path d="M22 2L15 22L11 13L2 9L22 2Z" />
        </svg>
      </div>
      <div className="flex items-center gap-2 mt-6">
        <div className="w-2 h-2 rounded-full bg-accent/40 animate-pulse" />
        <div className="w-2 h-2 rounded-full bg-accent/60 animate-pulse" style={{ animationDelay: '0.3s' }} />
        <div className="w-2 h-2 rounded-full bg-accent animate-pulse" style={{ animationDelay: '0.6s' }} />
      </div>
      <p className="mt-4 text-sm text-muted font-medium">
        Armando tu plan de viaje...
      </p>
    </div>
  );
}
