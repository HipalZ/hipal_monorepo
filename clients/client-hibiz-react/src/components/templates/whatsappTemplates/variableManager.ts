export interface ChatSession {
  userId: string;
  currentNodeId: string | null;
  variables: Record<string, any>;
}

export function interpolate(str = "", vars: Record<string, any> = {}) {
  return str.replace(/\{\{(@?\w+)\}\}/g, (_, k) => vars[k] ?? "");
}

export function findMissingVariables(
  template: string,
  vars: Record<string, any>,
): string[] {
  const matches = [...template.matchAll(/\{\{(.*?)\}\}/g)].map((m) =>
    m[1].trim(),
  );
  return matches.filter((k) => !(k in vars));
}

export async function storeUserReply(
  session: ChatSession,
  node: any,
  reply: string,
) {
  const storeKey = node?.meta?.storeVar;
  if (storeKey?.startsWith("@")) {
    session.variables[storeKey] = reply;
  }
  return session;
}
