import { describe, expect, it } from "vitest";
import { createInitialState } from "./mandalart";
import { loadServerState, saveServerState, type ServerStateDatabase } from "./server-state";

function createMemoryDb(): ServerStateDatabase {
  const rows = new Map<string, string>();
  return {
    prepare(sql) {
      return {
        bind(...values) {
          return {
            async first() {
              if (sql.startsWith("SELECT state_json")) {
                const stateJson = rows.get(String(values[0]));
                return stateJson ? { stateJson } : null;
              }
              return null;
            },
            async run() {
              if (sql.startsWith("INSERT INTO mandalart_state")) {
                rows.set(String(values[0]), String(values[1]));
              }
              return { success: true };
            },
          };
        },
        async run() {
          return { success: true };
        },
      };
    },
    async batch(statements) {
      await Promise.all(statements.map((statement) => statement.run()));
      return [];
    },
  };
}

describe("server mandalart state", () => {
  it("creates the default state when D1 has no saved mandalart data", async () => {
    const state = await loadServerState(createMemoryDb());

    expect(state.mandalarts).toHaveLength(1);
    expect(state.mandalarts[0].title).toBe("나의 성장 계획");
  });

  it("saves and restores mandalart state from D1", async () => {
    const db = createMemoryDb();
    const state = createInitialState();
    state.mandalarts[0].title = "서버에 저장된 계획";

    await saveServerState(db, state);

    await expect(loadServerState(db)).resolves.toMatchObject({
      mandalarts: [expect.objectContaining({ title: "서버에 저장된 계획" })],
    });
  });
});
