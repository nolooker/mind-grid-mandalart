import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createInitialState } from "../lib/mandalart";
import { useMandalarts } from "./use-mandalarts";

describe("useMandalarts", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("restores state from the server database", async () => {
    const saved = createInitialState();
    saved.mandalarts[0].title = "서버 저장 계획";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ state: saved }) }));

    const { result } = renderHook(() => useMandalarts());

    await waitFor(() => expect(result.current.state.mandalarts[0].title).toBe("서버 저장 계획"));
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

  it("persists once after the debounce", async () => {
    vi.useFakeTimers();
    const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ state: createInitialState() }) });
    vi.stubGlobal("fetch", fetch);
    const { result } = renderHook(() => useMandalarts());

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(result.current.storageStatus).toBe("saved");
    fetch.mockClear();

    act(() => result.current.rename(result.current.state.mandalarts[0].id, "새 이름"));
    expect(fetch).not.toHaveBeenCalledWith("/api/mandalarts", expect.objectContaining({ method: "PUT" }));
    act(() => vi.advanceTimersByTime(250));
    expect(fetch).toHaveBeenCalledWith("/api/mandalarts", expect.objectContaining({ method: "PUT" }));

    vi.useRealTimers();
  });
});
