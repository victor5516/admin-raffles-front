import { CurrencyForm, type CurrencyFormValues } from "@/components/currencies/CurrencyForm";
import { currenciesService } from "@/services/currencies.service";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

export function EditCurrencyPage() {
  const { uid } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialValues, setInitialValues] = useState<Partial<CurrencyFormValues> | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (uid) {
      loadCurrency(uid);
    }
  }, [uid]);

  const loadCurrency = async (id: string) => {
    try {
      setIsLoading(true);
      const data = await currenciesService.getCurrency(id);

      setInitialValues({
        name: data.name,
        symbol: data.symbol,
        value: Number(data.value),
      });
    } catch (error) {
      console.error("Failed to load currency:", error);
      alert("Error al cargar la divisa");
      navigate("/divisas");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: CurrencyFormValues) => {
    if (!uid) return;

    try {
      setIsSubmitting(true);

      await currenciesService.updateCurrency(uid, {
        name: data.name,
        symbol: data.symbol,
        value: data.value,
      });

      navigate("/divisas");
    } catch (error) {
      console.error("Failed to update currency:", error);
      alert("Error al actualizar la divisa");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-400">Cargando datos...</div>
      </div>
    );
  }

  return (
    <>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link to="/divisas" className="text-slate-400 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight">Editar Divisa</h2>
          </div>
          <p className="text-slate-400 ml-7">Modifica los detalles de la divisa.</p>
        </div>
      </header>

      <div className="max-w-4xl">
        <CurrencyForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitButtonText="Guardar Cambios"
          onCancel={() => navigate("/divisas")}
        />
      </div>
    </>
  );
}
