import { RaffleForm } from "@/components/raffles/RaffleForm";
import type { RaffleFormValues } from "@/components/raffles/RaffleForm";
import { rafflesService, RaffleStatus } from "@/services/raffles.service";
import type { UpdateRaffleDto } from "@/services/raffles.service";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

export function EditRafflePage() {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialValues, setInitialValues] = useState<Partial<RaffleFormValues> & { imageUrl?: string }>();

  useEffect(() => {
    async function loadRaffle() {
      if (!uid) return;
      try {
        const raffle = await rafflesService.getRaffle(uid);

        // Format deadline for datetime-local input (YYYY-MM-DDThh:mm)
        const deadlineDate = new Date(raffle.deadline);
        // Adjust to local ISO string format that input accepts
        // A simple way is to use slice(0, 16) on an ISO string if it was UTC, but we want local time for the input usually?
        // Actually, datetime-local works with local time.
        // Let's manually format it to YYYY-MM-DDThh:mm
        const offset = deadlineDate.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(deadlineDate.getTime() - offset)).toISOString().slice(0, 16);

        setInitialValues({
          title: raffle.title,
          total_tickets: raffle.totalTickets,
          ticket_price: raffle.ticketPrice,
          digits_length: raffle.digitsLength,
          deadline: localISOTime,
          imageUrl: raffle.imageUrl,
        });
      } catch (error) {
        console.error("Failed to load raffle:", error);
        // TODO: Show toast error
        navigate("/rifas");
      } finally {
        setIsLoading(false);
      }
    }

    loadRaffle();
  }, [uid, navigate]);

  const onSubmit = async (data: RaffleFormValues, file: File | null, status: RaffleStatus) => {
    if (!uid) return;
    setIsSubmitting(true);
    try {
      const dto: UpdateRaffleDto = {
        title: data.title,
        total_tickets: data.total_tickets,
        ticket_price: data.ticket_price,
        digits_length: data.digits_length,
        status: status,
        deadline: new Date(data.deadline).toISOString(),
      };

      await rafflesService.updateRaffle(uid, dto, file || undefined);
      navigate("/rifas");
    } catch (error) {
      console.error("Failed to update raffle:", error);
      // TODO: Show toast error
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
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
              Editar Rifa
            </h1>
            <p className="text-slate-400">
              Modifica los detalles de tu rifa existente.
            </p>
          </div>
        </div>
      </div>

      <RaffleForm
        initialValues={initialValues}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        submitButtonText="Guardar Cambios"
      />
    </div>
  )
}
