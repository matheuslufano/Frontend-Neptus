import { useCallback, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { AddTankSchema } from "@/schemas/addTank-schema";

export interface Tank {
  id: string;
  name: string;
  type: string;
  fish: string;
  fishCount: number;
  averageWeight: number;
  tankArea: number;
  createdAt: string;
}

// Tipo para tanques antigos (sem os novos campos)
interface LegacyTank {
  id: string;
  name: string;
  type: string;
  fish: string;
  createdAt: string;
  fishCount?: number;
  averageWeight?: number;
  tankArea?: number;
}

const TANKS_STORAGE_KEY = "tanks";

export const useTanks = () => {
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar tanques do localStorage
  useEffect(() => {
    try {
      const storedTanks = localStorage.getItem(TANKS_STORAGE_KEY);
      if (storedTanks) {
        const parsedTanks = JSON.parse(storedTanks);

        // Migração: adicionar campos faltantes aos tanques existentes
        const migratedTanks: Tank[] = parsedTanks.map((tank: LegacyTank) => ({
          ...tank,
          fishCount: tank.fishCount ?? 100,
          averageWeight: tank.averageWeight ?? 1.0,
          tankArea: tank.tankArea ?? 30.0,
        }));

        setTanks(migratedTanks);

        // Salvar os tanques migrados de volta
        localStorage.setItem(TANKS_STORAGE_KEY, JSON.stringify(migratedTanks));
      } else {
        // Se não houver tanques salvos, iniciar com array vazio
        setTanks([]);
      }
    } catch (error) {
      console.error("Erro ao carregar tanques:", error);
      setTanks([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Salvar tanques no localStorage
  const saveTanks = useCallback((newTanks: Tank[]) => {
    try {
      localStorage.setItem(TANKS_STORAGE_KEY, JSON.stringify(newTanks));
      setTanks(newTanks);
    } catch (error) {
      console.error("Erro ao salvar tanques:", error);
    }
  }, []);

  // Adicionar tanque
  const addTank = useCallback(
    (tankData: AddTankSchema) => {
      const newTank: Tank = {
        id: uuidv4(),
        name: tankData.name,
        type: tankData.type,
        fish: tankData.fish,
        fishCount: tankData.fishCount,
        averageWeight: tankData.averageWeight,
        tankArea: tankData.tankArea,
        createdAt: new Date().toISOString(),
      };

      const updatedTanks = [...tanks, newTank];
      saveTanks(updatedTanks);
      return newTank;
    },
    [tanks, saveTanks]
  );

  // Atualizar tanque
  const updateTank = useCallback(
    (id: string, tankData: AddTankSchema) => {
      const updatedTanks = tanks.map((tank) =>
        tank.id === id ? { ...tank, ...tankData } : tank
      );
      saveTanks(updatedTanks);
    },
    [tanks, saveTanks]
  );

  // Deletar tanque
  const deleteTank = useCallback(
    (id: string) => {
      const updatedTanks = tanks.filter((tank) => tank.id !== id);
      saveTanks(updatedTanks);
    },
    [tanks, saveTanks]
  );

  // Buscar tanque por ID
  const getTankById = useCallback(
    (id: string) => {
      return tanks.find((tank) => tank.id === id);
    },
    [tanks]
  );

  return {
    tanks,
    isLoading,
    addTank,
    updateTank,
    deleteTank,
    getTankById,
  };
};
