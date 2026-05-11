const STEPS = [
  {
    icon: (
      <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none" stroke="#E8611A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="20" cy="20" r="16" />
        <path d="M20 12 L20 28" />
        <path d="M12 20 L28 20" />
      </svg>
    ),
    title: 'Elige tu destino',
    desc: 'Selecciona origen, destino y las fechas de tu viaje. Tú decides a dónde ir.',
  },
  {
    icon: (
      <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none" stroke="#E8611A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 20 L32 20" />
        <path d="M20 8 L20 32" />
        <circle cx="20" cy="20" r="12" />
        <text x="20" y="24" textAnchor="middle" fill="#E8611A" stroke="none" fontSize="14" fontFamily="DM Sans">$</text>
      </svg>
    ),
    title: 'Pon tu presupuesto',
    desc: '¿Cuánto quieres gastar en total? Nosotros hacemos que rinda al máximo.',
  },
  {
    icon: (
      <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none" stroke="#E8611A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 24 Q20 8 30 24" />
        <path d="M10 24 Q14 16 20 20 Q26 24 30 24" />
        <path d="M10 24 L10 28" />
        <path d="M30 24 L30 28" />
        <path d="M14 28 L14 30" />
        <path d="M26 28 L26 30" />
        <path d="M10 28 L30 28" />
      </svg>
    ),
    title: 'Recibe tu plan',
    desc: 'Te mostramos el vuelo ideal y hoteles estimados. Todo ajustado a tu bolsillo.',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-16 sm:py-24 bg-surface/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl sm:text-4xl text-text">
            ¿Cómo funciona?
          </h2>
          <div className="separator mt-6 max-w-xs mx-auto">
            <span className="text-accent text-sm">✈</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {STEPS.map((step, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center opacity-0 animate-fadeSlideUp"
              style={{ animationDelay: `${i * 200}ms`, animationFillMode: 'forwards' }}
            >
              <div className="w-20 h-20 rounded-xl bg-card border border-border flex items-center justify-center mb-5 card-shadow">
                {step.icon}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-xs text-muted">0{i + 1}</span>
                <span className="w-6 h-px bg-accent2/40" />
              </div>
              <h3 className="font-display text-xl text-text mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-muted leading-relaxed max-w-xs">
                {step.desc}
              </p>
              {i < STEPS.length - 1 && (
                <div className="mt-6 text-accent/30 hidden md:block">
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M5 12 H19" />
                    <path d="M14 7 L19 12 L14 17" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
