import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setError(null);
      await login(data);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al iniciar sesión. Verifique sus credenciales.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-background-light dark:bg-background flex flex-col relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute right-0 bottom-0 pointer-events-none opacity-50">
         <svg width="400" height="400" viewBox="0 0 200 200" className="text-slate-200 dark:text-slate-800 fill-current">
            <path d="M100 180 C 150 160, 180 120, 180 60 L 100 30 L 20 60 C 20 120, 50 160, 100 180 Z" />
            <path d="M70 90 L 90 110 L 130 70" stroke="white" strokeWidth="15" fill="none" strokeLinecap="round" strokeLinejoin="round" />
         </svg>
      </div>

      {/* Header */}
      <header className="w-full p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-glow">
            <span className="material-symbols-outlined text-white text-[20px]">confirmation_number</span>
          </div>
          <span className="font-display font-bold text-slate-900 dark:text-white text-lg">RaffleAdmin</span>
        </div>
        <Button variant="secondary" className="bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
          Soporte
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-md">
          <Card className="border-border-subtle bg-white dark:bg-card-dark shadow-xl">
            <CardContent className="pt-10 pb-10 px-8 flex flex-col items-center text-center">

              <div className="size-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
                 <span className="material-symbols-outlined text-primary text-2xl">lock</span>
              </div>

              <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Bienvenido
              </h1>
              <p className="text-slate-500 text-sm mb-8">
                Ingresa tus credenciales para administrar la plataforma
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4 text-left">
                {error && (
                   <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
                     {error}
                   </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 dark:text-slate-200">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ejemplo@correo.com"
                    startIcon={<span className="material-symbols-outlined text-[18px]">mail</span>}
                    className="bg-slate-50 dark:bg-background-dark border-slate-200 dark:border-border-subtle text-slate-900 dark:text-slate-200 focus-visible:ring-primary"
                    {...register('email')}
                  />
                  {errors.email && (
                    <span className="text-xs text-destructive">{errors.email.message}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700 dark:text-slate-200">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    startIcon={<span className="material-symbols-outlined text-[18px]">lock</span>}
                    className="bg-slate-50 dark:bg-background-dark border-slate-200 dark:border-border-subtle text-slate-900 dark:text-slate-200 focus-visible:ring-primary"
                    {...register('password')}
                  />
                  {errors.password && (
                    <span className="text-xs text-destructive">{errors.password.message}</span>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-slate-900 hover:bg-slate-800 dark:bg-primary dark:hover:bg-primary-dark text-white gap-2 mt-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                  {!isSubmitting && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
                </Button>

                <div className="flex justify-center mt-4">
                  <a href="#" className="text-sm font-medium text-slate-500 hover:text-primary transition-colors">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Secure Badge */}
          <div className="mt-8 flex items-center justify-between px-4 py-3 rounded-lg bg-slate-100 dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10">
            <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">Secure Access Portal</span>
            <div className="flex gap-1">
              <div className="size-1.5 rounded-full bg-emerald-500"></div>
              <div className="size-1.5 rounded-full bg-emerald-500"></div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400">© 2026 RaffleAdmin Management System. Todos los derechos reservados.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
