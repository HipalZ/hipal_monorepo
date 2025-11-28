export function interpolate(
  str: string | undefined,
  vars: Record<string, any>,
  cfg?: any,
  userName?: string,
): string {
  if (!str) return "";

  const context = {
    ...(vars || {}),
    name: userName || "",
    phone: cfg?.waProfile?.phone || cfg?.phone || "",
  };

  let result = str;

  // {{var}}
  result = result.replace(
    /\{\{(\w+)(?:\s*\|\|\s*([^}]+))?\}\}/g,
    (_, k, f) => context[k] ?? f?.trim() ?? "",
  );

  // @variable
  result = result.replace(
    /@([\w\s\-_]+)(?=\s|$|[.,!?;:)}\\""]|$)/g,
    (match, keyPart) => {
      const key = keyPart.trim();
      const varKey = key.startsWith("@") ? key : `@${key}`;

      const val = context[varKey];
      return val !== undefined && val !== null && val !== ""
        ? String(val)
        : match;
    },
  );

  return result;
}
