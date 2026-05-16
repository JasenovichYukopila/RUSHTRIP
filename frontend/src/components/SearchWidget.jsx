import { useState, useEffect } from 'react';

export default function SearchWidget() {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    // Check if widget already loaded
    const searchEl = document.getElementById('tpwl-search');
    const ticketsEl = document.getElementById('tpwl-tickets');
    if (searchEl?.children?.length || ticketsEl?.children?.length) {
      setStatus('loaded');
      return;
    }

    // Remove any previously created tpwidg scripts on remount
    document.querySelectorAll('script[src*="tpwidg.com"]').forEach((s) => s.remove());

    // Inject the official Travelpayouts inline script with all required attributes
    const script = document.createElement('script');
    script.setAttribute('nowprocket', '');
    script.setAttribute('data-noptimize', '1');
    script.setAttribute('data-cfasync', 'false');
    script.setAttribute('data-wpfc-render', 'false');
    script.setAttribute('seraph-accel-crit', '1');
    script.setAttribute('data-no-defer', '1');
    script.textContent = `
      (function () {
        var script = document.createElement("script");
        script.async = 1;
        script.type = "module";
        script.src = "https://tpwidg.com/wl_web/main.js?wl_id=17242";
        document.head.appendChild(script);
      })();
    `;
    document.head.appendChild(script);

    // Polling: wait for the widget to render into the divs
    const checkLoaded = () => {
      const s = document.getElementById('tpwl-search');
      const t = document.getElementById('tpwl-tickets');
      if (s?.children?.length || t?.children?.length) {
        setStatus('loaded');
        return true;
      }
      return false;
    };

    const pollInterval = setInterval(() => {
      if (checkLoaded()) {
        clearInterval(pollInterval);
      }
    }, 500);

    // Fallback: if nothing loads after 8 seconds, show error
    const timeout = setTimeout(() => {
      clearInterval(pollInterval);
      setStatus((s) => (s === 'loading' ? 'error' : s));
    }, 8000);

    return () => {
      clearInterval(pollInterval);
      clearTimeout(timeout);
      // Remove the inline wrapper script
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      // Remove any dynamically created module scripts from tpwidg
      document.querySelectorAll('script[src*="tpwidg.com"]').forEach((s) => s.remove());
    };
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
          {/* Loading overlay: shown only while loading */}
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin mb-4" />
              <p className="text-sm text-muted animate-pulse">Cargando buscador...</p>
            </div>
          )}

          {/* Error fallback */}
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

          {/* Travelpayouts widget containers: always in DOM so the script can find them */}
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
