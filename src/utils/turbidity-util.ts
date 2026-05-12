export type TurbidityLevel = "low" | "medium" | "high";

/** NTU: ≤5 low, ≤25 medium, acima high (regra única do produto). */
export function getTurbidityLevel(turbidity: number): TurbidityLevel {
  if (turbidity <= 5) return "low";
  if (turbidity <= 25) return "medium";
  return "high";
}

export type TurbidityQualityLabel = "Ótima" | "Boa" | "Ruim";

export function getTurbidityStatusText(turbidity: number): TurbidityQualityLabel {
  const level = getTurbidityLevel(turbidity);
  switch (level) {
    case "low":
      return "Ótima";
    case "medium":
      return "Boa";
    case "high":
      return "Ruim";
    default:
      return "Ruim";
  }
}

export function getTurbidityColorClass(turbidity: number): string {
  const level = getTurbidityLevel(turbidity);
  switch (level) {
    case "low":
      return "text-green-600";
    case "medium":
      return "text-yellow-600";
    case "high":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
}

/**
 * Converte rótulo de qualidade (novo ou legado) para classe CSS de ênfase no header.
 */
export function getQualityLabelToneClass(quality: string): string {
  switch (quality) {
    case "Ótima":
    case "Bom":
      return "text-green-600";
    case "Boa":
    case "Regular":
    case "Médio":
      return "text-yellow-600";
    case "Ruim":
      return "text-red-600";
    default:
      return "text-muted-foreground";
  }
}

/** Classes do PDF: good / regular / bad */
export function qualityToPdfTone(quality: string): "good" | "regular" | "bad" {
  if (quality === "Ótima" || quality === "Bom") return "good";
  if (quality === "Boa" || quality === "Regular" || quality === "Médio")
    return "regular";
  return "bad";
}

export function getQualityColor(turbidityQtd: number) {
  return {
    color: getTurbidityColorClass(turbidityQtd),
    text: getTurbidityStatusText(turbidityQtd),
  };
}
