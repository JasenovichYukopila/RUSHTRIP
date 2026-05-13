import { useState } from 'react';

const INITIAL = {
  origen: '',
  destino: '',
  fecha_salida: '',
  fecha_regreso: '',
  presupuesto: '',
  pasajeros: '1',
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function nextWeek() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
}

function nextWeekPlus(days) {
  const d = new Date();
  d.setDate(d.getDate() + 7 + days);
  return d.toISOString().slice(0, 10);
}

export default function PlanForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    ...INITIAL,
    fecha_salida: nextWeek(),
    fecha_regreso: nextWeekPlus(7),
  });
  const [errors, setErrors] = useState({});
  const [incluirHotel, setIncluirHotel] = useState(true);
  const [incluirVehiculo, setIncluirVehiculo] = useState(false);
  const [tier, setTier] = useState('estandar');

  function handleChange(e) {
    const { name, value } = e.target;
    let val = value;
    if (name === 'origen' || name === 'destino') {
      val = value.toUpperCase().slice(0, 3);
    }
    setForm((prev) => ({ ...prev, [name]: val }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  }

  function validate() {
    const errs = {};
    if (form.origen.length < 3) errs.origen = 'Código IATA de 3 letras';
    if (form.destino.length < 3) errs.destino = 'Código IATA de 3 letras';
    if (!form.fecha_salida) errs.fecha_salida = 'Selecciona fecha de salida';
    if (!form.fecha_regreso) errs.fecha_regreso = 'Selecciona fecha de regreso';
    if (form.fecha_salida && form.fecha_regreso && form.fecha_regreso <= form.fecha_salida) {
      errs.fecha_regreso = 'Debe ser posterior a la salida';
    }
    const presupuesto = parseFloat(form.presupuesto);
    if (!presupuesto || presupuesto <= 0) errs.presupuesto = 'Ingresa un presupuesto válido';
    const pasajeros = parseInt(form.pasajeros, 10);
    if (!pasajeros || pasajeros < 1) errs.pasajeros = 'Mínimo 1 pasajero';
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    onSubmit({
      origen: form.origen,
      destino: form.destino,
      fecha_salida: form.fecha_salida,
      fecha_regreso: form.fecha_regreso,
      presupuesto: parseFloat(form.presupuesto),
      pasajeros: parseInt(form.pasajeros, 10),
      incluir_hotel: incluirHotel,
      incluir_vehiculo: incluirVehiculo,
      tier,
    });
  }

  const fields = [
    { label: 'Origen', name: 'origen', type: 'text', placeholder: 'BOG', maxLength: 3 },
    { label: 'Destino', name: 'destino', type: 'text', placeholder: 'MIA', maxLength: 3 },
    { label: 'Fecha salida', name: 'fecha_salida', type: 'date', min: today() },
    { label: 'Fecha regreso', name: 'fecha_regreso', type: 'date', min: form.fecha_salida || today() },
    { label: 'Presupuesto (USD)', name: 'presupuesto', type: 'number', placeholder: '800', min: 1 },
    { label: 'Pasajeros', name: 'pasajeros', type: 'number', min: 1, max: 9 },
  ];

  return (
    <form onSubmit={handleSubmit} className="bg-surface rounded-xl card-shadow border border-border p-6 sm:p-8">
      <div className="text-center sm:text-left mb-8">
        <h2 className="font-display text-2xl sm:text-3xl text-text">
          Tus datos de viaje
        </h2>
        <p className="text-muted text-sm mt-1">
          Completa los datos y te mostraremos el mejor plan para tu presupuesto.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
        {fields.map((f) => (
          <div key={f.name}>
            <label htmlFor={f.name} className="block text-sm font-medium text-text mb-1.5">
              {f.label}
            </label>
            <input
              id={f.name}
              name={f.name}
              type={f.type}
              value={form[f.name]}
              onChange={handleChange}
              placeholder={f.placeholder}
              maxLength={f.maxLength}
              min={f.min}
              max={f.max}
              className={`input-field ${errors[f.name] ? 'ring-2 ring-warning/40 border-warning' : ''}`}
              disabled={loading}
            />
            {errors[f.name] && (
              <p className="mt-1 text-xs text-warning">{errors[f.name]}</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <p className="text-sm font-medium text-text mb-3">Estilo de viaje</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'economico', label: '💚 Económico' },
            { key: 'estandar', label: '🔵 Estándar' },
            { key: 'premium', label: '🟡 Premium' },
          ].map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setTier(opt.key)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 cursor-pointer ${
                tier === opt.key
                  ? 'bg-accent text-white border-accent'
                  : 'bg-card text-text border-border hover:bg-accent/5'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <p className="text-sm font-medium text-text mb-3">¿Qué incluir en tu plan?</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled
            title="Los vuelos siempre están incluidos en el plan"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 bg-accent/10 text-accent border-accent/20 opacity-60 cursor-not-allowed"
          >
            <span className="w-3 h-3 rounded-full bg-accent border-2 border-accent" />
            ✈ Vuelo
          </button>
          <button
            type="button"
            onClick={() => setIncluirHotel(!incluirHotel)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 cursor-pointer hover:bg-accent/5 ${
              incluirHotel
                ? 'bg-accent/10 text-accent border-accent/20'
                : 'bg-card text-muted border-border'
            }`}
          >
            <span className={`w-3 h-3 rounded-full border-2 transition-colors ${
              incluirHotel ? 'bg-accent border-accent' : 'bg-transparent border-muted'
            }`} />
            🏨 Hotel
          </button>
          <button
            type="button"
            onClick={() => setIncluirVehiculo(!incluirVehiculo)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 cursor-pointer hover:bg-accent/5 ${
              incluirVehiculo
                ? 'bg-accent/10 text-accent border-accent/20'
                : 'bg-card text-muted border-border'
            }`}
          >
            <span className={`w-3 h-3 rounded-full border-2 transition-colors ${
              incluirVehiculo ? 'bg-accent border-accent' : 'bg-transparent border-muted'
            }`} />
            🚗 Vehículo
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full sm:w-auto text-base px-8 py-3.5 disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3" />
                <path d="M12 2 A10 10 0 0 1 22 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Armando plan...
            </span>
          ) : (
            'Armar mi plan →'
          )}
        </button>
      </div>
    </form>
  );
}
