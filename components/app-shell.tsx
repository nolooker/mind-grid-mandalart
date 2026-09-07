"use client";
import { FormEvent, useState } from "react";
import { Grid3X3, LockKeyhole, Plus } from "lucide-react";
import { useMandalarts } from "../hooks/use-mandalarts";
import { calculateOverallProgress } from "../lib/mandalart";
import { FocusEditor } from "./focus-editor";
import { MandalartBoard } from "./mandalart-board";
import { ProgressRing } from "./progress-ring";
import { MandalartSidebar } from "./mandalart-sidebar";

const PASSCODE_STORAGE_KEY = "mind-grid-passcode";

function LockedShell({ onUnlock }: { onUnlock: (passcode: string) => void }) {
  const [passcode, setPasscode] = useState("");
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = passcode.trim();
    if (!next) return;
    localStorage.setItem(PASSCODE_STORAGE_KEY, next);
    onUnlock(next);
  };

  return <main className="lock-screen"><form className="lock-panel" onSubmit={submit}><span className="lock-mark"><LockKeyhole size={24} /></span><span className="eyebrow">PRIVATE MANDALART</span><h1>마인드그리드 잠금</h1><p>관리 비밀번호를 입력하면 나의 성장 계획을 열 수 있어요.</p><label>관리 비밀번호<input type="password" value={passcode} onChange={(event) => setPasscode(event.target.value)} autoComplete="current-password" /></label><button type="submit">열기</button></form></main>;
}

function WorkspaceShell({ passcode }: { passcode: string }) {
  const store = useMandalarts(passcode);
  const [selectedCoreId, setSelectedCoreId] = useState<string | null>(null);
  const [selectedDetailId, setSelectedDetailId] = useState<string | null>(null);
  const selectCore = (coreId: string | null) => {
    setSelectedCoreId(coreId);
    setSelectedDetailId(null);
  };
  const selected = store.state.mandalarts.find((item) => item.id === store.state.selectedMandalartId) ?? null;
  if (!selected) return <main className="empty-state"><Grid3X3 size={38} /><h1>첫 만다라트를 만들어보세요</h1><button type="button" onClick={() => store.create("나의 만다라트")}><Plus size={18} /> 새 만다라트</button></main>;
  return <div className="app-shell"><MandalartSidebar state={store.state} storageStatus={store.storageStatus} create={store.create} rename={store.rename} duplicate={store.duplicate} remove={store.remove} select={store.select} replaceAll={store.replaceAll} onResetSelection={() => selectCore(null)} /><main className="workspace"><header className="workspace-header"><div><span className="date-chip">나의 목표 지도</span><h1>{selected.title}</h1><p>큰 목표를 나누고, 오늘 할 수 있는 행동으로 바꿔보세요.</p></div><ProgressRing value={calculateOverallProgress(selected)} label="전체 달성" size="large" /></header><div className="workspace-grid"><FocusEditor mandalart={selected} selectedCoreId={selectedCoreId} selectedDetailId={selectedDetailId} onSelectCore={selectCore} onSelectDetail={setSelectedDetailId} onUpdateCenter={store.updateCenter} onUpdateCore={store.updateCore} onUpdateDetailCore={store.updateDetailCore} onUpdateDetailAction={store.updateDetailAction} onToggleDetailAction={store.toggleDetailAction} /><MandalartBoard mandalart={selected} selectedCoreId={selectedCoreId} selectedDetailId={selectedDetailId} onSelectCore={selectCore} onSelectDetail={setSelectedDetailId} /></div></main></div>;
}

export function AppShell() {
  const [passcode, setPasscode] = useState(() => (typeof window === "undefined" ? "" : localStorage.getItem(PASSCODE_STORAGE_KEY) ?? ""));
  return passcode ? <WorkspaceShell passcode={passcode} /> : <LockedShell onUnlock={setPasscode} />;
}
