export default function FlightRoute({ vuelo, compact = false }) {
  if (!vuelo) return null;

  const origen = vuelo.origen || '???';
  const destino = vuelo.destino || '???';
  const escalas = vuelo.escalas ?? 0;

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-300">
        <span className="font-mono font-semibold text-text">{origen}</span>
        <svg viewBox="0 0 24 12" className="w-10 h-3 text-accent2">
          <path
            d="M1 6 Q12 0 23 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          {escalas > 0 && <circle cx="12" cy="4" r="1.5" fill="currentColor" opacity="0.5" />}
          <polygon points="23,6 18,3 18,9" fill="currentColor" />
          <circle cx="1" cy="6" r="2" fill="currentColor" />
        </svg>
        <span className="font-mono font-semibold text-text">{destino}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      <svg viewBox="0 0 200 56" className="w-full max-w-[200px] h-12">
        <path
          d="M 16 36 Q 100 4 184 36"
          fill="none"
          stroke="var(--accent2, #C4A882)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={escalas > 0 ? '4 3' : '500'}
          className="animate-drawLine"
          style={{
            strokeDashoffset: 0,
            animation: 'drawRoute 1.5s ease-out forwards',
          }}
        />

        <circle cx="16" cy="36" r="5" fill="var(--accent, #E8611A)" />
        <text x="16" y="50" textAnchor="middle" className="text-[7px]" fill="var(--text, #1A1208)" fontWeight="700" fontFamily="DM Mono, monospace">
          {origen}
        </text>

        <g transform="translate(100, 12) rotate(-90)">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="var(--accent, #E8611A)" opacity="0.6">
            <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2v0A1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
          </svg>
        </g>

        <circle cx="184" cy="36" r="5" fill="var(--accent, #E8611A)" />
        <text x="184" y="50" textAnchor="middle" className="text-[7px]" fill="var(--text, #1A1208)" fontWeight="700" fontFamily="DM Mono, monospace">
          {destino}
        </text>

        {escalas > 0 && (
          <>
            <circle cx="58" cy="18" r="2.5" fill="var(--muted-300, #B8A999)" />
            <circle cx="142" cy="18" r="2.5" fill="var(--muted-300, #B8A999)" />
          </>
        )}
      </svg>

      {vuelo.escalas_text && (
        <p className="text-xs text-muted-300 -mt-0.5">
          {vuelo.escalas_text}
        </p>
      )}
    </div>
  );
}
