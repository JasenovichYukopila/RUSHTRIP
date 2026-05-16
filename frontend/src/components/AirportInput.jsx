import { useState, useEffect, useRef, useCallback } from 'react';
import { searchAirports } from '../api/client';

const DEBOUNCE_MS = 250;

export default function AirportInput({
  label,
  placeholder = 'Buscar ciudad o aeropuerto...',
  value,
  onChange,
  onSelect,
  error,
  disabled,
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const containerRef = useRef(null);
  const timerRef = useRef(null);
  const interactionRef = useRef(false); // true = user clicked dropdown item manually
  const blurTimerRef = useRef(null);

  // When external value changes (e.g., form reset), update display
  useEffect(() => {
    if (!value) {
      setQuery('');
      setSelected(null);
      interactionRef.current = false;
    }
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const autoSelectTop = useCallback((items) => {
    if (!interactionRef.current && items && items.length > 0 && query.length >= 2) {
      const top = items[0];
      setSelected(top);
      setQuery(`${top.nombre} (${top.codigo})`);
      setOpen(false);
      onSelect(top.codigo, top.nombre);
      interactionRef.current = true; // mark as handled so we don't re-select
    }
  }, [query, onSelect]);

  const fetchAirports = useCallback(async (q) => {
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const data = await searchAirports({ q });
      setResults(data || []);
      const hasResults = data && data.length > 0;
      // Auto-select top result if user hasn't explicitly chosen yet
      if (hasResults && !interactionRef.current) {
        autoSelectTop(data);
      } else {
        setOpen(hasResults);
      }
    } catch {
      setResults([]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }, [autoSelectTop]);

  function handleInputChange(e) {
    const val = e.target.value;
    setQuery(val);
    setSelected(null);
    interactionRef.current = false;
    onChange(val); // send raw text so backend can resolve city name too

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      fetchAirports(val);
    }, DEBOUNCE_MS);
  }

  function handleSelect(item) {
    interactionRef.current = true;
    setSelected(item);
    setQuery(`${item.nombre} (${item.codigo})`);
    setOpen(false);
    onSelect(item.codigo, item.nombre);
  }

  function handleFocus() {
    if (results.length > 0 && query.length >= 2) {
      setOpen(true);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      setOpen(false);
    }
    // Enter auto-selects first result
    if (e.key === 'Enter') {
      e.preventDefault();
      if (results.length > 0) {
        handleSelect(results[0]);
      }
    }
  }

  function handleBlur() {
    if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
    blurTimerRef.current = setTimeout(() => {
      if (!selected && query.length >= 2 && results.length > 0) {
        autoSelectTop(results);
      } else if (!selected && query.length >= 2 && !loading && results.length === 0) {
        // No results found - pass raw text to backend for resolution
        // onChange already sent the raw query above
      }
      setOpen(false);
    }, 150);
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-text mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`input-field pr-10 ${
            error ? 'ring-2 ring-warning/40 border-warning' : ''
          } ${selected ? 'bg-accent/5' : ''}`}
          autoComplete="off"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted/60">
          {loading ? (
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3" />
              <path d="M12 2 A10 10 0 0 1 22 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          ) : selected ? (
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-success" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12 L10 17 L19 8" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21 L16.65 16.65" />
            </svg>
          )}
        </div>
      </div>

      {error && <p className="mt-1 text-xs text-warning">{error}</p>}

      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-surface rounded-xl border border-border card-shadow-lg max-h-60 overflow-y-auto animate-fadeSlideUp">
          {results.map((item, i) => (
            <button
              key={`${item.codigo}-${i}`}
              type="button"
              onMouseDown={(e) => e.preventDefault()} // prevent input blur before click
              onClick={() => handleSelect(item)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-card transition-colors border-b border-border/50 last:border-b-0"
            >
              <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center flex-shrink-0 text-xs font-mono font-medium">
                {item.codigo}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text truncate">{item.nombre}</p>
                <p className="text-xs text-muted">{item.pais}</p>
              </div>
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-accent/50" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 12 H19" />
                <path d="M14 7 L19 12 L14 17" />
              </svg>
            </button>
          ))}
        </div>
      )}

      {open && query.length >= 2 && !loading && results.length === 0 && (
        <div className="absolute z-50 mt-1 w-full bg-surface rounded-xl border border-border card-shadow p-4 text-center animate-fadeSlideUp">
          <p className="text-sm text-muted">No se encontraron aeropuertos para &quot;{query}&quot;</p>
          <p className="text-xs text-muted mt-1">Lo resolveremos del lado del servidor</p>
        </div>
      )}
    </div>
  );
}
