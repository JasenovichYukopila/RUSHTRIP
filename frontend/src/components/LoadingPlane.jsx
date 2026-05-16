import { useState, useEffect } from 'react';
import SkeletonCard from './SkeletonCard';

const STEPS = [
  'Buscando los mejores vuelos...',
  'Comparando hoteles disponibles...',
  'Verificando opciones de transporte...',
  'Calculando precios y ahorros...',
  'Armando tu plan ideal...',
];

export default function LoadingPlane() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((i) => (i + 1) % STEPS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center py-16">
      <div className="flex flex-col items-center justify-center mb-10 w-full max-w-sm">
        <div className="relative w-64 sm:w-80">
          <div className="h-px w-full bg-border relative overflow-hidden rounded-full">
            <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-transparent via-accent/40 to-transparent animate-flyPlane" />
          </div>
          <svg
            viewBox="0 0 24 24"
            className="absolute top-1/2 left-0 w-6 h-6 text-accent -translate-y-1/2 animate-flyPlane"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 2L11 13" />
            <path d="M22 2L15 22L11 13L2 9L22 2Z" />
          </svg>
        </div>

        {/* Step progress */}
        <div className="w-full mt-8">
          <div className="flex justify-between mb-2">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full flex-1 mx-0.5 transition-all duration-500 ${
                  i <= stepIndex ? 'bg-accent' : 'bg-border'
                }`}
              />
            ))}
          </div>
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="w-2 h-2 rounded-full bg-accent/40 animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-accent/60 animate-pulse" style={{ animationDelay: '0.3s' }} />
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" style={{ animationDelay: '0.6s' }} />
          </div>
          <p
            key={stepIndex}
            className="mt-3 text-sm text-muted font-medium text-center animate-popIn"
          >
            {STEPS[stepIndex]}
          </p>
        </div>
      </div>
      <div className="w-full max-w-3xl px-4">
        <SkeletonCard count={2} />
      </div>
    </div>
  );
}
