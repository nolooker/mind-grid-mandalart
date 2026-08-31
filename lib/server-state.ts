import { createInitialState, type MandalartAppState } from "./mandalart";
import { parseStoredState, serializeState } from "./storage";

const PERSONAL_WORKSPACE_ID = "personal";

interface PreparedStatement {
  bind(...values: unknown[]): {
    first<T = unknown>(): Promise<T | null>;
    run(): Promise<unknown>;
  };
  run(): Promise<unknown>;
}

export interface ServerStateDatabase {
  prepare(sql: string): PreparedStatement;
  batch(statements: PreparedStatement[]): Promise<unknown[]>;
}

async function ensureSchema(db: ServerStateDatabase) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS mandalart_state (
      id TEXT PRIMARY KEY,
      state_json TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
  ]);
}

export async function loadServerState(db: ServerStateDatabase): Promise<MandalartAppState> {
  await ensureSchema(db);
  const row = await db
    .prepare("SELECT state_json AS stateJson FROM mandalart_state WHERE id = ?")
    .bind(PERSONAL_WORKSPACE_ID)
    .first<{ stateJson: string }>();

  const saved = parseStoredState(row?.stateJson ?? null);
  if (saved) return saved;

  const initial = createInitialState();
  await saveServerState(db, initial);
  return initial;
}

export async function saveServerState(db: ServerStateDatabase, state: MandalartAppState): Promise<void> {
  await ensureSchema(db);
  await db
    .prepare(`INSERT INTO mandalart_state (id, state_json, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        state_json = excluded.state_json,
        updated_at = CURRENT_TIMESTAMP`)
    .bind(PERSONAL_WORKSPACE_ID, serializeState(state))
    .run();
}
