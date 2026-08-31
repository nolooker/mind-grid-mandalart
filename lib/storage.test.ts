import { describe, expect, it } from "vitest";
import { createInitialState } from "./mandalart";
import { parseStoredState, serializeState } from "./storage";

describe("mandalart storage", () => {
  it("round-trips a valid state", () => {
    const state = createInitialState();
    expect(parseStoredState(serializeState(state))).toEqual(state);
  });

  it("rejects malformed or unsupported data", () => {
    expect(parseStoredState("not-json")).toBeNull();
    expect(parseStoredState(JSON.stringify({ schemaVersion: 99 }))).toBeNull();
    expect(parseStoredState(JSON.stringify({ schemaVersion: 1, selectedMandalartId: null, mandalarts: [{}] }))).toBeNull();
  });

  it("removes the year from the old default title without changing custom titles", () => {
    const state = createInitialState();
    state.mandalarts[0].title = "2026 나의 성장 계획";
    const restored = parseStoredState(serializeState(state));
    expect(restored?.mandalarts[0].title).toBe("나의 성장 계획");
  });
});
