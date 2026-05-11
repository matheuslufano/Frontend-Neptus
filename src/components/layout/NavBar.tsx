"use client";

import {
  Bolt,
  Building2,
  ChartPie,
  History,
  MenuIcon,
  RefreshCcw,
  Shield,
  Users,
  Waves,
} from "lucide-react";
import { useEffect, useState } from "react";

import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { usePermissions } from "@/hooks/usePermissions";
import { useUserById } from "@/hooks/useUsers";
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

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { selectedPropertyId, setSelectedPropertyId } = usePropertyStore();
  const permissions = usePermissions();
  const isOnline = useOnlineStatus();

  // Obter ID do usuário do token JWT
  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getUserIdFromToken();
      setUserId(id);
    };

    fetchUserId();
  }, []);

  // Buscar dados do usuário logado
  const { data: user, isLoading } = useUserById(userId || "", !!userId);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <nav>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="hover:cursor-pointer">
          <MenuIcon className="h-6 w-6" />
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-[250px] gap-0"
          aria-describedby="menu"
        >
          <SheetHeader>
            <SheetTitle className="py-4 text-xl">Menu</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col justify-between h-full pb-10">
            <div className="flex flex-col gap-2">
              {/* Property Selector */}
              <div className="px-4 py-2">
                <label className="text-xs text-muted-foreground mb-2 block">
                  Propriedade
                </label>
                <Select
                  value={selectedPropertyId || ""}
                  onValueChange={setSelectedPropertyId}
                  disabled={isLoading || !user}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione uma propriedade" />
                  </SelectTrigger>
                  <SelectContent>
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

              <NavLink href="/" icon={<ChartPie />} onClick={handleLinkClick}>
                Dashboard
              </NavLink>

              {/* Histórico - Sempre visível (funciona offline) */}
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

              {/* Tanques - Sempre visível (funciona offline) */}
              <NavLink
                href="/tanques"
                icon={<Waves />}
                onClick={handleLinkClick}
              >
                Tanques
              </NavLink>

              {/* Usuários - Requer permissão + internet */}
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

              {/* Perfis - Requer permissão + internet */}
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

              {/* Propriedades - Requer permissão + internet */}
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
            <div className="px-4 space-y-3">
              <AppButtonLogout />
              <AppButton
                variant="outline"
                className="w-full"
                size="lg"
                tabIndex={-1}
              >
                <RefreshCcw />
                <span className="text-base">Sincronizar</span>
              </AppButton>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
};

export default NavBar;
