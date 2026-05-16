import { getPropertyById } from "@/services/property-service";

const TANKS_STORAGE_KEY = "tanks";
const STORAGED_TURBIDITY_KEY = "storagedTurbidityData";

export type PropertyDataSyncSummary = {
  tanksCount: number;
  readingsCount: number;
};

function safeJsonArrayLength(raw: string | null): number {
  if (!raw) return 0;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

/**
 * Valida a propriedade na API e devolve contagens dos dados armazenados
 * localmente (tanques e leituras). Quando existirem endpoints de descarga,
 * estes valores podem ser atualizados após merge com o servidor.
 */
export async function pullPropertyDataSummary(
  propertyId: string
): Promise<PropertyDataSyncSummary> {
  await getPropertyById(propertyId);

  if (typeof window === "undefined") {
    return { tanksCount: 0, readingsCount: 0 };
  }

  return {
    tanksCount: safeJsonArrayLength(localStorage.getItem(TANKS_STORAGE_KEY)),
    readingsCount: safeJsonArrayLength(
      localStorage.getItem(STORAGED_TURBIDITY_KEY)
    ),
  };
}
