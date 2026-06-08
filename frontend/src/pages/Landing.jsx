import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useScrollReveal } from '../hooks/useScrollReveal';
import SearchWidget from '../components/SearchWidget';
import HowItWorks from '../components/HowItWorks';

function TrustStats() {
  return (
    <div className="flex flex-wrap items-center gap-8 sm:gap-12 mt-10 pt-8 border-t border-border-100">
      {[
        { number: '50+', label: 'Destinos' },
        { number: '15K', label: 'Planes creados' },
        { number: '4.8', label: 'Valoración' },
      ].map((stat) => (
        <div key={stat.label} className="flex items-baseline gap-2">
          <span className="font-display text-2xl sm:text-3xl text-text">{stat.number}</span>
          <span className="text-sm text-muted-400">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}

function ToolCard({ icon, title, description, features, cta, href, onClick, accent = 'accent' }) {
  const content = (
    <div
      className={`group relative overflow-hidden rounded-2xl p-6 sm:p-8 transition-all duration-500 cursor-pointer border border-border-100 hover:border-${accent}/30 h-full flex flex-col`}
      style={{
        background: `linear-gradient(135deg, rgba(250, 247, 242, 0.95) 0%, rgba(255, 255, 255, 0.6) 100%)`,
        backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 24px rgba(26, 18, 8, 0.06), 0 1px 4px rgba(26, 18, 8, 0.04)',
      }}
    >
      <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-[0.06] pointer-events-none bg-${accent}`} />
      <div className={`absolute -bottom-16 -left-16 w-32 h-32 rounded-full opacity-[0.04] pointer-events-none bg-${accent}`} />

      <div className="flex items-start gap-5 mb-5">
        <div className={`w-14 h-14 rounded-xl bg-${accent}/10 flex items-center justify-center shrink-0 text-${accent} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-4deg]`}>
          {icon}
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-xl sm:text-2xl text-text mb-1">{title}</h3>
          <p className="text-sm text-muted-400 leading-relaxed">{description}</p>
        </div>
      </div>

      <div className="space-y-2.5 mb-6 flex-1">
        {features.map((f, i) => (
          <div key={i} className="flex items-center gap-3 text-sm text-muted-300">
            <svg viewBox="0 0 16 16" className="w-4 h-4 shrink-0 text-success" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8 L7 12 L13 4" />
            </svg>
            {f}
          </div>
        ))}
      </div>

      <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 bg-${accent} text-white hover:bg-${accent}/90 hover:shadow-lg hover:shadow-${accent}/25 group-hover:translate-x-0.5 self-start`}>
        {cta}
        <svg viewBox="0 0 16 16" className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 8 L13 8" /><path d="M9 4 L13 8 L9 12" />
        </svg>
      </div>

      <div className="absolute inset-0 rounded-2xl transition-opacity duration-500 opacity-0 group-hover:opacity-100 pointer-events-none" style={{
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), 0 8px 32px rgba(232, 97, 26, 0.08)',
      }} />
    </div>
  );

  if (href) {
    return <Link to={href} className="block">{content}</Link>;
  }
  return <div onClick={onClick} className="cursor-pointer h-full">{content}</div>;
}

function useScrollTo() {
  const scrollToWidget = () => {
    const el = document.getElementById('search-widget-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  return scrollToWidget;
}

export default function Landing() {
  const heroRef = useScrollReveal();
  const toolsRef = useScrollReveal();
  const searchRef = useScrollReveal();
  const howItWorksRef = useScrollReveal();
  const scrollToWidget = useScrollTo();

  return (
    <div className="relative">
      <section className="pt-20 sm:pt-24 lg:pt-28 pb-12 sm:pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-warm-glow pointer-events-none" />
        <div className="absolute top-10 right-0 w-96 h-96 bg-accent/3 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent2/4 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div ref={heroRef.ref} className={`reveal ${heroRef.isVisible ? 'visible' : ''}`}>
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-14">
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 text-accent text-xs font-medium rounded-full mb-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Metabuscador de viajes inteligente
                </div>
                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl text-text leading-[1.15] tracking-tight">
                  Viaja más,
                  <br />
                  <span className="text-accent">gasta menos.</span>
                </h1>
                <p className="mt-4 text-base sm:text-lg text-muted-400 leading-relaxed max-w-lg mx-auto lg:mx-0">
                  Elige cómo quieres planear: busca vuelos al instante o deja que armes el plan perfecto con tu presupuesto.
                </p>
                <TrustStats />
              </div>
              <div className="shrink-0 w-64 sm:w-80 lg:w-96 relative">
                <div className="absolute inset-0 bg-gradient-radial from-accent/8 to-transparent rounded-full blur-2xl" />
                <svg viewBox="0 0 500 280" className="w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M70 220 Q180 30 320 50 Q440 68 460 160" stroke="#C4A882" strokeWidth="1.5" strokeDasharray="6 6" fill="none" opacity="0.5" />
                  <circle cx="120" cy="165" r="3" fill="#E8611A" opacity="0.3" />
                  <circle cx="180" cy="100" r="4" fill="#C4A882" opacity="0.4" />
                  <circle cx="260" cy="58" r="3" fill="#E8611A" opacity="0.25" />
                  <circle cx="350" cy="55" r="4" fill="#C4A882" opacity="0.35" />
                  <circle cx="420" cy="85" r="2.5" fill="#E8611A" opacity="0.3" />
                  <circle cx="455" cy="135" r="3" fill="#C4A882" opacity="0.4" />
                  <path d="M85 175 L190 60 Q196 52 205 58 L245 78 Q252 82 248 90 L215 115 L280 105 Q290 103 295 110 L325 135 Q332 142 325 148 L280 150 L250 200 Q245 210 236 205 L195 170 L190 200 Q188 210 180 207 L130 187 Q115 182 85 175 Z" stroke="#E8611A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <path d="M210 62 L250 82 Q252 85 248 90 L215 115" stroke="#C4A882" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16 sm:pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div ref={toolsRef.ref} className={`reveal ${toolsRef.isVisible ? 'visible' : ''}`}>
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl sm:text-3xl text-text">¿Cómo quieres viajar?</h2>
              <p className="mt-2 text-muted-400 text-sm sm:text-base">Dos formas de encontrar tu próximo destino</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              <ToolCard
                icon={
                  <svg viewBox="0 0 28 28" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="8" />
                    <path d="M17 17 L22 22" />
                    <path d="M9 12 L15 12" />
                    <path d="M12 9 L12 15" />
                  </svg>
                }
                title="Buscador rápido"
                description="Encuentra vuelos y hoteles al instante con nuestro buscador integrado."
                features={[
                  'Resultados en segundos',
                  'Compara precios al instante',
                  'Sin registro necesario',
                  'Enlace directo a reserva',
                ]}
                cta="Buscar ahora"
                onClick={scrollToWidget}
                accent="accent"
              />
              <ToolCard
                icon={
                  <svg viewBox="0 0 28 28" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 14 L8 10 L14 12 L20 6 L24 8 L18 16 L12 14 L8 18 L4 14Z" />
                    <path d="M14 12 L18 8" />
                    <path d="M4 20 L8 18" />
                    <path d="M20 6 L24 4" />
                    <path d="M8 10 L4 14 L8 18" />
                    <path d="M12 14 L14 12" />
                    <path d="M20 6 L18 16" />
                  </svg>
                }
                title="Armador de planes"
                description="Dinos tu presupuesto y armamos el viaje completo — vuelo, hotel y coche."
                features={[
                  'Plan personalizado con presupuesto',
                  'Vuelo + hotel + coche en un solo plan',
                  'Compara alternativas lado a lado',
                  'Ahorro garantizado',
                ]}
                cta="Armar mi plan"
                href="/plan"
                accent="accent2"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="relative" id="search-widget-section">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-accent/3 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent2/5 rounded-full blur-3xl pointer-events-none" />
        <div ref={searchRef.ref} className={`reveal ${searchRef.isVisible ? 'visible' : ''}`}>
          <section className="pb-16 sm:pb-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              <div className="text-center mb-8">
                <h2 className="font-display text-2xl sm:text-3xl text-text">
                  Búsqueda rápida
                </h2>
                <p className="mt-2 text-muted-400 text-sm sm:text-base">
                  Encuentra vuelos y hoteles sin complicaciones
                </p>
                <div className="separator mt-5 max-w-xs mx-auto">
                  <span className="text-accent text-sm">✈</span>
                </div>
              </div>
              <SearchWidget />
            </div>
          </section>
        </div>
      </div>

      <div className="relative">
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-accent2/4 rounded-full blur-3xl pointer-events-none" />
        <div ref={howItWorksRef.ref} className={`reveal ${howItWorksRef.isVisible ? 'visible' : ''}`}>
          <HowItWorks />
        </div>
      </div>
    </div>
  );
}
