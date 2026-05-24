export function getCultureLabel(period?: string, author?: string) {
  const source = `${period ?? ""} ${author ?? ""}`.toLowerCase();
  if (source.includes("moche") || source.includes("sipan")) {
    return "Cultura Moche";
  }
  if (source.includes("lambayeque")) {
    return "Cultura Lambayeque";
  }
  return author || "Cultura por confirmar";
}
