function formatMoney(n) {
  if (n == null || n === 0) return '$0';
  return `$${Math.abs(n).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

export default function TierComparison({ plan, alternativas, presupuesto }) {
  if (!plan || !plan.total) return null;

  const total = plan.total;
  const pct = presupuesto > 0 ? Math.min((total / presupuesto) * 100, 100) : 0;

  // Determine which tier the plan_optimo represents
  // We can infer from hotel criteria or just show budget fit
  const dentro = plan.dentro_presupuesto;

  return (
    <div className="bg-surface rounded-xl card-shadow border border-border p-5 sm:p-6 animate-popIn">
      <h3 className="font-display text-lg text-text mb-4">
        💰 Opciones para tu presupuesto
      </h3>
      <p className="text-sm text-muted mb-5">
        Con {formatMoney(presupuesto)} puedes elegir entre estas combinaciones:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Opción Económica */}
        <div className={`p-4 rounded-xl border transition-all duration-200 hover-lift ${
          dentro && pct < 60
            ? 'bg-success/5 border-success/20'
            : 'bg-card border-border'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">💚</span>
            <span className="text-sm font-medium text-text">Económico</span>
          </div>
          <p className="text-xs text-muted mb-2">Hoteles 1-3★</p>
          <p className="font-mono text-lg text-text">
            {dentro && pct < 60 ? formatMoney(total) : `< ${formatMoney(presupuesto * 0.6)}`}
          </p>
          {dentro && pct < 60 && (
            <span className="badge bg-success/15 text-success border border-success/20 text-xs mt-2">
              ✅ Dentro de presupuesto
            </span>
          )}
        </div>

        {/* Opción Estándar */}
        <div className={`p-4 rounded-xl border transition-all duration-200 hover-lift ${
          dentro && pct >= 60 && pct < 90
            ? 'bg-accent/5 border-accent/20 ring-1 ring-accent/20'
            : dentro
            ? 'bg-card border-border'
            : 'bg-card border-border opacity-60'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🔵</span>
            <span className="text-sm font-medium text-text">Estándar</span>
          </div>
          <p className="text-xs text-muted mb-2">Hoteles 3-4★</p>
          <p className="font-mono text-lg text-text">
            {dentro ? formatMoney(total) : formatMoney(presupuesto * 0.85)}
          </p>
          {dentro && (
            <span className="badge bg-accent/15 text-accent border border-accent/20 text-xs mt-2">
              ⭐ Recomendado
            </span>
          )}
          {!dentro && (
            <span className="badge bg-warning/15 text-warning border border-warning/20 text-xs mt-2">
              ⚠️ Excede presupuesto
            </span>
          )}
        </div>

        {/* Opción Premium */}
        <div className={`p-4 rounded-xl border transition-all duration-200 hover-lift ${
          !dentro
            ? 'bg-accent/5 border-accent/20'
            : 'bg-card border-border opacity-60'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🟡</span>
            <span className="text-sm font-medium text-text">Premium</span>
          </div>
          <p className="text-xs text-muted mb-2">Hoteles 4-5★</p>
          <p className="font-mono text-lg text-text">
            {formatMoney(presupuesto * 1.2)}
          </p>
          <span className="badge bg-warning/15 text-warning border border-warning/20 text-xs mt-2">
            {dentro ? '💎 Disponible' : '💎 Sobre presupuesto'}
          </span>
        </div>
      </div>

      {/* Budget indicator */}
      <div className="mt-5 pt-4 border-t border-border">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-muted">Presupuesto usado</span>
          <span className={`font-mono font-medium ${!dentro ? 'text-accent' : 'text-text'}`}>
            {Math.round(pct)}%
          </span>
        </div>
        <div className="progress-bar">
          <div
            className={`progress-bar-fill ${
              pct < 60 ? 'bg-success' : pct < 90 ? 'bg-warning' : 'bg-accent'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className={`text-sm mt-2 ${dentro ? 'text-success' : 'text-accent'}`}>
          {dentro
            ? `✅ Dentro de presupuesto — te sobran ${formatMoney(presupuesto - total)}`
            : `⚠️ Excede el presupuesto por ${formatMoney(total - presupuesto)}`}
        </p>
      </div>
    </div>
  );
}
