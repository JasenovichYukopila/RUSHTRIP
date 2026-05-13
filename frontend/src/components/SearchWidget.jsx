import { useState, useEffect } from 'react';

export default function SearchWidget() {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const existing = document.querySelector('script[src*="tpwidg.com"]');
    if (existing) {
      setStatus('loaded');
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.type = 'module';
    script.src = 'https://tpwidg.com/wl_web/main.js?wl_id=17242';

    script.onload = () => {
      setTimeout(() => {
        const searchEl = document.getElementById('tpwl-search');
        const ticketsEl = document.getElementById('tpwl-tickets');
        if (searchEl?.children?.length || ticketsEl?.children?.length) {
          setStatus('loaded');
        } else {
          setStatus('error');
        }
      }, 3000);
    };

    script.onerror = () => {
      setStatus('error');
    };

    document.head.appendChild(script);

    const timeout = setTimeout(() => {
      setStatus((s) => (s === 'loading' ? 'error' : s));
    }, 8000);

    return () => clearTimeout(timeout);
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
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin mb-4" />
              <p className="text-sm text-muted animate-pulse">Cargando buscador...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-6">
              <p className="text-sm text-muted mb-4">
                El buscador no pudo cargarse. Puedes buscar directamente en:
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <a
                  href="https://www.aviasales.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline text-sm"
                >
                  Buscar vuelos en Aviasales →
                </a>
                <a
                  href="https://www.booking.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline text-sm"
                >
                  Buscar hoteles en Booking →
                </a>
              </div>
            </div>
          )}

          {status === 'loaded' && (
            <>
              <div id="tpwl-search" className="min-h-[120px]" />
              <div className="separator my-6">
                <span className="text-accent2 text-xs">✦</span>
              </div>
              <div id="tpwl-tickets" className="min-h-[120px]" />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
