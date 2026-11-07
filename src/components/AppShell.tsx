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
      const { count } = await sb.from("notificaciones").select("id", { count: "exact", head: true }).eq("leida", false);
      return count ?? 0;
    },
