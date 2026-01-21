import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const currencySchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  symbol: z.string().min(1, "El símbolo es requerido"),
  value: z.number().min(0, "El valor no puede ser negativo"),
});

export type CurrencyFormValues = z.infer<typeof currencySchema>;

interface CurrencyFormProps {
  initialValues?: Partial<CurrencyFormValues>;
  onSubmit: (data: CurrencyFormValues) => Promise<void>;
  isSubmitting: boolean;
  submitButtonText?: string;
  onCancel?: () => void;
}

export function CurrencyForm({
  initialValues,
  onSubmit,
  isSubmitting,
  submitButtonText = "Guardar Divisa",
  onCancel,
}: CurrencyFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CurrencyFormValues>({
    resolver: zodResolver(currencySchema),
    defaultValues: {
      name: "",
      symbol: "",
      value: 0,
      ...initialValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <Card className="border-border-subtle bg-card-dark">
        <CardHeader>
          <CardTitle>
            <span className="material-symbols-outlined text-blue-400">info</span>
            Información de la Divisa
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                placeholder="Ej: Dólar, Euro, Bolivar"
                {...register("name")}
                className={errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="symbol">Símbolo *</Label>
              <Input
                id="symbol"
                placeholder="Ej: $, €, Bs"
                {...register("symbol")}
                className={errors.symbol ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.symbol && (
                <p className="text-xs text-red-500">{errors.symbol.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">Tasa de Cambio (Valor) *</Label>
              <Input
                id="value"
                type="number"
                step="0.000001"
                placeholder="0.00"
                {...register("value", { valueAsNumber: true })}
                className={errors.value ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.value && (
                <p className="text-xs text-red-500">{errors.value.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

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
