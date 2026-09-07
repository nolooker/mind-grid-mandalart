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
    render(<MandalartBoard mandalart={mandalart} selectedCoreId={null} selectedDetailId={null} onSelectCore={onSelectCore} onSelectDetail={vi.fn()} />);

    await userEvent.click(screen.getAllByRole("button", { name: "건강 상세 만다라트 열기" })[0]);
    expect(onSelectCore).toHaveBeenCalledWith(mandalart.coreGoals[0].id);
    expect(screen.getByText("더 나은 나 만들기")).toBeVisible();
  });

  it("shows a second-depth mandalart for a selected core goal", async () => {
    const mandalart = createInitialState().mandalarts[0];
    const core = mandalart.coreGoals[0];
    const onSelectDetail = vi.fn();
    render(<MandalartBoard mandalart={mandalart} selectedCoreId={core.id} selectedDetailId={null} onSelectCore={vi.fn()} onSelectDetail={onSelectDetail} />);

    expect(screen.getByRole("heading", { name: "건강 상세 만다라트" })).toBeVisible();
    await userEvent.click(screen.getAllByRole("button", { name: "건강 행동 편집" })[0]);
    expect(onSelectDetail).toHaveBeenCalledWith(core.detailGoals[0].id);
  });

  it("opens action editing from outer detail regions in a second-depth board", async () => {
    const mandalart = createInitialState().mandalarts[0];
    const core = mandalart.coreGoals[0];
    const onSelectDetail = vi.fn();
    render(<MandalartBoard mandalart={mandalart} selectedCoreId={core.id} selectedDetailId={null} onSelectCore={vi.fn()} onSelectDetail={onSelectDetail} />);

    expect(screen.queryByRole("button", { name: "건강 영역 편집" })).not.toBeInTheDocument();
    await userEvent.click(screen.getAllByRole("button", { name: "건강 행동 편집" })[1]);
    expect(onSelectDetail).toHaveBeenCalledWith(core.detailGoals[0].id);
  });

  it("edits and completes an action in the focused region", async () => {
    const mandalart = createInitialState().mandalarts[0];
    const core = mandalart.coreGoals[0];
    const onSelectCore = vi.fn();
    const onUpdateAction = vi.fn();
    const onToggleAction = vi.fn();
    render(
      <FocusEditor
        mandalart={mandalart}
        selectedCoreId={core.id}
        selectedDetailId={core.detailGoals[0].id}
        onSelectCore={onSelectCore}
        onSelectDetail={vi.fn()}
        onUpdateCenter={vi.fn()}
        onUpdateCore={vi.fn()}
        onUpdateDetailCore={vi.fn()}
        onUpdateDetailAction={(coreId, _detailId, actionId, text) => onUpdateAction(coreId, actionId, text)}
        onToggleDetailAction={(coreId, _detailId, actionId) => onToggleAction(coreId, actionId)}
      />,
    );

    expect(screen.getByRole("heading", { name: "건강 행동" })).toBeVisible();
    const action = screen.getByLabelText("실행 항목 1");
    fireEvent.change(action, { target: { value: "아침 산책" } });
    expect(onUpdateAction).toHaveBeenLastCalledWith(core.id, core.detailGoals[0].actions[0].id, "아침 산책");
    await userEvent.click(screen.getByRole("checkbox", { name: "주 3회 30분 걷기 완료" }));
    expect(onToggleAction).toHaveBeenCalledWith(core.id, core.detailGoals[0].actions[0].id);
  });

  it("opens a core goal from its card and edits only from the color button", async () => {
    const mandalart = createInitialState().mandalarts[0];
    const core = mandalart.coreGoals[0];
    const onSelectCore = vi.fn();
    const onUpdateCore = vi.fn();
    render(
      <FocusEditor mandalart={mandalart} selectedCoreId={null} selectedDetailId={null} onSelectCore={onSelectCore} onSelectDetail={vi.fn()} onUpdateCenter={vi.fn()} onUpdateCore={onUpdateCore} onUpdateDetailCore={vi.fn()} onUpdateDetailAction={vi.fn()} onToggleDetailAction={vi.fn()} />,
    );

    await userEvent.click(screen.getByRole("button", { name: "건강 상세 만다라트 열기" }));
    expect(onSelectCore).toHaveBeenCalledWith(core.id);
    onSelectCore.mockClear();
    await userEvent.click(screen.getByRole("button", { name: "건강 이름 수정" }));
    expect(onSelectCore).not.toHaveBeenCalled();
    const input = screen.getByRole("textbox", { name: "핵심 목표 1" });
    fireEvent.change(input, { target: { value: "튼튼한 몸" } });
    await userEvent.keyboard("{Enter}");
    expect(onUpdateCore).toHaveBeenCalledWith(core.id, "튼튼한 몸");
  });

  it("labels the center editor as the big goal only", () => {
    const mandalart = createInitialState().mandalarts[0];
    render(
      <FocusEditor mandalart={mandalart} selectedCoreId={null} selectedDetailId={null} onSelectCore={vi.fn()} onSelectDetail={vi.fn()} onUpdateCenter={vi.fn()} onUpdateCore={vi.fn()} onUpdateDetailCore={vi.fn()} onUpdateDetailAction={vi.fn()} onToggleDetailAction={vi.fn()} />,
    );

    expect(screen.getByRole("heading", { name: "큰 목표" })).toBeVisible();
    expect(screen.queryByRole("heading", { name: "큰 목표와 8가지 방향" })).not.toBeInTheDocument();
  });
});
