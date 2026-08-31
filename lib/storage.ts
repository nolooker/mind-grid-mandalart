import { COLOR_KEYS, SCHEMA_VERSION, type MandalartAppState } from "./mandalart";

export const STORAGE_KEY = "personal-mandalart:v1";

const isString = (value: unknown): value is string => typeof value === "string";

export function parseStoredState(raw: string | null): MandalartAppState | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return null;
    const state = value as Record<string, unknown>;
    if (state.schemaVersion !== SCHEMA_VERSION || !Array.isArray(state.mandalarts)) return null;
    if (state.selectedMandalartId !== null && !isString(state.selectedMandalartId)) return null;

    const valid = state.mandalarts.every((candidate) => {
      if (!candidate || typeof candidate !== "object") return false;
      const mandalart = candidate as Record<string, unknown>;
      if (![mandalart.id, mandalart.title, mandalart.centerGoal, mandalart.createdAt, mandalart.updatedAt].every(isString)) return false;
      if (!Array.isArray(mandalart.coreGoals) || mandalart.coreGoals.length !== 8) return false;
      return mandalart.coreGoals.every((coreCandidate) => {
        if (!coreCandidate || typeof coreCandidate !== "object") return false;
        const core = coreCandidate as Record<string, unknown>;
        if (!isString(core.id) || !isString(core.title) || !COLOR_KEYS.includes(core.colorKey as never)) return false;
        if (!Array.isArray(core.actions) || core.actions.length !== 8) return false;
        return core.actions.every((actionCandidate) => {
          if (!actionCandidate || typeof actionCandidate !== "object") return false;
          const action = actionCandidate as Record<string, unknown>;
          return isString(action.id) && isString(action.text) && typeof action.completed === "boolean";
        });
      });
    });
    return valid ? (value as MandalartAppState) : null;
  } catch {
    return null;
  }
}

export function serializeState(state: MandalartAppState): string {
  return JSON.stringify(state);
}
