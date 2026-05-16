import { useScrollReveal } from '../hooks/useScrollReveal';

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

function AnimatedArrow({ isVisible }) {
  return (
    <svg
      viewBox="0 0 80 24"
      className="w-20 h-6 mx-auto mt-4 hidden md:block"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeDasharray="80"
      strokeDashoffset={isVisible ? 0 : 80}
      style={{
        transition: 'stroke-dashoffset 0.8s ease-out',
        color: 'rgba(232, 97, 26, 0.3)',
      }}
    >
      <path d="M0 12 L70 12" />
      <path d="M62 7 L70 12 L62 17" />
    </svg>
  );
}

function StepCard({ step, index, isVisible }) {
  const ref = useScrollReveal(0.2);

  return (
    <div
      ref={ref.ref}
      className={`flex flex-col items-center text-center transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
      style={{ transitionDelay: `${index * 200}ms` }}
    >
      <div className="w-20 h-20 rounded-xl bg-card border border-border flex items-center justify-center mb-5 card-shadow hover-lift cursor-default">
        {step.icon}
      </div>
      <div className="flex items-center gap-2 mb-2">
        <span className="font-mono text-xs text-muted">0{index + 1}</span>
        <span className="w-6 h-px bg-accent2/40" />
      </div>
      <h3 className="font-display text-xl text-text mb-2">
        {step.title}
      </h3>
      <p className="text-sm text-muted leading-relaxed max-w-xs">
        {step.desc}
      </p>
    </div>
  );
}

export default function HowItWorks() {
  const sectionRef = useScrollReveal(0.15);
  const isVisible = sectionRef.isVisible;

  return (
    <section className="py-16 sm:py-24 bg-surface/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div
          ref={sectionRef.ref}
          className={`text-center mb-14 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <h2 className="font-display text-3xl sm:text-4xl text-text">
            ¿Cómo funciona?
          </h2>
          <div className="separator mt-6 max-w-xs mx-auto">
            <span className="text-accent text-sm">✈</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {STEPS.map((step, i) => (
            <div key={i} className="flex flex-col items-center">
              <StepCard step={step} index={i} isVisible={isVisible} />
              {i < STEPS.length - 1 && <AnimatedArrow isVisible={isVisible} />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
