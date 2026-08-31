import { describe, expect, it } from "vitest";
import { createInitialState } from "./mandalart";
import { buildBackup, readBackup } from "./backup";

describe("backup", () => {
  it("exports and restores every mandalart", async () => {
    const state = createInitialState();
    const restored = await readBackup(new File([await buildBackup(state).text()], "backup.json", { type: "application/json" }));
    expect(restored).toEqual(state);
  });

  it("rejects invalid data", async () => {
    await expect(readBackup(new File(["{}"], "bad.json"))).rejects.toThrow("백업 파일 형식을 확인해 주세요");
  });
});
