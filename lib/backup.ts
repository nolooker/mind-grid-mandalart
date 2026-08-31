import type { MandalartAppState } from "./mandalart";
import { parseStoredState, serializeState } from "./storage";

export function buildBackup(state: MandalartAppState): Blob {
  return new Blob([JSON.stringify(JSON.parse(serializeState(state)), null, 2)], { type: "application/json;charset=utf-8" });
}

export async function readBackup(file: File): Promise<MandalartAppState> {
  const raw = await file.text();
  const state = parseStoredState(raw);
  if (!state) throw new Error("백업 파일 형식을 확인해 주세요");
  return state;
}
