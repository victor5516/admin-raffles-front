import { CurrencyForm, type CurrencyFormValues } from "@/components/currencies/CurrencyForm";
import { currenciesService } from "@/services/currencies.service";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export function CreateCurrencyPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CurrencyFormValues) => {
    try {
      setIsSubmitting(true);

      await currenciesService.createCurrency({
        name: data.name,
        symbol: data.symbol,
        value: data.value,
      });

      navigate("/divisas");
    } catch (error) {
      console.error("Failed to create currency:", error);
      alert("Error al crear la divisa");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link to="/divisas" className="text-slate-400 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight">Crear Divisa</h2>
          </div>
          <p className="text-slate-400 ml-7">Agrega una nueva divisa al sistema.</p>
        </div>
      </header>

      <div className="max-w-4xl">
        <CurrencyForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          onCancel={() => navigate("/divisas")}
        />
      </div>
    </>
  );
}
