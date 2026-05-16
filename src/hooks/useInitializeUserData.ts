"use client";

import { useEffect, useState } from "react";

import { useAppStore } from "@/stores/propertyStore";
import { getUserIdFromToken } from "@/utils/jwt-util";

import { useProfileById } from "./useProfiles";
import { useUserById } from "./useUsers";

/**
 * Hook para inicializar os dados do usuário e permissões
 * Deve ser usado no nível mais alto da aplicação (layout ou provider)
 */
export const useInitializeUserData = () => {
  const { setUserData, clearUserData } = useAppStore();
  const [userId, setUserId] = useState<string | null>(null);
  const [userIdResolved, setUserIdResolved] = useState(false);

  // Obter ID do usuário do token JWT
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const id = await getUserIdFromToken();
        setUserId(id);
      } finally {
        setUserIdResolved(true);
      }
    };

    fetchUserId();
  }, []);

  // Buscar dados do usuário
  const { data: user, isLoading: isLoadingUser } = useUserById(
    userId || "",
    !!userId
  );

  // Buscar perfil do usuário para obter permissões
  const { data: profile, isLoading: isLoadingProfile } = useProfileById(
    user?.perfil_id || "",
    !!user?.perfil_id
  );

  useEffect(() => {
    if (!userIdResolved) {
      return;
    }

    if (!userId) {
      clearUserData();
      return;
    }

    if (user && profile) {
      setUserData({
        id: user.id,
        nome: user.nome,
        email: user.email,
        perfil_id: user.perfil_id,
        perfil_nome: user.perfil_nome,
        permissoes: profile.permissoes,
      });
    }
  }, [user, profile, userId, userIdResolved, setUserData, clearUserData]);

  return {
    isLoading:
      !userIdResolved || (Boolean(userId) && (isLoadingUser || isLoadingProfile)),
    user,
    profile,
  };
};
