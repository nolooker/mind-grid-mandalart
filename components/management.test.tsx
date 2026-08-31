import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { createInitialState } from "../lib/mandalart";
import { MandalartSidebar } from "./mandalart-sidebar";

describe("mandalart management", () => {
  it("offers create, rename, duplicate, delete and backup actions with accessible labels", async () => {
    const state = createInitialState();
    const actions = { create: vi.fn(), rename: vi.fn(), duplicate: vi.fn(), remove: vi.fn(), select: vi.fn(), replaceAll: vi.fn() };
    render(<MandalartSidebar state={state} storageStatus="saved" {...actions} onResetSelection={vi.fn()} />);

    expect(screen.getByRole("button", { name: "새 만다라트" })).toBeVisible();
    expect(screen.getByRole("button", { name: "2026 나의 성장 계획 선택" })).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: "2026 나의 성장 계획 관리" }));
    expect(screen.getByRole("menuitem", { name: "이름 변경" })).toBeVisible();
    expect(screen.getByRole("menuitem", { name: "복제" })).toBeVisible();
    expect(screen.getByRole("menuitem", { name: "삭제" })).toBeVisible();
    expect(screen.getByRole("button", { name: "JSON 백업 내보내기" })).toBeVisible();
    expect(screen.getByLabelText("JSON 백업 가져오기")).toBeInTheDocument();
  });
});
