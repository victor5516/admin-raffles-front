import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RaffleStatus } from "@/services/raffles.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const raffleSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  total_tickets: z.number().min(1, "Debe haber al menos 1 ticket"),
  ticket_price: z.number().min(0, "El precio no puede ser negativo"),
  digits_length: z.number().min(1, "Mínimo 1 dígito").optional(),
  deadline: z.string().refine((val) => val !== "", "Fecha límite requerida"),
});

export type RaffleFormValues = z.infer<typeof raffleSchema>;

interface RaffleFormProps {
  initialValues?: Partial<RaffleFormValues> & { imageUrl?: string };
  onSubmit: (data: RaffleFormValues, file: File | null, status: RaffleStatus) => Promise<void>;
  isSubmitting: boolean;
  submitButtonText?: string;
}

export function RaffleForm({
  initialValues,
  onSubmit,
  isSubmitting,
  submitButtonText = "Publicar Rifa",
}: RaffleFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialValues?.imageUrl || null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RaffleFormValues>({
    resolver: zodResolver(raffleSchema),
    defaultValues: {
      total_tickets: 1000,
      ticket_price: 25.00,
      digits_length: 3,
      ...initialValues,
    },
  });

  // Handle initial values update (e.g. when data loads)
  useEffect(() => {
    if (initialValues) {
      reset({
        total_tickets: 1000,
        ticket_price: 25.00,
        digits_length: 3,
        ...initialValues,
      });
      if (initialValues.imageUrl) {
        setPreviewUrl(initialValues.imageUrl);
      }
    }
  }, [initialValues, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleFormSubmit = (status: RaffleStatus) => {
    return handleSubmit((data) => onSubmit(data, selectedFile, status));
  };

  return (
    <form className="space-y-8">
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
                <Label htmlFor="title">Título de la Rifa</Label>
                <Input
                  id="title"
                  placeholder="Ej. Sorteo Tesla Model S 2024"
                  {...register("title")}
                  className={errors.title ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {errors.title && (
                  <p className="text-xs text-red-500">{errors.title.message}</p>
                )}
              </div>

              {/* Description field removed */}

            </div>

            {/* Image Upload Area */}
            <div className="space-y-2">
              <Label>Imagen del Premio</Label>
              <div
                className="border-2 border-dashed border-border-subtle rounded-xl bg-background-dark/50 hover:bg-background-dark hover:border-primary/50 transition-all cursor-pointer h-[260px] flex flex-col items-center justify-center gap-4 group overflow-hidden relative"
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
                  <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <span className="material-symbols-outlined text-primary">cloud_upload</span>
                    </div>
                    <div className="text-center px-4">
                      <p className="text-sm font-medium text-slate-200">Haz clic para subir la foto del premio</p>
                      <p className="text-xs text-slate-500 mt-1">PNG, JPG o WebP hasta 10MB</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ticket Settings */}
      <Card className="border-border-subtle bg-card-dark">
        <CardHeader>
          <CardTitle>
            <span className="material-symbols-outlined text-emerald-400">confirmation_number</span>
            Configuración de Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="total_tickets">Total de Tickets Disponibles</Label>
              <Input
                id="total_tickets"
                type="number"
                startIcon={<span className="material-symbols-outlined text-[18px]">confirmation_number</span>}
                {...register("total_tickets", { valueAsNumber: true })}
                className={errors.total_tickets ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.total_tickets && (
                <p className="text-xs text-red-500">{errors.total_tickets.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ticket_price">Precio por Ticket</Label>
              <Input
                id="ticket_price"
                type="number"
                step="0.01"
                startIcon={<span className="material-symbols-outlined text-[18px]">attach_money</span>}
                {...register("ticket_price", { valueAsNumber: true })}
                className={errors.ticket_price ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.ticket_price && (
                <p className="text-xs text-red-500">{errors.ticket_price.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="digits_length">Longitud de Dígitos (Opcional)</Label>
              <Input
                id="digits_length"
                type="number"
                placeholder="3"
                startIcon={<span className="material-symbols-outlined text-[18px]">123</span>}
                {...register("digits_length", { valueAsNumber: true })}
                className={errors.digits_length ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.digits_length && (
                <p className="text-xs text-red-500">{errors.digits_length.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Timeline */}
      <Card className="border-border-subtle bg-card-dark">
        <CardHeader>
          <CardTitle>
            <span className="material-symbols-outlined text-purple-400">calendar_month</span>
            Cronograma de la Campaña
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="deadline">Fecha Límite</Label>
              <Input
                id="deadline"
                type="datetime-local"
                {...register("deadline")}
                className={errors.deadline ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              <p className="text-[10px] text-slate-500">Fecha en que finaliza la rifa.</p>
              {errors.deadline && (
                <p className="text-xs text-red-500">{errors.deadline.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
        <Button
          type="button"
          variant="outline"
          className="border-border-subtle bg-card-dark text-slate-300 hover:text-white hover:border-slate-500"
          onClick={handleFormSubmit(RaffleStatus.DRAFT)}
          disabled={isSubmitting}
        >
          Guardar como Borrador
        </Button>
        <Button
          type="button"
          onClick={handleFormSubmit(RaffleStatus.ACTIVE)}
          disabled={isSubmitting}
          className="bg-primary hover:bg-primary-dark text-white shadow-glow"
        >
          {isSubmitting ? "Guardando..." : submitButtonText}
        </Button>
      </div>
    </form>
  );
}
