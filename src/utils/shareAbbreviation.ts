const capitalize = (word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();

// "api-movement" -> "AMov": primera letra antes del guion + primeras 3 letras después.
export function shareAbbreviation(apiName: string): string {
  const [first, ...rest] = apiName.split("-");
  const second = rest.join("-");
  if (!second) return capitalize(first).slice(0, 4);
  return `${first.charAt(0).toUpperCase()}${capitalize(second.slice(0, 3))}`;
}
