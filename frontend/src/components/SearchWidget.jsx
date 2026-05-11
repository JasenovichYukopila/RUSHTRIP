import { useEffect } from 'react';

export default function SearchWidget() {
  useEffect(() => {
    const existing = document.querySelector('script[src*="tpwidg.com"]');
    if (existing) return;

    const script = document.createElement('script');
    script.async = true;
    script.type = 'module';
    script.src = 'https://tpwidg.com/wl_web/main.js?wl_id=17242';
    document.head.appendChild(script);
  }, []);

  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl sm:text-4xl text-text">
            Busca vuelos y hoteles
          </h2>
          <p className="mt-3 text-muted text-base sm:text-lg">
            Encuentra las mejores opciones para tu viaje
          </p>
          <div className="separator mt-6 max-w-xs mx-auto">
            <span className="text-accent text-sm">✈</span>
          </div>
        </div>

        <div className="bg-surface rounded-xl card-shadow p-6 sm:p-8 border border-border">
          <div id="tpwl-search" className="min-h-[120px]" />
          <div className="separator my-6">
            <span className="text-accent2 text-xs">✦</span>
          </div>
          <div id="tpwl-tickets" className="min-h-[120px]" />
        </div>
      </div>
    </section>
  );
}
