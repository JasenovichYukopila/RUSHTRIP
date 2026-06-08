import { useState } from 'react';

function formatMoney(n) {
  if (n == null || n === 0) return '$0';
  return `$${Math.abs(n).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

export default function SummaryCard({ data, onModify }) {
  const [copied, setCopied] = useState(false);

  if (!data || !data.plan_optimo) return null;

  const plan = data.plan_optimo;
  const dentro = plan.dentro_presupuesto;
  const pct = data.presupuesto > 0 ? Math.min((plan.total / data.presupuesto) * 100, 100) : 0;
  const sobrante = data.presupuesto - plan.total;

  const pctColor = pct < 60 ? 'bg-success' : pct < 90 ? 'bg-warning' : 'bg-accent';
  const statusText = dentro
    ? `Dentro de tu presupuesto${sobrante > 0 ? ` — te sobran ${formatMoney(sobrante)}` : ''}`
    : `Excede el presupuesto por ${formatMoney(Math.abs(sobrante))}`;

  const co2Total = (plan.vuelo?.co2_kg || 0) * (data.pasajeros || 1);

  function handleShare() {
    const params = new URLSearchParams({
      origen: data.origen,
      destino: data.destino,
      salida: data.fecha_salida,
      regreso: data.fecha_regreso,
      presupuesto: data.presupuesto,
      pasajeros: data.pasajeros,
    });
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-accent/[0.04] via-surface to-accent2/[0.04] border border-border-100 card-shadow-lg animate-scale-in">
      <div className="absolute top-0 right-0 w-48 h-48 bg-accent/3 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent2/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-300 mb-2">
              <span className="font-mono font-semibold text-text">{data.origen}</span>
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-accent" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M5 12 H19" />
                <path d="M14 7 L19 12 L14 17" />
              </svg>
              <span className="font-mono font-semibold text-text">{data.destino}</span>
              <span className="text-muted-300 mx-1">·</span>
              <span>{data.noches || 7} noches</span>
              {data.pasajeros && (
                <>
                  <span className="text-muted-300 mx-1">·</span>
                  <span>{data.pasajeros} {data.pasajeros === 1 ? 'pasajero' : 'pasajeros'}</span>
                </>
              )}
            </div>
            <h3 className="font-display text-2xl sm:text-3xl text-text">
              Total estimado: <span className="text-accent">{formatMoney(plan.total)}</span>
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleShare} className="btn-outline text-xs px-3 py-2" title="Copiar enlace">
              {copied ? '✓ Copiado' : 'Compartir'}
            </button>
            <button onClick={onModify} className="btn-outline text-xs px-3 py-2" title="Modificar búsqueda">
              Modificar
            </button>
          </div>
        </div>

        <div className="bg-white/50 rounded-xl p-4 sm:p-5 border border-border-50">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-muted-300">Presupuesto: {formatMoney(data.presupuesto)}</span>
            <span className={`font-mono font-semibold ${!dentro ? 'text-accent' : 'text-text'}`}>
              {Math.round(pct)}% usado
            </span>
          </div>
          <div className="progress-bar">
            <div className={`progress-bar-fill ${pctColor}`} style={{ width: `${pct}%` }} />
          </div>
          <p className={`text-sm mt-2 font-medium ${dentro ? 'text-success' : 'text-accent'}`}>
            {dentro ? '✅ ' : '⚠️ '}{statusText}
          </p>
        </div>

        {data.presupuesto_minimo_sugerido && (
          <div className="mt-3 text-xs text-muted-300 flex items-center gap-2">
            <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="10" cy="10" r="8" />
              <path d="M10 14v-3M10 7h.01" />
            </svg>
            <span>
              Mínimo sugerido: <span className="font-mono text-text">${Number(data.presupuesto_minimo_sugerido).toLocaleString('en-US')}</span>
              {data.presupuesto < data.presupuesto_minimo_sugerido && (
                <span className="text-warning"> — Por debajo del mínimo estimado</span>
              )}
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-border-50">
          <StatBox label="Vuelo" value={formatMoney(plan.vuelo?.precio_total || 0)} />
          {plan.hotel?.precio_total > 0 && (
            <StatBox label="Hotel" value={formatMoney(plan.hotel.precio_total)} />
          )}
          {plan.coche?.precio_total > 0 && (
            <StatBox label="Coche" value={formatMoney(plan.coche.precio_total)} />
          )}
          {co2Total > 0 && (
            <StatBox label="CO₂" value={`🌱 ${co2Total.toFixed(0)} kg`} />
          )}
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="text-center p-2 rounded-lg bg-white/40">
      <p className="text-[10px] text-muted-300 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="font-mono text-sm text-text font-medium">{value}</p>
    </div>
  );
}
