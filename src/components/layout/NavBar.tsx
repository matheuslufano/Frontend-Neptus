"use client";

import {
  Bolt,
  Building2,
  ChartPie,
  CheckCircle,
  History,
  Loader2,
  MenuIcon,
  RefreshCcw,
  Shield,
  Users,
  Waves,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useUserById } from "@/hooks/useUsers";
import { pullPropertyDataSummary } from "@/lib/sync-property-local-data";
import { usePropertyStore } from "@/stores/propertyStore";
import { getUserIdFromToken } from "@/utils/jwt-util";

import AppButton, { AppButtonLogout } from "../AppButton";
import { Protected } from "../Protected";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import NavLink from "./NavLink";

type SyncPanel = "menu" | "loading" | "success";

/** Evita que o Sheet (Dialog) feche ao clicar no Select renderizado em portal fora do painel. */
function isOutsideInteractionFromSelect(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest('[data-slot="select-content"]'));
}

const NavBar = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [syncPanel, setSyncPanel] = useState<SyncPanel>("menu");
  const [syncSummary, setSyncSummary] = useState<{
    tanksCount: number;
    readingsCount: number;
  } | null>(null);
  const syncRequestId = useRef(0);
  const { selectedPropertyId, setSelectedPropertyId } = usePropertyStore();
  const isOnline = useOnlineStatus();

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getUserIdFromToken();
      setUserId(id);
    };

    fetchUserId();
  }, []);

  const { data: user, isLoading } = useUserById(userId || "", !!userId);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSyncPanel("menu");
      setSyncSummary(null);
    }
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const runPropertySync = useCallback(
    async (propertyId: string) => {
      if (!isOnline) {
        toast.error(
          "Conecte-se à internet para baixar os dados da propriedade."
        );
        return;
      }

      const requestId = ++syncRequestId.current;
      const toastId = toast.loading("Baixando dados do servidor...");
      setSyncPanel("loading");
      setSyncSummary(null);

      try {
        const summary = await pullPropertyDataSummary(propertyId);
        if (requestId !== syncRequestId.current) return;

        setSyncSummary(summary);
        setSyncPanel("success");
        toast.success(
          `Dados sincronizados! ${summary.tanksCount} tanques e ${summary.readingsCount} leituras.`,
          { id: toastId, duration: 5000 }
        );
      } catch {
        if (requestId !== syncRequestId.current) return;

        toast.error(
          "Não foi possível sincronizar. Verifique sua conexão e tente novamente.",
          { id: toastId }
        );
        setSyncPanel("menu");
      }
    },
    [isOnline]
  );

  const handlePropertyChange = useCallback(
    (propertyId: string) => {
      setSelectedPropertyId(propertyId);

      if (!isOnline) {
        toast.info(
          "Propriedade salva neste dispositivo. Conecte-se à internet para baixar tanques e leituras."
        );
        return;
      }

      void runPropertySync(propertyId);
    },
    [isOnline, runPropertySync, setSelectedPropertyId]
  );

  const handlePullData = useCallback(async () => {
    if (!selectedPropertyId) {
      toast.error("Selecione uma propriedade antes de sincronizar.");
      return;
    }
    await runPropertySync(selectedPropertyId);
  }, [runPropertySync, selectedPropertyId]);

  const handleSuccessGoHome = () => {
    setIsOpen(false);
    setSyncPanel("menu");
    setSyncSummary(null);
    router.push("/");
  };

  const handleSuccessClose = () => {
    setSyncPanel("menu");
    setSyncSummary(null);
  };

  return (
    <nav>
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetTrigger asChild className="hover:cursor-pointer">
          <MenuIcon className="h-6 w-6" />
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-[280px] gap-0 flex flex-col"
          aria-describedby="menu"
          onInteractOutside={(event) => {
            if (isOutsideInteractionFromSelect(event.target)) {
              event.preventDefault();
            }
          }}
          onPointerDownOutside={(event) => {
            if (isOutsideInteractionFromSelect(event.target)) {
              event.preventDefault();
            }
          }}
        >
          {syncPanel === "success" && syncSummary ? (
            <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500 shadow-md">
                <CheckCircle
                  className="h-11 w-11 text-white"
                  strokeWidth={2.5}
                />
              </div>
              <h2 className="text-xl font-bold text-primary mb-2">
                Tudo pronto!
              </h2>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Seus dados foram sincronizados com sucesso!
              </p>
              <div className="w-full rounded-lg bg-primary/10 px-4 py-3 text-left text-sm space-y-2 mb-8">
                <div className="flex justify-between gap-4">
                  <span className="font-medium text-primary">Tanques:</span>
                  <span className="font-semibold text-primary">
                    {syncSummary.tanksCount}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="font-medium text-primary">Leituras:</span>
                  <span className="font-semibold text-primary">
                    {syncSummary.readingsCount}
                  </span>
                </div>
              </div>
              <div className="w-full space-y-3">
                <AppButton
                  className="w-full"
                  size="lg"
                  onClick={handleSuccessGoHome}
                >
                  Ir para o início
                </AppButton>
                <AppButton
                  variant="outline"
                  className="w-full"
                  size="lg"
                  onClick={handleSuccessClose}
                >
                  Voltar ao menu
                </AppButton>
              </div>
            </div>
          ) : syncPanel === "loading" ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
              <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 px-6 py-8 w-full max-w-[260px]">
                <Loader2 className="mx-auto h-14 w-14 text-primary animate-spin mb-5" />
                <h2 className="text-lg font-bold text-primary mb-2">
                  Baixando dados
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Baixando tanques e histórico de leituras...
                </p>
                <p className="text-xs text-muted-foreground mt-5 flex items-center justify-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                  Isso pode levar alguns segundos...
                </p>
              </div>
            </div>
          ) : (
            <>
              <SheetHeader>
                <SheetTitle className="py-4 text-xl">Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col justify-between flex-1 pb-10 min-h-0">
                <div className="flex flex-col gap-2 overflow-y-auto">
                  <div className="px-4 py-2">
                    <label className="text-xs text-muted-foreground mb-2 block">
                      Propriedade
                    </label>
                    <Select
                      value={selectedPropertyId || ""}
                      onValueChange={handlePropertyChange}
                      disabled={isLoading || !user || syncPanel === "loading"}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione uma propriedade" />
                      </SelectTrigger>
                      <SelectContent
                        position="popper"
                        className="z-[200]"
                        onCloseAutoFocus={(e) => e.preventDefault()}
                      >
                        {user?.propriedades?.map((property) => (
                          <SelectItem
                            key={property.propriedade_id}
                            value={property.propriedade_id}
                          >
                            {property.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="border-t my-2" />

                  <NavLink
                    href="/"
                    icon={<ChartPie />}
                    onClick={handleLinkClick}
                  >
                    Dashboard
                  </NavLink>

                  <NavLink
                    href="/historico"
                    icon={<History />}
                    onClick={handleLinkClick}
                  >
                    Histórico
                  </NavLink>

                  <NavLink
                    href="/configuracoes"
                    icon={<Bolt />}
                    onClick={handleLinkClick}
                  >
                    Configurações
                  </NavLink>

                  <NavLink
                    href="/tanques"
                    icon={<Waves />}
                    onClick={handleLinkClick}
                  >
                    Tanques
                  </NavLink>

                  {isOnline && (
                    <Protected permission="USUARIO_LISTAR">
                      <NavLink
                        href="/usuarios"
                        icon={<Users />}
                        onClick={handleLinkClick}
                      >
                        Usuários
                      </NavLink>
                    </Protected>
                  )}

                  {isOnline && (
                    <Protected permission="PERFIL_LISTAR">
                      <NavLink
                        href="/perfis"
                        icon={<Shield />}
                        onClick={handleLinkClick}
                      >
                        Perfis
                      </NavLink>
                    </Protected>
                  )}

                  {isOnline && (
                    <Protected permission="PROPRIEDADE_LISTAR">
                      <NavLink
                        href="/propriedades"
                        icon={<Building2 />}
                        onClick={handleLinkClick}
                      >
                        Propriedades
                      </NavLink>
                    </Protected>
                  )}
                </div>
                <div className="px-4 space-y-3 pt-4 shrink-0">
                  <AppButtonLogout />
                  <AppButton
                    variant="outline"
                    className="w-full"
                    size="lg"
                    tabIndex={-1}
                    disabled={syncPanel === "loading"}
                    onClick={handlePullData}
                  >
                    {syncPanel === "loading" ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <RefreshCcw />
                    )}
                    <span className="text-base">
                      {syncPanel === "loading"
                        ? "Sincronizando..."
                        : "Sincronizar Histórico"}
                    </span>
                  </AppButton>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </nav>
  );
};

export default NavBar;
