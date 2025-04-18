export const replacePlaceholders = (
  prompt: string,
  placeholders: Record<string, string>
): string => {
  return Object.entries(placeholders).reduce(
    (acc, [key, value]) => acc.replace(`%%%${key}%%%`, value),
    prompt
  );
};
