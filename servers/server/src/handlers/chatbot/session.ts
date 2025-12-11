import type { SessionState } from "./types";

const sessions = new Map<string, SessionState>();

export function getSession(userId: string): SessionState {
  if (!sessions.has(userId)) {
    sessions.set(userId, {
      _id: undefined,
      userId,
      currentNodeId: null,
      waitingFor: null,
      variables: {},
    });
  }
  return sessions.get(userId)!;
}

export function setSession(userId: string, patch: Partial<SessionState>) {
  const s = getSession(userId);
  sessions.set(userId, { ...s, ...patch });
}
