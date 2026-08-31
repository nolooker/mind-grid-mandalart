import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createInitialState } from "../lib/mandalart";
import { STORAGE_KEY, serializeState } from "../lib/storage";
import { useMandalarts } from "./use-mandalarts";

describe("useMandalarts", () => {
  beforeEach(() => localStorage.clear());

  it("restores a valid saved state", () => {
    const saved = createInitialState();
    saved.mandalarts[0].title = "저장된 계획";
    localStorage.setItem(STORAGE_KEY, serializeState(saved));

    const { result } = renderHook(() => useMandalarts());
    expect(result.current.state.mandalarts[0].title).toBe("저장된 계획");
  });

  it("updates immediately and clears completion when action text becomes blank", () => {
    const { result } = renderHook(() => useMandalarts());
    const mandalart = result.current.state.mandalarts[0];
    const core = mandalart.coreGoals[0];
    const action = core.actions[0];

    act(() => result.current.toggleAction(core.id, action.id));
    act(() => result.current.updateAction(core.id, action.id, ""));

    expect(result.current.state.mandalarts[0].coreGoals[0].actions[0].completed).toBe(false);
  });

  it("persists once after the debounce", () => {
    vi.useFakeTimers();
    const spy = vi.spyOn(Storage.prototype, "setItem");
    const { result } = renderHook(() => useMandalarts());

    act(() => result.current.rename(result.current.state.mandalarts[0].id, "새 이름"));
    expect(spy).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(250));
    expect(spy).toHaveBeenCalledTimes(1);

    spy.mockRestore();
    vi.useRealTimers();
  });
});
