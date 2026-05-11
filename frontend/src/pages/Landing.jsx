import { Link } from 'react-router-dom';
import SearchWidget from '../components/SearchWidget';
import HowItWorks from '../components/HowItWorks';

function HeroPlane() {
  return (
    <svg viewBox="0 0 500 280" className="w-full max-w-lg mx-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M70 220 Q180 30 320 50 Q440 68 460 160"
        stroke="#C4A882"
        strokeWidth="1.5"
        strokeDasharray="6 6"
        fill="none"
        opacity="0.5"
      />
      <circle cx="120" cy="165" r="3" fill="#E8611A" opacity="0.3" />
      <circle cx="180" cy="100" r="4" fill="#C4A882" opacity="0.4" />
      <circle cx="260" cy="58" r="3" fill="#E8611A" opacity="0.25" />
      <circle cx="350" cy="55" r="4" fill="#C4A882" opacity="0.35" />
      <circle cx="420" cy="85" r="2.5" fill="#E8611A" opacity="0.3" />
      <circle cx="455" cy="135" r="3" fill="#C4A882" opacity="0.4" />
      <path
        d="M85 175 L190 60 Q196 52 205 58 L245 78 Q252 82 248 90 L215 115 L280 105 Q290 103 295 110 L325 135 Q332 142 325 148 L280 150 L250 200 Q245 210 236 205 L195 170 L190 200 Q188 210 180 207 L130 187 Q115 182 85 175 Z"
        stroke="#E8611A"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M210 62 L250 82 Q252 85 248 90 L215 115"
        stroke="#C4A882"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
    </svg>
  );
}

export default function Landing() {
  return (
    <div>
      <section className="py-16 sm:py-24 lg:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 text-accent text-xs font-medium rounded-full mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                Metabuscador de viajes inteligente
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-text leading-[1.1] tracking-tight">
                Viaja más,
                <br />
                <span className="text-accent">gasta menos.</span>
              </h1>
              <p className="mt-5 text-base sm:text-lg text-muted leading-relaxed max-w-md">
                Dinos tu presupuesto. Nosotros armamos el plan de viaje perfecto para ti — vuelo, hotel y todo lo que necesitas.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Link to="/plan" className="btn-primary text-base px-8 py-3.5">
                  Armar mi plan →
                </Link>
                <Link to="/plan" className="text-sm text-muted hover:text-text transition-colors flex items-center gap-1.5">
                  <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="10" cy="10" r="8" />
                    <path d="M8 7 L13 10 L8 13 Z" />
                  </svg>
                  Ver cómo funciona
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-accent/5 rounded-full blur-3xl" />
              <HeroPlane />
            </div>
          </div>
        </div>
      </section>

      <SearchWidget />
      <HowItWorks />
    </div>
  );
}
