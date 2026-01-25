import { PaymentMethodForm, type PaymentMethodFormValues } from "@/components/payments/PaymentMethodForm";
import { paymentMethodsService } from "@/services/payment-methods.service";
import { currenciesService } from "@/services/currencies.service";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

export function EditPaymentMethodPage() {
  const { uid } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialValues, setInitialValues] = useState<(Partial<PaymentMethodFormValues> & { imageUrl?: string }) | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (uid) {
      loadPaymentMethod(uid);
    }
  }, [uid]);

  const loadPaymentMethod = async (id: string) => {
    try {
      setIsLoading(true);
      const data = await paymentMethodsService.getPaymentMethod(id);

      // Transform API data to Form values
      const fields = Object.entries(data.paymentData || {}).map(([key, value]) => ({
        key,
        value: String(value),
      }));

      // Ensure at least one empty field if none exist, though schema requires 1
      if (fields.length === 0) {
        fields.push({ key: "", value: "" });
      }

      setInitialValues({
        name: data.name,
        accountHolderName: data.accountHolderName || "",
        minimum_payment_amount: Number(data.minimumPaymentAmount),
        currency: data.currency,
        fields: fields,
        imageUrl: data.imageUrl,
      });
    } catch (error) {
      console.error("Failed to load payment method:", error);
      alert("Error al cargar el método de pago");
      navigate("/payment-methods");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: PaymentMethodFormValues, file: File | null) => {
    if (!uid) return;

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

      await paymentMethodsService.updatePaymentMethod(
        uid,
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
      console.error("Failed to update payment method:", error);
      alert("Error al actualizar el método de pago");
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
            <Link to="/payment-methods" className="text-slate-400 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight">Editar Método de Pago</h2>
          </div>
          <p className="text-slate-400 ml-7">Modifica los detalles y configuración del método de pago.</p>
        </div>
      </header>

      <div className="max-w-4xl">
        <PaymentMethodForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitButtonText="Guardar Cambios"
          onCancel={() => navigate("/payment-methods")}
        />
      </div>
    </>
  );
}
