export default function CarCard({ car }) {
  if (!car) return null;

  return (
    <div className="card-base p-4 flex items-start gap-4">
      {car.foto_url ? (
        <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 bg-accent/5">
          <img
            src={car.foto_url}
            alt={car.nombre}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      ) : (
        <div className="w-12 h-12 rounded-xl bg-accent2/10 text-accent2 flex items-center justify-center shrink-0">
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
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-medium text-text text-sm">{car.nombre}</p>
            {car.tipo && (
              <p className="text-xs text-muted-300 mt-0.5">
                {car.tipo}{car.transmision ? ` · ${car.transmision}` : ''}
              </p>
            )}
          </div>
          <div className="text-right shrink-0">
            {car.precio_total > 0 && (
              <p className="font-mono text-accent font-semibold text-sm">
                {car.moneda === 'USD' ? '$' : car.moneda + ' '}{car.precio_total.toFixed(0)}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-2">
          {car.pasajeros && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-300">
              <svg viewBox="0 0 20 20" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="10" cy="6" r="2.5" />
                <path d="M3 18 L3 16 C3 12.5 6 11 10 11 C14 11 17 12.5 17 16 L17 18" />
              </svg>
              {car.pasajeros} pasajeros
            </span>
          )}
          {car.maletas && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-300">
              <svg viewBox="0 0 20 20" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="5" y="5" width="10" height="13" rx="1.5" />
                <path d="M7.5 5 L7.5 3.5 C7.5 2.5 8.5 2 10 2 C11.5 2 12.5 2.5 12.5 3.5 L12.5 5" />
              </svg>
              {car.maletas} maletas
            </span>
          )}
          {car.proveedor && (
            <span className="text-xs text-muted-300">{car.proveedor}</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-border-50">
          {car.link_reserva && (
            <a href={car.link_reserva} target="_blank" rel="noopener noreferrer" className="btn-outline text-xs py-1.5 px-3">
              Booking
            </a>
          )}
          {car.link_localrent && (
            <a href={car.link_localrent} target="_blank" rel="noopener noreferrer" className="btn-outline text-xs py-1.5 px-3">
              Localrent
            </a>
          )}
          {car.link_economybookings && (
            <a href={car.link_economybookings} target="_blank" rel="noopener noreferrer" className="btn-outline text-xs py-1.5 px-3">
              EconomyBookings
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
