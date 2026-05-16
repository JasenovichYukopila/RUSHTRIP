import { useState, useRef, useCallback } from 'react';
import PlanForm from '../components/PlanForm';
import PlanResult from '../components/PlanResult';
import LoadingPlane from '../components/LoadingPlane';
import { createPlan } from '../api/client';

export default function Plan() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formKey, setFormKey] = useState(0);
  const lastForm = useRef(null);
  const formRef = useRef(null);

  async function handleSubmit(formData) {
    lastForm.current = formData;
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const result = await createPlan(formData);
      setData(result);
    } catch (err) {
      const message = err?.userMessage || err?.response?.data?.detail || err?.message || 'Error al conectar con el servidor';
      setError(new Error(message));
    } finally {
      setLoading(false);
    }
  }

  async function handleRetry() {
    if (lastForm.current) {
      await handleSubmit(lastForm.current);
    }
  }

  const handleModify = useCallback(() => {
    // Force PlanForm remount so it re-reads localStorage and resets to step 1
    setFormKey((k) => k + 1);
    setData(null);
    setError(null);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }, []);

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10" ref={formRef}>
          <h1 className="font-display text-3xl sm:text-4xl text-text">
            Arma tu viaje
          </h1>
          <p className="mt-2 text-muted">
            Completa los datos y te mostraremos el mejor plan para tu presupuesto.
          </p>
          <div className="separator mt-5 max-w-xs mx-auto">
            <span className="text-accent text-sm">✈</span>
          </div>
        </div>

        <PlanForm key={formKey} onSubmit={handleSubmit} loading={loading} />

        <div className="mt-10">
          {loading && <LoadingPlane />}
          {!loading && (data || error) && (
            <PlanResult
              data={data}
              error={error}
              loading={false}
              onRetry={handleRetry}
              onModify={handleModify}
            />
          )}
        </div>
      </div>
    </div>
  );
}
