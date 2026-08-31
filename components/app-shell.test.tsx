import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createInitialState } from "../lib/mandalart";
import { AppShell } from "./app-shell";

describe("AppShell lock", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ state: createInitialState() }) }));
  });

  it("opens the mandalart workspace after a passcode is entered", async () => {
    render(<AppShell />);

    expect(screen.getByRole("heading", { name: "마인드그리드 잠금" })).toBeVisible();
    expect(screen.queryByRole("navigation", { name: "내 만다라트" })).not.toBeInTheDocument();

    await userEvent.type(screen.getByLabelText("관리 비밀번호"), "phone-pass");
    await userEvent.click(screen.getByRole("button", { name: "열기" }));

    await waitFor(() => expect(screen.getByRole("navigation", { name: "내 만다라트" })).toBeVisible());
    expect(screen.getByText("큰 목표를 나누고, 오늘 할 수 있는 행동으로 바꿔보세요.")).toBeVisible();
    expect(screen.queryByText("큰 목표를 8가지 방향으로 나누고, 오늘 할 수 있는 행동으로 바꿔보세요.")).not.toBeInTheDocument();
  });
});
