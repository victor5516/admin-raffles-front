import { RaffleForm } from "@/components/raffles/RaffleForm";
import type { RaffleFormValues } from "@/components/raffles/RaffleForm";
import { rafflesService, RaffleStatus } from "@/services/raffles.service";
import type { CreateRaffleDto } from "@/services/raffles.service";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export function CreateRafflePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: RaffleFormValues, file: File | null, status: RaffleStatus) => {
    setIsSubmitting(true);
    try {
      const dto: CreateRaffleDto = {
        ...data,
        status,
        deadline: new Date(data.deadline).toISOString(),
      };

      await rafflesService.createRaffle(dto, file || undefined);
      navigate("/rifas");
    } catch (error) {
      console.error("Failed to create raffle:", error);
      // TODO: Show toast error
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/rifas"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark mb-4 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Volver a Rifas
        </Link>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-white tracking-tight mb-2">
              Crear Nueva Rifa
            </h1>
            <p className="text-slate-400">
              Configura tu próxima rifa de alto impacto con precisión.
            </p>
          </div>
        </div>
      </div>

      <RaffleForm onSubmit={onSubmit} isSubmitting={isSubmitting} />
    </div>
  )
}
