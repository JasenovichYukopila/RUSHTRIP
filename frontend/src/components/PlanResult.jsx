import PrecisionBadge from './PrecisionBadge';
import FlightCard from './FlightCard';
import HotelCard from './HotelCard';
import CarCard from './CarCard';

function formatMoney(n) {
  if (n == null || n === 0) return '$0';
  return `$${Math.abs(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

function AvisoBanner({ mensaje }) {
  if (!mensaje) return null;
  return (
    <div className="flex items-start gap-3 p-4 bg-[#FFF3CD] border-l-4 border-accent rounded-r-lg">
      <span className="text-lg mt-0.5">⚠️</span>
      <p className="text-sm text-text/80 leading-relaxed">{mensaje}</p>
    </div>
  );
}

import { useState } from 'react';

function PlanCard({ plan, label, variant }) {
  if (!plan || !plan.vuelo) return null;

  const [hotelImgError, setHotelImgError] = useState(false);

  const isOptimo = variant === 'optimo';

  const dentro = plan.dentro_presupuesto;
  const diferencia = Math.abs(plan.total - plan.presupuesto);
  const sobrante = plan.presupuesto - plan.total;

  return (
    <div
      className={`relative bg-surface rounded-xl border ${
        isOptimo ? 'border-l-[4px] border-l-accent card-shadow-lg' : 'border-border card-shadow'
      } animate-fadeSlideUp`}
    >
      {isOptimo && (
        <div className="p-5 sm:p-6 pb-0">
          <div className="flex items-center justify-between">
            <span className={`badge ${dentro ? 'bg-success/15 text-success border border-success/20' : 'bg-accent/15 text-accent border border-accent/20'}`}>
              {dentro ? 'Mejor opción ✦' : 'Más cercano'}
            </span>
          </div>
        </div>
      )}

      {!isOptimo && label && (
        <div className="p-5 sm:p-6 pb-0">
          <p className="text-xs text-muted uppercase tracking-wider font-medium">{label}</p>
        </div>
      )}

      <div className={isOptimo || label ? 'p-5 sm:p-6 pt-4' : 'p-5 sm:p-6'}>
        <FlightCard vuelo={plan.vuelo} variant={isOptimo ? 'default' : 'compact'} />

        {plan.hotel && (
          <>
            <div className="border-t border-border my-4" />

            {isOptimo ? (
              <div className={`rounded-lg p-4 border ${
                plan.hotel.tipo === 'recomendado'
                  ? 'bg-accent/5 border-accent/20'
                  : 'bg-card border-border'
              }`}>
                <div className="flex items-start gap-3">
                  {(plan.hotel.foto_url && !hotelImgError) ? (
                    <img
                      src={plan.hotel.foto_url}
                      alt={plan.hotel.nombre}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      onError={() => setHotelImgError(true)}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-accent2/10 text-accent2 flex items-center justify-center flex-shrink-0">
                      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M3 21 L21 21" />
                        <path d="M5 21 L5 7 L12 3 L19 7 L19 21" />
                        <path d="M9 21 L9 12 L15 12 L15 21" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-text truncate">{plan.hotel.nombre}</p>
                      {plan.hotel.tipo === 'recomendado' && (
                        <span className="badge bg-success/15 text-success border border-success/20 text-xs shrink-0">
                          Recomendado
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {(plan.hotel.estrellas || 0) > 0 && (
                        <span className="text-yellow-500 text-xs">
                          {'★'.repeat(Math.min(plan.hotel.estrellas, 5))}{'☆'.repeat(Math.max(0, 5 - plan.hotel.estrellas))}
                        </span>
                      )}
                      {plan.hotel.rating > 0 && (
                        <span className="text-xs text-muted">{Number(plan.hotel.rating).toFixed(1)}</span>
                      )}
                    </div>
                    <p className="text-xs text-muted mt-1">
                      {formatMoney(plan.hotel.precio_noche)} por noche
                      {plan.hotel.noches ? ` × ${plan.hotel.noches} noche${plan.hotel.noches > 1 ? 's' : ''}` : ''}
                      {plan.hotel.precio_total ? ` = ${formatMoney(plan.hotel.precio_total)}` : ''}
                    </p>
                    {plan.hotel.por_que && (
                      <p className="text-xs text-muted mt-1 italic">{plan.hotel.por_que}</p>
                    )}
                  </div>
                  {plan.hotel.link_reserva && (
                    <a
                      href={plan.hotel.link_reserva}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline text-xs shrink-0"
                    >
                      Reservar →
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0 text-accent2" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 21 L21 21" />
                    <path d="M5 21 L5 7 L12 3 L19 7 L19 21" />
                    <path d="M9 21 L9 12 L15 12 L15 21" />
                  </svg>
                  <span className="text-sm text-text truncate">{plan.hotel.nombre}</span>
                  {plan.hotel.tipo === 'recomendado' && (
                    <span className="badge bg-success/15 text-success border border-success/20 text-xs shrink-0">Recomendado</span>
                  )}
                </div>
                <span className="font-mono text-sm text-accent shrink-0">
                  {formatMoney(plan.hotel.precio_total)}
                </span>
              </div>
            )}
          </>
        )}

        {plan.coche && (
          <>
            <div className="border-t border-border my-4" />
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0 text-accent2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 17 L19 17" />
                  <path d="M3 12 L5 7 L7 7 L9 12" />
                  <path d="M21 12 L19 7 L17 7 L15 12" />
                  <circle cx="7" cy="14" r="2" fill="currentColor" />
                  <circle cx="17" cy="14" r="2" fill="currentColor" />
                  <path d="M6 10 L18 10" />
                </svg>
                <div className="min-w-0">
                  <span className="text-sm text-text truncate block">{plan.coche.nombre}</span>
                  {plan.coche.tipo && <span className="text-xs text-muted">{plan.coche.tipo}</span>}
                </div>
                {plan.coche.fuera_presupuesto && (
                  <span className="badge bg-accent/15 text-accent border border-accent/20 text-xs shrink-0">Excede</span>
                )}
              </div>
              <span className="font-mono text-sm text-accent shrink-0">
                {formatMoney(plan.coche.precio_total)}
              </span>
            </div>
          </>
        )}

        {(plan.total != null || plan.presupuesto != null) && (
          <>
            <div className="border-t border-border my-4" />

            <div className={isOptimo ? 'space-y-1.5 text-sm' : 'space-y-1 text-sm'}>
              {plan.vuelo?.precio_total != null && (
                <div className="flex justify-between">
                  <span className="text-muted">Vuelo</span>
                  <span className="font-mono text-text">{formatMoney(plan.vuelo.precio_total)}</span>
                </div>
              )}
              {plan.hotel?.precio_total != null && (
                <div className="flex justify-between">
                  <span className="text-muted">Hotel</span>
                  <span className="font-mono text-text">{formatMoney(plan.hotel.precio_total)}</span>
                </div>
              )}
              {plan.coche?.precio_total != null && (
                <div className="flex justify-between">
                  <span className="text-muted">Coche</span>
                  <span className="font-mono text-text">{formatMoney(plan.coche.precio_total)}</span>
                </div>
              )}
              <div className={`flex justify-between font-medium ${isOptimo ? 'border-t border-border pt-1.5 mt-1.5' : 'border-t border-border pt-1 mt-1'}`}>
                <span className="text-text">Total</span>
                <span className={`font-mono ${!dentro ? 'text-accent' : 'text-text'}`}>
                  {formatMoney(plan.total)}
                </span>
              </div>
              {isOptimo && (
                <>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted">Presupuesto</span>
                    <span className="font-mono text-muted">{formatMoney(plan.presupuesto)}</span>
                  </div>
                  {dentro ? (
                    <div className="flex justify-between text-xs pt-1">
                      <span className="text-success">Sobrante</span>
                      <span className="font-mono text-success">+{formatMoney(sobrante)}</span>
                    </div>
                  ) : !dentro ? (
                    <div className="flex justify-between text-xs pt-1">
                      <span className="text-accent">Exceso</span>
                      <span className="font-mono text-accent">-{formatMoney(diferencia)}</span>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </>
        )}

        {plan.vuelo?.link_compra && (
          <div className={isOptimo ? 'mt-5' : 'mt-4'}>
            <a
              href={plan.vuelo.link_compra}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full text-center"
            >
              Ver vuelo →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PlanResult({ data, loading, error, onRetry }) {
  if (loading) return null;
  if (error) {
    return (
      <div className="bg-surface rounded-xl card-shadow border border-warning/30 p-6 sm:p-8 text-center animate-fadeSlideUp">
        <div className="w-14 h-14 rounded-full bg-warning/10 text-warning flex items-center justify-center mx-auto mb-4">
          <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8 L12 12" />
            <path d="M12 16 L12 16" />
          </svg>
        </div>
        <h3 className="font-display text-lg text-text mb-2">Algo salió mal</h3>
        <p className="text-sm text-muted mb-5 max-w-sm mx-auto">
          {error?.message || 'No pudimos armar tu plan. Intenta de nuevo.'}
        </p>
        {onRetry && (
          <button onClick={onRetry} className="btn-primary">
            Reintentar
          </button>
        )}
      </div>
    );
  }
  if (!data) return null;

  const { aviso, precision, plan_optimo, alternativas, hoteles, coches } = data;

  return (
    <div className="space-y-6 animate-fadeSlideUp">
      <AvisoBanner mensaje={aviso} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-xl sm:text-2xl text-text">
          Tu plan de viaje
        </h2>
        {precision && <PrecisionBadge precision={precision} />}
      </div>

      {plan_optimo && <PlanCard plan={plan_optimo} variant="optimo" />}

      {alternativas?.length > 0 && (
        <div>
          <h3 className="font-display text-lg text-text mb-4">Alternativas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {alternativas.map((alt, i) => (
              <PlanCard
                key={i}
                plan={alt}
                variant="alternativa"
                label={`Opción ${i + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {hoteles?.length > 0 && (
        <div>
          <h3 className="font-display text-lg text-text mb-2">Más hoteles en {data.ciudad_destino || 'el destino'}</h3>
          <p className="text-sm text-muted mb-4">Otras opciones disponibles para tus fechas</p>
          <div className="grid grid-cols-1 gap-4">
            {hoteles.map((h, i) => (
              <HotelCard key={i} hotel={h} />
            ))}
          </div>
        </div>
      )}

      {coches?.coches?.length > 0 && (
        <div>
          <h3 className="font-display text-lg text-text mb-4 mt-8">Alquiler de coches</h3>
          <p className="text-sm text-muted mb-4">
            Opciones de alquiler de coches en {coches.ciudad || 'el destino'}
          </p>
          <div className="grid grid-cols-1 gap-3">
            {coches.coches.slice(0, 5).map((c, i) => (
              <CarCard key={i} car={c} />
            ))}
          </div>
        </div>
      )}

      {!plan_optimo && !alternativas?.length && !hoteles?.length && !coches?.coches?.length && (
        <div className="text-center py-10 text-muted">
          <p className="text-sm">No encontramos opciones para tu búsqueda.</p>
          <button onClick={onRetry} className="btn-outline mt-4">
            Intentar de nuevo
          </button>
        </div>
      )}
    </div>
  );
}
