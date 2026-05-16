import { useState } from 'react';

function StarRating({ stars }) {
  const fullStars = Math.min(Math.floor(stars), 5);
  const hasHalf = stars % 1 >= 0.5;
  const emptyStars = Math.max(0, 5 - fullStars - (hasHalf ? 1 : 0));

  return (
    <span className="flex items-center gap-0.5 text-xs">
      {[...Array(fullStars)].map((_, i) => (
        <svg key={`f${i}`} viewBox="0 0 16 16" className="w-3.5 h-3.5 text-yellow-500" fill="currentColor">
          <path d="M8 0L9.796 5.528H15.608L10.906 8.944L12.702 14.472L8 11.056L3.298 14.472L5.094 8.944L0.392 5.528H6.204L8 0Z" />
        </svg>
      ))}
      {hasHalf && (
        <svg key="h" viewBox="0 0 16 16" className="w-3.5 h-3.5 text-yellow-500" fill="none">
          <defs>
            <linearGradient id="halfGrad">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path d="M8 0L9.796 5.528H15.608L10.906 8.944L12.702 14.472L8 11.056L3.298 14.472L5.094 8.944L0.392 5.528H6.204L8 0Z" fill="url(#halfGrad)" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <svg key={`e${i}`} viewBox="0 0 16 16" className="w-3.5 h-3.5 text-yellow-500/30" fill="none" stroke="currentColor" strokeWidth="0.5">
          <path d="M8 0L9.796 5.528H15.608L10.906 8.944L12.702 14.472L8 11.056L3.298 14.472L5.094 8.944L0.392 5.528H6.204L8 0Z" />
        </svg>
      ))}
    </span>
  );
}

export default function HotelCard({ hotel }) {
  if (!hotel) return null;

  const [imgError, setImgError] = useState(false);

  const stars = hotel.estrellas || 0;
  const rating = hotel.rating || 0;

  const showImg = hotel.foto_url && !imgError;

  return (
    <div className="flex items-start gap-4 p-4 bg-card rounded-lg border border-border card-shadow hover-lift">
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
          {stars > 0 && <StarRating stars={stars} />}
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
