export default function CarCard({ car }) {
  if (!car) return null;

  return (
    <div className="flex items-start gap-4 p-4 bg-card rounded-lg border border-border card-shadow hover-lift">
      <div className="w-12 h-12 rounded-lg bg-accent2/10 text-accent2 flex items-center justify-center flex-shrink-0">
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 17 L19 17" />
          <path d="M3 12 L5 7 L7 7 L9 12" />
          <path d="M3 12 L3 13 C3 13.55 3.45 14 4 14 L5 14" />
          <path d="M21 12 L19 7 L17 7 L15 12" />
          <path d="M21 12 L21 13 C21 13.55 20.55 14 20 14 L19 14" />
          <circle cx="7" cy="14" r="2" fill="currentColor" />
          <circle cx="17" cy="14" r="2" fill="currentColor" />
          <path d="M6 10 L18 10" />
          <path d="M9 12 L9 10" />
          <path d="M15 12 L15 10" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-text text-sm">{car.nombre}</p>
        {car.tipo && <p className="text-xs text-muted">{car.tipo}{car.transmision ? ` · ${car.transmision}` : ''}</p>}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted">
          {car.pasajeros && (
            <span className="flex items-center gap-1">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="8" r="3" />
                <path d="M5 21 L5 18 C5 14 7 12 12 12 C17 12 19 14 19 18 L19 21" />
              </svg>
              {car.pasajeros} pasajeros
            </span>
          )}
          {car.maletas && (
            <span className="flex items-center gap-1">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="6" y="6" width="12" height="16" rx="2" />
                <path d="M9 6 L9 4 C9 3 9 2 12 2 C15 2 15 3 15 4 L15 6" />
              </svg>
              {car.maletas} maletas
            </span>
          )}
          {car.proveedor && <span className="text-muted">{car.proveedor}</span>}
        </div>
      </div>
      <div className="text-right shrink-0">
        {car.precio_total > 0 && (
          <p className="font-mono text-accent font-medium text-sm">
            {car.moneda === 'USD' ? '$' : car.moneda + ' '}{car.precio_total.toFixed(0)}
          </p>
        )}
        {car.link_reserva && (
          <a
            href={car.link_reserva}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline text-xs mt-1 inline-block"
          >
            Reservar →
          </a>
        )}
      </div>
    </div>
  );
}
