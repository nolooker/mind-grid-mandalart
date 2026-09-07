import { COLOR_KEYS, SCHEMA_VERSION, type ActionItem, type CoreGoal, type DetailGoal, type Mandalart, type MandalartAppState } from "./mandalart";

export const STORAGE_KEY = "personal-mandalart:v1";

const isString = (value: unknown): value is string => typeof value === "string";
const createAction = (): ActionItem => ({ id: crypto.randomUUID(), text: "", completed: false });
const createDetailGoal = (colorKey: (typeof COLOR_KEYS)[number], title = "", actions?: ActionItem[]): DetailGoal => ({
  id: crypto.randomUUID(),
  title,
  colorKey,
  actions: actions?.length === 8 ? actions : Array.from({ length: 8 }, createAction),
});

function isAction(actionCandidate: unknown): actionCandidate is ActionItem {
  if (!actionCandidate || typeof actionCandidate !== "object") return false;
  const action = actionCandidate as Record<string, unknown>;
  return isString(action.id) && isString(action.text) && typeof action.completed === "boolean";
}

function isDetailGoal(detailCandidate: unknown): detailCandidate is DetailGoal {
  if (!detailCandidate || typeof detailCandidate !== "object") return false;
  const detail = detailCandidate as Record<string, unknown>;
  return isString(detail.id) && isString(detail.title) && COLOR_KEYS.includes(detail.colorKey as never) && Array.isArray(detail.actions) && detail.actions.length === 8 && detail.actions.every(isAction);
}

function normalizeCoreGoal(core: CoreGoal): CoreGoal {
  const existingDetails = Array.isArray(core.detailGoals) && core.detailGoals.length === 8 && core.detailGoals.every(isDetailGoal)
    ? core.detailGoals
    : COLOR_KEYS.map((colorKey, index) => createDetailGoal(colorKey, index === 0 ? core.title : "", index === 0 ? core.actions : undefined));
  return { ...core, detailGoals: existingDetails };
}

function normalizeMandalart(mandalart: Mandalart): Mandalart {
  return {
    ...mandalart,
    title: mandalart.title === "2026 나의 성장 계획" ? "나의 성장 계획" : mandalart.title,
    coreGoals: mandalart.coreGoals.map(normalizeCoreGoal),
  };
}

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
        if (!Array.isArray(core.actions) || core.actions.length !== 8 || !core.actions.every(isAction)) return false;
        return core.detailGoals === undefined || (Array.isArray(core.detailGoals) && core.detailGoals.length === 8 && core.detailGoals.every(isDetailGoal));
      });
    });
    if (!valid) return null;
    const restored = value as MandalartAppState;
    return {
      ...restored,
      mandalarts: restored.mandalarts.map(normalizeMandalart),
    };
  } catch {
    return null;
  }
}

export function serializeState(state: MandalartAppState): string {
  return JSON.stringify(state);
}
