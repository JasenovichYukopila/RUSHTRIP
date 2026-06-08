import { useState, useCallback } from 'react';
import PlanForm from '../components/PlanForm';
import PlanResult from '../components/PlanResult';
import LoadingPlane from '../components/LoadingPlane';

export default function Plan() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formKey, setFormKey] = useState(0);

  function handlePlanCreated(result) {
    setData(result);
    setError(null);
  }

  function handlePlanError(err) {
    setError(err);
    setData(null);
    setLoading(false);
  }

  function handlePlanLoading(isLoading) {
    setLoading(isLoading);
  }

  async function handleRetry() {
    setError(null);
    setData(null);
    setFormKey((k) => k + 1);
  }

  const handleModify = useCallback(() => {
    setFormKey((k) => k + 1);
    setData(null);
    setError(null);
    setTimeout(() => {
      document.querySelector('.plan-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }, []);

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
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

        <PlanForm
          key={formKey}
          onPlanCreated={handlePlanCreated}
          onPlanError={handlePlanError}
          onPlanLoading={handlePlanLoading}
        />

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
