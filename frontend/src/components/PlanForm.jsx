import { useState, useEffect } from 'react';
import AirportInput from './AirportInput';
import { getMinBudget } from '../api/client';

const TIERS = [
  {
    key: 'economico',
    label: 'Económico',
    stars: 3,
    icon: '💪',
    desc: 'Viaje funcional, vuelo directo + hoteles 1-3★',
  },
  {
    key: 'estandar',
    label: 'Estándar',
    stars: 4,
    icon: '⭐',
    desc: 'Balance calidad/precio, hoteles 3-4★',
  },
  {
    key: 'premium',
    label: 'Premium',
    stars: 5,
    icon: '👑',
    desc: 'Máxima comodidad, hoteles 4-5★, sin low-cost',
  },
];

function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {[1, 2].map((step) => (
        <div key={step} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ease-smooth ${
                step <= currentStep
                  ? 'bg-accent text-white shadow-lg shadow-accent/25'
                  : 'bg-border-100 text-muted-300'
              }`}
            >
              {step < currentStep ? (
                <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 10 L8 14 L16 6" />
                </svg>
              ) : (
                step
              )}
            </div>
            <span className={`text-xs font-medium ${step <= currentStep ? 'text-accent' : 'text-muted-300'}`}>
              {step === 1 ? 'Destino' : 'Presupuesto'}
            </span>
          </div>
          {step === 1 && (
            <div className={`w-16 sm:w-24 h-0.5 mx-2 sm:mx-3 rounded-full transition-colors duration-300 ${
              currentStep > 1 ? 'bg-accent' : 'bg-border-100'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}

function BudgetSlider({ value, min, max, suggested, onChange }) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="relative pt-2 pb-1">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-300">${min}</span>
        <span className="text-xs text-muted-300">${max}</span>
      </div>
      <div className="relative h-12 flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={10}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer bg-border-100
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent
            [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-accent/30
            [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
            [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-200
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-accent
            [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white
            [&::-moz-range-thumb]:shadow-lg"
          style={{
            background: `linear-gradient(to right, #E8611A 0%, #E8611A ${pct}%, #E8DDD0 ${pct}%, #E8DDD0 100%)`,
          }}
        />
        <div
          className="absolute -top-3 font-mono text-sm font-bold text-accent bg-white px-2 py-0.5 rounded-md shadow-sm border border-border-100 transition-all duration-150"
          style={{ left: `calc(${pct}% - 20px)` }}
        >
          ${value}
        </div>
      </div>
      {suggested > min && suggested <= max && (
        <div className="flex items-center gap-2 mt-3">
          <div className="w-px h-8 bg-accent2/30" />
          <div className="text-xs text-muted-300">
            <span className="text-accent font-medium">Sugerido: ${suggested}</span>
            {value < suggested && (
              <span className="ml-2 text-warning">— Por debajo de lo recomendado</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StepPanel({ children, isActive }) {
  return (
    <div
      className={`transition-all duration-500 ease-smooth ${
        isActive
          ? 'opacity-100 translate-x-0 max-h-[2000px]'
          : 'opacity-0 translate-x-8 max-h-0 overflow-hidden'
      }`}
    >
      {children}
    </div>
  );
}

export default function PlanForm({ onPlanCreated, onPlanError, onPlanLoading }) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    origen: null,
    origenCode: '',
    destino: null,
    destinoCode: '',
    fecha_salida: '',
    pasajeros: 2,
    presupuesto: 800,
    tier: 'estandar',
    incluir_hotel: true,
    incluir_vehiculo: false,
    duracion_dias: 7,
  });

  const [minBudgetData, setMinBudgetData] = useState(null);
  const [loadingMinBudget, setLoadingMinBudget] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('rushtrip_last_search');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const cleaned = { ...parsed };
        delete cleaned.modo;
        delete cleaned.fecha_regreso;
        setForm((prev) => ({ ...prev, ...cleaned }));
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    if (!form.origenCode || !form.destinoCode || !form.fecha_salida) return;
    const fecha_regreso = _calcularRegreso(form.fecha_salida, form.duracion_dias);
    setLoadingMinBudget(true);
    getMinBudget({
      origen: form.origenCode,
      destino: form.destinoCode,
      fecha_salida: form.fecha_salida,
      fecha_regreso,
      pasajeros: form.pasajeros,
      incluir_hotel: form.incluir_hotel,
      incluir_vehiculo: form.incluir_vehiculo,
    })
      .then((data) => {
        setMinBudgetData(data);
        const suggested = data?.presupuesto_minimo_sugerido || 800;
        setForm((prev) => ({
          ...prev,
          presupuesto: Math.max(prev.presupuesto, suggested),
        }));
      })
      .catch(() => {
        setMinBudgetData(null);
      })
      .finally(() => setLoadingMinBudget(false));
  }, [form.origenCode, form.destinoCode, form.fecha_salida, form.duracion_dias, form.pasajeros, form.incluir_hotel, form.incluir_vehiculo]);

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const min = minBudgetData?.presupuesto_minimo_sugerido || 300;
  const max = Math.max(min * 4, 2000);

  function _calcularRegreso(salida, dias) {
    if (!salida) return '';
    const d = new Date(salida);
    d.setDate(d.getDate() + dias);
    return d.toISOString().split('T')[0];
  }

  const validateStep1 = () => {
    const e = {};
    if (!form.origenCode) e.origen = 'Selecciona un origen';
    if (!form.destinoCode) e.destino = 'Selecciona un destino';
    if (!form.fecha_salida) e.fecha_salida = 'Selecciona fecha de salida';
    if (form.origenCode && form.destinoCode && form.origenCode === form.destinoCode) {
      e.destino = 'El destino debe ser diferente al origen';
    }
    if (form.duracion_dias > 30) e.duracion_dias = 'Máximo 30 días';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (form.presupuesto < min) {
      e.presupuesto = `Mínimo sugerido: $${min}`;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setSubmitting(true);
    if (onPlanLoading) onPlanLoading(true);
    try {
      const fecha_regreso = _calcularRegreso(form.fecha_salida, form.duracion_dias);
      const payload = {
        origen: form.origenCode,
        destino: form.destinoCode,
        fecha_salida: form.fecha_salida,
        fecha_regreso,
        presupuesto: form.presupuesto,
        pasajeros: form.pasajeros,
        incluir_hotel: form.incluir_hotel,
        incluir_vehiculo: form.incluir_vehiculo,
        tier: form.tier,
        modo: 'exacto',
        duracion_dias: form.duracion_dias,
      };

      localStorage.setItem('rushtrip_last_search', JSON.stringify({
        origenCode: form.origenCode,
        destinoCode: form.destinoCode,
        pasajeros: form.pasajeros,
        tier: form.tier,
        incluir_hotel: form.incluir_hotel,
        incluir_vehiculo: form.incluir_vehiculo,
      }));

      const { createPlan } = await import('../api/client');
      const data = await createPlan(payload);
      if (onPlanError) onPlanError(null);
      if (onPlanCreated) onPlanCreated(data);
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'Error al crear el plan';
      setErrors({ submit: msg });
      if (onPlanError) onPlanError(new Error(msg));
    } finally {
      setSubmitting(false);
      if (onPlanLoading) onPlanLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <StepIndicator currentStep={step} />

      <div className="bg-white rounded-xl border border-border-100 card-shadow-lg p-6 sm:p-8">
        {/* Step 1: Destination & Dates */}
        <StepPanel isActive={step === 1}>
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AirportInput
                label="Origen"
                placeholder="Ej: Bogotá, Medellín..."
                value={form.origen}
                onChange={(item, code) => {
                  update('origen', item);
                  update('origenCode', code);
                }}
              />
              <AirportInput
                label="Destino"
                placeholder="Ej: Madrid, Miami..."
                value={form.destino}
                onChange={(item, code) => {
                  update('destino', item);
                  update('destinoCode', code);
                }}
              />
            </div>
            {errors.origen && <p className="text-xs text-error mt-1">{errors.origen}</p>}
            {errors.destino && <p className="text-xs text-error mt-1">{errors.destino}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-500 mb-1.5">Fecha de salida</label>
                <input
                  type="date"
                  min={today}
                  value={form.fecha_salida}
                  onChange={(e) => update('fecha_salida', e.target.value)}
                  className="input-field"
                />
                {errors.fecha_salida && <p className="text-xs text-error mt-1">{errors.fecha_salida}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-500 mb-1.5">Duración</label>
                <select
                  value={form.duracion_dias}
                  onChange={(e) => update('duracion_dias', Number(e.target.value))}
                  className="input-field"
                >
                  <option value={3}>3 días</option>
                  <option value={5}>5 días</option>
                  <option value={7}>1 semana</option>
                  <option value={10}>10 días</option>
                  <option value={14}>2 semanas</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-500 mb-1.5">Pasajeros</label>
              <select
                value={form.pasajeros}
                onChange={(e) => update('pasajeros', Number(e.target.value))}
                className="input-field max-w-[120px]"
              >
                {[...Array(9)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} {i === 0 ? 'pasajero' : 'pasajeros'}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-4">
              <button
                onClick={() => validateStep1() && setStep(2)}
                className="btn-primary w-full sm:w-auto"
              >
                Siguiente →
              </button>
            </div>
          </div>
        </StepPanel>

        {/* Step 2: Budget & Preferences */}
        <StepPanel isActive={step === 2}>
          <div className="space-y-6">
            <div className="text-center mb-2">
              <p className="text-xs text-muted-300 uppercase tracking-wider mb-1">Presupuesto total</p>
              <p className="font-mono text-4xl sm:text-5xl font-bold text-accent">
                ${form.presupuesto}
              </p>
              {loadingMinBudget && (
                <p className="text-xs text-muted-300 mt-1">Calculando presupuesto mínimo...</p>
              )}
              {minBudgetData && form.presupuesto < minBudgetData.presupuesto_minimo_sugerido && (
                <p className="text-xs text-warning mt-1">
                  Por debajo del mínimo sugerido (${minBudgetData.presupuesto_minimo_sugerido})
                </p>
              )}
              {minBudgetData && form.presupuesto >= minBudgetData.presupuesto_minimo_sugerido && (
                <p className="text-xs text-success mt-1">
                  ✓ Presupuesto suficiente
                </p>
              )}
            </div>

            <BudgetSlider
              value={form.presupuesto}
              min={Math.floor(min / 10) * 10}
              max={Math.ceil(max / 10) * 10}
              suggested={minBudgetData?.presupuesto_minimo_sugerido || min}
              onChange={(v) => update('presupuesto', v)}
            />
            {errors.presupuesto && <p className="text-xs text-error">{errors.presupuesto}</p>}

            <div>
              <label className="block text-sm font-medium text-muted-500 mb-3">Tipo de viaje</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {TIERS.map((tier) => {
                  const active = form.tier === tier.key;
                  return (
                    <button
                      key={tier.key}
                      type="button"
                      onClick={() => update('tier', tier.key)}
                      className={`relative rounded-xl border-2 p-4 text-left transition-all duration-200 ease-smooth ${
                        active
                          ? 'border-accent bg-accent/5 card-shadow-md'
                          : 'border-border-100 bg-white hover:border-border-300 hover:card-shadow'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-lg">{tier.icon}</span>
                        <span className={`font-semibold text-sm ${active ? 'text-accent' : 'text-text'}`}>
                          {tier.label}
                        </span>
                      </div>
                      <div className="flex gap-0.5 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-xs ${i < tier.stars ? 'text-warning' : 'text-border-200'}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-muted-300 leading-relaxed">{tier.desc}</p>
                      {active && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                          <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2.5 6 L5 8.5 L9.5 3" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                  form.incluir_hotel
                    ? 'bg-accent border-accent'
                    : 'border-border-300 group-hover:border-accent/50'
                }`}>
                  {form.incluir_hotel && (
                    <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 6 L5 9 L10 3" />
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={form.incluir_hotel}
                  onChange={(e) => update('incluir_hotel', e.target.checked)}
                  className="sr-only"
                />
                <span className="text-sm text-muted-400 group-hover:text-text transition-colors">Incluir hotel</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                  form.incluir_vehiculo
                    ? 'bg-accent border-accent'
                    : 'border-border-300 group-hover:border-accent/50'
                }`}>
                  {form.incluir_vehiculo && (
                    <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 6 L5 9 L10 3" />
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={form.incluir_vehiculo}
                  onChange={(e) => update('incluir_vehiculo', e.target.checked)}
                  className="sr-only"
                />
                <span className="text-sm text-muted-400 group-hover:text-text transition-colors">Incluir vehículo</span>
              </label>
            </div>

            {errors.submit && (
              <div className="p-3 rounded-lg bg-error/5 border border-error/20 text-sm text-error">
                {errors.submit}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setStep(1)}
                className="btn-outline"
              >
                ← Atrás
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-primary flex-1 sm:flex-none"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Armando plan...
                  </span>
                ) : (
                  'Armar mi plan →'
                )}
              </button>
            </div>
          </div>
        </StepPanel>
      </div>
    </div>
  );
}
