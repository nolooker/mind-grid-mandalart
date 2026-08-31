import { env } from "cloudflare:workers";
import { authorizePasscode } from "../../../lib/app-lock";
import { loadServerState, saveServerState } from "../../../lib/server-state";
import { parseStoredState } from "../../../lib/storage";

function getDatabase() {
  if (!env.DB) {
    throw new Error("D1 database is not available");
  }
  return env.DB;
}

export async function GET(request: Request) {
  try {
    if (!authorizePasscode(request, env.MANDALART_PASSCODE)) {
      return Response.json({ error: "관리 비밀번호를 확인해 주세요" }, { status: 401 });
    }
    const state = await loadServerState(getDatabase());
    return Response.json({ state });
  } catch {
    return Response.json({ error: "만다라트를 불러오지 못했어요" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!authorizePasscode(request, env.MANDALART_PASSCODE)) {
      return Response.json({ error: "관리 비밀번호를 확인해 주세요" }, { status: 401 });
    }
    const payload = (await request.json()) as { state?: unknown };
    const state = parseStoredState(JSON.stringify(payload.state));
    if (!state) {
      return Response.json({ error: "저장할 만다라트 형식을 확인해 주세요" }, { status: 400 });
    }

    await saveServerState(getDatabase(), state);
    return Response.json({ state });
  } catch {
    return Response.json({ error: "만다라트를 저장하지 못했어요" }, { status: 500 });
  }
}
