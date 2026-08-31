import { describe, expect, it } from "vitest";
import {
  calculateCoreProgress,
  calculateOverallProgress,
  createMandalart,
  normalizeActionText,
  createInitialState,
  type CoreGoal,
} from "./mandalart";

function coreWith(...actions: Array<[string, boolean]>): CoreGoal {
  return {
    id: "core",
    title: "건강",
    colorKey: "coral",
    actions: Array.from({ length: 8 }, (_, index) => ({
      id: `action-${index}`,
      text: actions[index]?.[0] ?? "",
      completed: actions[index]?.[1] ?? false,
    })),
  };
}

describe("mandalart domain", () => {
  it("uses a timeless default plan title", () => {
    expect(createInitialState().mandalarts[0].title).toBe("나의 성장 계획");
  });
  it("creates the complete 8 by 8 goal structure", () => {
    const mandalart = createMandalart("건강");

    expect(mandalart.title).toBe("건강");
    expect(mandalart.coreGoals).toHaveLength(8);
    expect(mandalart.coreGoals.every((goal) => goal.actions.length === 8)).toBe(true);
    expect(new Set(mandalart.coreGoals.flatMap((goal) => [goal.id, ...goal.actions.map((action) => action.id)])).size).toBe(72);
  });

  it("calculates progress from written actions only", () => {
    expect(calculateCoreProgress(coreWith(["걷기", true]))).toBe(100);
    expect(calculateCoreProgress(coreWith(["걷기", true], ["물 마시기", false]))).toBe(50);
    expect(calculateCoreProgress(coreWith())).toBe(0);
  });

  it("calculates overall progress across every core goal", () => {
    const mandalart = createMandalart("건강");
    mandalart.coreGoals[0] = coreWith(["걷기", true], ["물 마시기", false]);
    mandalart.coreGoals[1] = { ...coreWith(["독서", true]), id: "core-2" };

    expect(calculateOverallProgress(mandalart)).toBe(67);
  });

  it("clears completion when completed action text becomes blank", () => {
    expect(
      normalizeActionText({ id: "a", text: "걷기", completed: true }, "   "),
    ).toEqual({ id: "a", text: "", completed: false });
  });
});
