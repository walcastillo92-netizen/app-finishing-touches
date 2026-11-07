import type { ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Home, PlusCircle, LayoutList, UserRound, LogOut, Repeat } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { sb } from "@/lib/trueques";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/session";
import { Button } from "@/components/ui/button";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <img src="/icon.svg" alt="" className="h-9 w-9 rounded-xl" />
      <span className="font-display text-lg font-extrabold leading-none tracking-tight text-primary">
        MORENO<span className="text-foreground"> CERCA</span>
      </span>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const session = useSession();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: noLeidos } = useQuery({
    queryKey: ["avisos-no-leidos", session?.user.id],
    enabled: !!session,
    refetchInterval: 30000,
    queryFn: async () => {
      const { count } = await sb
        .from("notificaciones")
        .select("id", { count: "exact", head: true })
        .eq("leida", false);
      return count ?? 0;
    },
  });

  async function salir() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const nav = [
    { to: "/", label: "Inicio", icon: Home },
    { to: "/publicar", label: "Publicar", icon: PlusCircle },
    { to: "/trueques", label: "Trueques", icon: Repeat },
    { to: "/mis-publicaciones", label: "Mis publicaciones", icon: LayoutList },
    { to: "/perfil", label: "Perfil", icon: UserRound },
  ] as const;

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <header className="sticky top-0 z-30 border-b bg-card/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted"
                activeProps={{ className: "bg-accent text-accent-foreground" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
                {n.to === "/trueques" && !!noLeidos && (
                  <span className="ml-1 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                    {noLeidos}
                  </span>
                )}
              </Link>
            ))}
          </nav>
          {session === undefined ? (
            <span className="w-20" />
          ) : session ? (
            <Button variant="ghost" size="sm" onClick={salir} className="gap-1">
              <LogOut className="h-4 w-4" /> Salir
            </Button>
          ) : (
            <Button asChild size="sm" className="rounded-full">
              <Link to="/auth">Entrar</Link>
            </Button>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-5">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t bg-card md:hidden">
        {nav.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            className="flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold text-muted-foreground"
            activeProps={{ className: "text-primary" }}
            activeOptions={{ exact: n.to === "/" }}
          >
            <span className="relative">
              <n.icon className="h-5 w-5" />
              {n.to === "/trueques" && !!noLeidos && (
                <span className="absolute -right-2 -top-1.5 rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
                  {noLeidos}
                </span>
              )}
            </span>
            {n.label === "Mis publicaciones" ? "Mías" : n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
