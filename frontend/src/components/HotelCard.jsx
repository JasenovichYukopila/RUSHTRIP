import { useState } from 'react';

export default function HotelCard({ hotel }) {
  if (!hotel) return null;

  const [imgError, setImgError] = useState(false);

  const stars = hotel.estrellas || 0;
  const rating = hotel.rating || 0;

  const showImg = hotel.foto_url && !imgError;

  return (
    <div className="flex items-start gap-4 p-4 bg-card rounded-lg border border-border card-shadow">
      {showImg ? (
        <img
          src={hotel.foto_url}
          alt={hotel.nombre}
          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-16 h-16 rounded-lg bg-accent/10 text-accent flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 21 L21 21" />
            <path d="M5 21 L5 7 L12 3 L19 7 L19 21" />
            <path d="M9 21 L9 12 L15 12 L15 21" />
          </svg>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-text text-sm">{hotel.nombre}</p>
          {hotel.tipo === 'recomendado' && (
            <span className="badge bg-success/15 text-success border border-success/20 text-xs">Recomendado</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {stars > 0 && (
            <span className="flex text-yellow-500 text-xs">
              {'★'.repeat(Math.min(stars, 5))}{'☆'.repeat(Math.max(0, 5 - stars))}
            </span>
          )}
          {rating > 0 && (
            <span className="text-xs text-muted">
              {[hotel.reviewScoreWord, Number(rating).toFixed(1), hotel.reviewCount ? `${Number(hotel.reviewCount).toLocaleString('es')} opiniones` : ''].filter(Boolean).join(' · ')}
            </span>
          )}
        </div>
        {hotel.precio_noche > 0 && (
          <p className="mt-1.5 text-sm">
            <span className="font-mono text-accent font-medium">${Number(hotel.precio_noche).toFixed(0)}</span>
            <span className="text-muted"> x {hotel.noches || 1} noche{hotel.noches > 1 ? 's' : ''}</span>
            {hotel.precio_total > 0 && (
              <span className="text-muted"> = <span className="font-mono">${Number(hotel.precio_total).toFixed(0)}</span></span>
            )}
          </p>
        )}
        {hotel.adultos > 0 && (
          <p className="text-xs text-muted mt-0.5">{hotel.adultos} adulto{hotel.adultos > 1 ? 's' : ''}</p>
        )}
      </div>
      {hotel.link_reserva && (
        <a
          href={hotel.link_reserva}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline text-xs shrink-0"
        >
          Reservar →
        </a>
      )}
    </div>
  );
}
