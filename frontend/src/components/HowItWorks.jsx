import { useEffect, useRef, useState } from 'react';

const STEPS = [
  {
    number: '01',
    title: 'Elige tu destino',
    desc: 'Selecciona origen, destino y las fechas de tu viaje. Tú decides a dónde ir.',
  },
  {
    number: '02',
    title: 'Pon tu presupuesto',
    desc: '¿Cuánto quieres gastar en total? Ajusta el slider y nosotros hacemos que rinda al máximo.',
  },
  {
    number: '03',
    title: 'Recibe tu plan',
    desc: 'Te mostramos el vuelo ideal y hoteles ajustados a tu presupuesto. Todo listo para reservar.',
  },
];

function StepCard({ step, index, isVisible }) {
  return (
    <div
      className="flex gap-5 sm:gap-6 group"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.15}s`,
      }}
    >
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 rounded-xl bg-accent text-white flex items-center justify-center font-display text-lg font-bold shadow-lg shrink-0">
          {step.number}
        </div>
        {index < STEPS.length - 1 && (
          <div className="w-px flex-1 bg-gradient-to-b from-accent/30 to-accent2/20 mt-2" />
        )}
      </div>
      <div className="pb-8 sm:pb-12">
        <h3 className="font-display text-xl sm:text-2xl text-text mt-1.5 mb-2">
          {step.title}
        </h3>
        <p className="text-sm sm:text-base text-muted-400 leading-relaxed max-w-sm">
          {step.desc}
        </p>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-16 sm:py-24" ref={ref}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div
          className="mb-12 sm:mb-16 text-center"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
            transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <h2 className="section-title">¿Cómo funciona?</h2>
          <p className="section-subtitle mx-auto">
            Tres pasos simples para encontrar el viaje perfecto dentro de tu presupuesto.
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          {STEPS.map((step, i) => (
            <StepCard key={i} step={step} index={i} isVisible={isVisible} />
          ))}
        </div>
      </div>
    </section>
  );
}
