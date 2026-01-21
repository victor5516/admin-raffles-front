import { Sidebar } from './Sidebar';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-200">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth">
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          {children}
        </div>
      </main>
    </div>
  );
}
