import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { createInitialState } from "../lib/mandalart";
import { FocusEditor } from "./focus-editor";
import { MandalartBoard } from "./mandalart-board";

describe("mandalart editing", () => {
  it("selects a core region from the overview", async () => {
    const mandalart = createInitialState().mandalarts[0];
    const onSelectCore = vi.fn();
    render(<MandalartBoard mandalart={mandalart} selectedCoreId={null} onSelectCore={onSelectCore} />);

    await userEvent.click(screen.getAllByRole("button", { name: "건강 영역 편집" })[0]);
    expect(onSelectCore).toHaveBeenCalledWith(mandalart.coreGoals[0].id);
    expect(screen.getByText("더 나은 나 만들기")).toBeVisible();
  });

  it("edits and completes an action in the focused region", async () => {
    const mandalart = createInitialState().mandalarts[0];
    const core = mandalart.coreGoals[0];
    const onUpdateAction = vi.fn();
    const onToggleAction = vi.fn();
    render(
      <FocusEditor
        mandalart={mandalart}
        selectedCoreId={core.id}
        onUpdateCenter={vi.fn()}
        onUpdateCore={vi.fn()}
        onUpdateAction={onUpdateAction}
        onToggleAction={onToggleAction}
      />,
    );

    expect(screen.getByRole("heading", { name: "건강 세부 계획" })).toBeVisible();
    const action = screen.getByLabelText("실행 항목 1");
    fireEvent.change(action, { target: { value: "아침 산책" } });
    expect(onUpdateAction).toHaveBeenLastCalledWith(core.id, core.actions[0].id, "아침 산책");
    await userEvent.click(screen.getByRole("checkbox", { name: "주 3회 30분 걷기 완료" }));
    expect(onToggleAction).toHaveBeenCalledWith(core.id, core.actions[0].id);
  });
});
