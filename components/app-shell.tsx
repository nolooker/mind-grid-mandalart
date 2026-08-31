"use client";
import { useState } from "react";
import { Grid3X3, Plus } from "lucide-react";
import { useMandalarts } from "../hooks/use-mandalarts";
import { calculateOverallProgress } from "../lib/mandalart";
import { FocusEditor } from "./focus-editor";
import { MandalartBoard } from "./mandalart-board";
import { ProgressRing } from "./progress-ring";
export function AppShell() {
  const store = useMandalarts();
  const [selectedCoreId, setSelectedCoreId] = useState<string | null>(null);
  const selected = store.state.mandalarts.find((item) => item.id === store.state.selectedMandalartId) ?? null;
  if (!selected) return <main className="empty-state"><Grid3X3 size={38} /><h1>첫 만다라트를 만들어보세요</h1><button type="button" onClick={() => store.create("나의 만다라트")}><Plus size={18} /> 새 만다라트</button></main>;
  return <div className="app-shell"><aside className="sidebar"><div className="brand"><span className="brand-mark"><Grid3X3 size={20} /></span><div><strong>마인드그리드</strong><small>나만의 목표 설계실</small></div></div><div className="side-label">MY MANDALARTS</div><nav className="mandalart-list" aria-label="내 만다라트">{store.state.mandalarts.map((item) => <button type="button" className={item.id === selected.id ? "active" : ""} key={item.id} onClick={() => { store.select(item.id); setSelectedCoreId(null); }}><span className="list-dot" /><span>{item.title}</span><small>{calculateOverallProgress(item)}%</small></button>)}</nav><button className="new-button" type="button" onClick={() => store.create("새 만다라트")}><Plus size={17} /> 새 만다라트</button><div className="sidebar-note"><span className={`status-dot ${store.storageStatus}`} />{store.storageStatus === "saved" ? "브라우저에 저장됨" : store.storageStatus === "saving" ? "저장 중…" : "저장할 수 없음"}</div></aside><main className="workspace"><header className="workspace-header"><div><span className="date-chip">나의 목표 지도</span><h1>{selected.title}</h1><p>큰 목표를 8가지 방향으로 나누고, 오늘 할 수 있는 행동으로 바꿔보세요.</p></div><ProgressRing value={calculateOverallProgress(selected)} label="전체 달성" size="large" /></header><div className="workspace-grid"><MandalartBoard mandalart={selected} selectedCoreId={selectedCoreId} onSelectCore={setSelectedCoreId} /><FocusEditor mandalart={selected} selectedCoreId={selectedCoreId} onUpdateCenter={store.updateCenter} onUpdateCore={store.updateCore} onUpdateAction={store.updateAction} onToggleAction={store.toggleAction} /></div></main></div>;
}
