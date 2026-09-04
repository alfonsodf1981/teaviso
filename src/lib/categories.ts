export const CATEGORIES = [
  { id: "electronics", label: "Electrónica", emoji: "📱" },
  { id: "home", label: "Hogar", emoji: "🏠" },
  { id: "fashion", label: "Moda", emoji: "👟" },
  { id: "groceries", label: "Súper", emoji: "🛒" },
  { id: "gaming", label: "Gaming", emoji: "🎮" },
  { id: "beauty", label: "Belleza", emoji: "✨" },
  { id: "sports", label: "Deportes", emoji: "⚽" },
  { id: "other", label: "Otro", emoji: "📦" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export function categoryLabel(id: string) {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function categoryEmoji(id: string) {
  return CATEGORIES.find((c) => c.id === id)?.emoji ?? "📦";
}
