import { PaymentMethodForm, type PaymentMethodFormValues } from "@/components/payments/PaymentMethodForm";
import { paymentMethodsService } from "@/services/payment-methods.service";
import { currenciesService } from "@/services/currencies.service";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export function CreatePaymentMethodPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: PaymentMethodFormValues, file: File | null) => {
    try {
      setIsSubmitting(true);

      // Get currency_id from currency symbol
      const currencies = await currenciesService.listCurrencies();
      const selectedCurrency = currencies.find(c => c.symbol === data.currency);
      if (!selectedCurrency) {
        alert("Error: Moneda no encontrada");
        return;
      }

      // Transform form fields array back to object
      const paymentData = data.fields.reduce((acc, field) => {
        if (field.key) {
          acc[field.key] = field.value;
        }
        return acc;
      }, {} as Record<string, string>);

      await paymentMethodsService.createPaymentMethod(
        {
          name: data.name,
          accountHolderName: data.accountHolderName,
          minimum_payment_amount: data.minimum_payment_amount,
          currency_id: selectedCurrency.uid,
          payment_data: paymentData,
        },
        file || undefined
      );

      navigate("/payment-methods");
    } catch (error) {
      console.error("Failed to create payment method:", error);
      alert("Error al crear el método de pago");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link to="/payment-methods" className="text-slate-400 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight">Crear Método de Pago</h2>
          </div>
          <p className="text-slate-400 ml-7">Agrega una nueva forma de pago para que los clientes puedan comprar tickets.</p>
        </div>
      </header>

      <div className="max-w-4xl">
        <PaymentMethodForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          onCancel={() => navigate("/payment-methods")}
        />
      </div>
    </>
  );
}
