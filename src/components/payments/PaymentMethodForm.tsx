import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { currenciesService, type Currency } from "@/services/currencies.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState, useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";

const paymentMethodSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  minimum_payment_amount: z.number().min(0, "El monto mínimo no puede ser negativo"),
  currency: z.string().min(1, "Debe seleccionar una moneda"),
  fields: z.array(
    z.object({
      key: z.string().min(1, "Nombre del campo requerido"),
      value: z.string().min(1, "Valor requerido"),
    })
  ).min(1, "Debe agregar al menos un campo de datos"),
});

export type PaymentMethodFormValues = z.infer<typeof paymentMethodSchema>;

interface PaymentMethodFormProps {
  initialValues?: Partial<PaymentMethodFormValues> & { imageUrl?: string };
  onSubmit: (data: PaymentMethodFormValues, file: File | null) => Promise<void>;
  isSubmitting: boolean;
  submitButtonText?: string;
  onCancel?: () => void;
}

export function PaymentMethodForm({
  initialValues,
  onSubmit,
  isSubmitting,
  submitButtonText = "Crear Método de Pago",
  onCancel,
}: PaymentMethodFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialValues?.imageUrl || null);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoadingCurrencies, setIsLoadingCurrencies] = useState(true);

  useEffect(() => {
    loadCurrencies();
  }, []);

  const loadCurrencies = async () => {
    try {
      setIsLoadingCurrencies(true);
      const data = await currenciesService.listCurrencies();
      setCurrencies(data);
    } catch (error) {
      console.error("Failed to load currencies:", error);
    } finally {
      setIsLoadingCurrencies(false);
    }
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    reset,
  } = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      name: "",
      minimum_payment_amount: 0,
      currency: "",
      fields: [{ key: "", value: "" }],
      ...initialValues,
    },
  });

  // Update default currency when currencies are loaded (only if no initial currency is set)
  useEffect(() => {
    if (currencies.length > 0 && !initialValues?.currency) {
      reset({
        name: initialValues?.name || "",
        minimum_payment_amount: initialValues?.minimum_payment_amount || 0,
        currency: currencies[0].symbol,
        fields: initialValues?.fields || [{ key: "", value: "" }],
      });
    } else if (currencies.length > 0 && initialValues?.currency) {
      // Ensure the currency from initialValues is set when currencies are loaded
      reset({
        name: initialValues?.name || "",
        minimum_payment_amount: initialValues?.minimum_payment_amount || 0,
        currency: initialValues.currency,
        fields: initialValues?.fields || [{ key: "", value: "" }],
      });
    }
  }, [currencies, initialValues, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "fields",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleFormSubmit = handleSubmit((data) => {
    onSubmit(data, selectedFile);
  });

  // Watch fields for JSON preview
  const watchedFields = watch("fields");
  const jsonPreview = watchedFields?.reduce((acc, field) => {
    if (field.key) {
      acc[field.key] = field.value;
    }
    return acc;
  }, {} as Record<string, string>);

  return (
    <form onSubmit={handleFormSubmit} className="space-y-8">
      {/* General Information */}
      <Card className="border-border-subtle bg-card-dark">
        <CardHeader>
          <CardTitle>
            <span className="material-symbols-outlined text-blue-400">info</span>
            Información General
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del método de pago *</Label>
                <Input
                  id="name"
                  placeholder="Ej: Transferencia Bancaria"
                  {...register("name")}
                  className={errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="minimum_payment_amount">Monto mínimo de pago *</Label>
                  <Input
                    id="minimum_payment_amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("minimum_payment_amount", { valueAsNumber: true })}
                    className={errors.minimum_payment_amount ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {errors.minimum_payment_amount && (
                    <p className="text-xs text-red-500">{errors.minimum_payment_amount.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Moneda *</Label>
                  {isLoadingCurrencies ? (
                    <div className="flex h-10 w-full rounded-lg border border-border-subtle bg-background-dark px-3 py-2 text-sm items-center text-slate-500">
                      <span className="material-symbols-outlined animate-spin text-[18px] mr-2">progress_activity</span>
                      Cargando monedas...
                    </div>
                  ) : (
                    <select
                      id="currency"
                      {...register("currency")}
                      className="flex h-10 w-full rounded-lg border border-border-subtle bg-background-dark px-3 py-2 text-sm ring-offset-background placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors text-slate-200"
                    >
                      {currencies.length === 0 ? (
                        <option value="">No hay monedas disponibles</option>
                      ) : (
                        currencies.map((currency) => (
                          <option key={currency.uid} value={currency.symbol}>
                            {currency.symbol} - {currency.name}
                          </option>
                        ))
                      )}
                    </select>
                  )}
                  {errors.currency && (
                    <p className="text-xs text-red-500">{errors.currency.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Image Upload Area */}
            <div className="space-y-2">
              <Label>Logo</Label>
              <div
                className="border-2 border-dashed border-border-subtle rounded-xl bg-background-dark/50 hover:bg-background-dark hover:border-primary/50 transition-all cursor-pointer h-[200px] flex flex-col items-center justify-center gap-4 group overflow-hidden relative"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />

                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-contain p-4" />
                ) : (
                  <>
                    <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <span className="material-symbols-outlined text-primary">cloud_upload</span>
                    </div>
                    <div className="text-center px-4">
                      <p className="text-sm font-medium text-slate-200">Subir logo</p>
                      <p className="text-xs text-slate-500 mt-1">PNG, JPG</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Payment Data */}
      <Card className="border-border-subtle bg-card-dark">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            <span className="material-symbols-outlined text-emerald-400">data_object</span>
            Datos de Pago
          </CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ key: "", value: "" })}
            className="border-border-subtle hover:bg-white/5 hover:text-white"
          >
            <span className="material-symbols-outlined text-[18px] mr-2">add</span>
            Agregar Campo
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-start animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="space-y-2">
                  <Label className={index !== 0 ? "md:hidden" : ""}>Nombre del campo</Label>
                  <Input
                    placeholder="Ej: Banco, Cedula..."
                    {...register(`fields.${index}.key`)}
                    className={errors.fields?.[index]?.key ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {errors.fields?.[index]?.key && (
                    <p className="text-xs text-red-500">{errors.fields[index]?.key?.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className={index !== 0 ? "md:hidden" : ""}>Valor</Label>
                  <Input
                    placeholder="Ej: Banco de Venezuela..."
                    {...register(`fields.${index}.value`)}
                    className={errors.fields?.[index]?.value ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {errors.fields?.[index]?.value && (
                    <p className="text-xs text-red-500">{errors.fields[index]?.value?.message}</p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  className="mt-8 text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                  disabled={fields.length === 1}
                  title="Eliminar campo"
                >
                  <span className="material-symbols-outlined">close</span>
                </Button>
              </div>
            ))}
          </div>

          <div className="bg-background-dark/50 rounded-lg p-4 border border-border-subtle/50 font-mono text-sm">
            <p className="text-xs text-slate-500 mb-2">Vista previa del JSON:</p>
            <pre className="text-slate-300 overflow-x-auto">
              {JSON.stringify(jsonPreview, null, 2)}
            </pre>
          </div>
          {errors.fields && (
             <p className="text-xs text-red-500">{errors.fields.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Footer Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            className="border-border-subtle bg-card-dark text-slate-300 hover:text-white hover:border-slate-500"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary hover:bg-primary-dark text-white shadow-glow"
        >
          {isSubmitting ? "Guardando..." : submitButtonText}
        </Button>
      </div>
    </form>
  );
}
