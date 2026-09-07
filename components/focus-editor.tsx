import { ArrowLeft, Pencil } from "lucide-react";
import { useState } from "react";
import { calculateCoreProgress, calculateCoreTreeProgress, type Mandalart } from "../lib/mandalart";
import { ProgressRing } from "./progress-ring";

interface Props {
  mandalart: Mandalart;
  selectedCoreId: string | null;
  selectedDetailId: string | null;
  onSelectCore: (coreId: string | null) => void;
  onSelectDetail: (detailId: string | null) => void;
  onUpdateCenter: (text: string) => void;
  onUpdateCore: (coreId: string, text: string) => void;
  onUpdateDetailCore: (coreId: string, detailId: string, text: string) => void;
  onUpdateDetailAction: (coreId: string, detailId: string, actionId: string, text: string) => void;
  onToggleDetailAction: (coreId: string, detailId: string, actionId: string) => void;
}

export function FocusEditor({ mandalart, selectedCoreId, selectedDetailId, onSelectCore, onSelectDetail, onUpdateCenter, onUpdateCore, onUpdateDetailCore, onUpdateDetailAction, onToggleDetailAction }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const core = mandalart.coreGoals.find((item) => item.id === selectedCoreId) ?? null;
  const detail = core?.detailGoals.find((item) => item.id === selectedDetailId) ?? null;
  const saveCoreDraft = (coreId: string) => { onUpdateCore(coreId, draft); setEditingId(null); };
  const saveDetailDraft = (detailId: string) => { if (core) onUpdateDetailCore(core.id, detailId, draft); setEditingId(null); };

  if (!core) return <section className="editor-card" aria-labelledby="editor-title"><div className="section-heading"><div><span className="eyebrow">중심 설계</span><h2 id="editor-title">큰 목표</h2></div></div><label className="center-input-label">내가 이루고 싶은 가장 큰 목표<input value={mandalart.centerGoal} onChange={(event) => onUpdateCenter(event.target.value)} placeholder="예: 더 나은 나 만들기" /></label><div className="focus-grid center-focus">{mandalart.coreGoals.map((item, index) => <div className={`goal-card-row tone-${item.colorKey}`} key={item.id}>{editingId === item.id ? <input autoFocus aria-label={`핵심 목표 ${index + 1}`} value={draft} onChange={(event) => setDraft(event.target.value)} onBlur={() => saveCoreDraft(item.id)} onKeyDown={(event) => { if (event.key === "Enter") saveCoreDraft(item.id); if (event.key === "Escape") setEditingId(null); }} /> : <button className="goal-open-button" type="button" aria-label={`${item.title || "이름 없는 목표"} 상세 만다라트 열기`} onClick={() => { onSelectCore(item.id); onSelectDetail(null); }}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item.title || "핵심 목표"}</strong></button>}<button className={`goal-edit-button tone-${item.colorKey}`} type="button" aria-label={`${item.title || "이름 없는 목표"} 이름 수정`} onMouseDown={(event) => event.preventDefault()} onClick={() => { setDraft(item.title); setEditingId(item.id); }}><Pencil size={15} /></button></div>)}</div></section>;

  if (!detail) return <section className={`editor-card tone-border-${core.colorKey}`} aria-labelledby="editor-title"><button className="back-to-center" type="button" onClick={() => { onSelectCore(null); onSelectDetail(null); }}><ArrowLeft size={15} /> 전체 계획으로 돌아가기</button><div className="section-heading editor-heading"><div><span className="eyebrow">상세 만다라트</span><h2 id="editor-title">{core.title || "이름 없는 목표"}</h2></div><ProgressRing value={calculateCoreTreeProgress(core)} label="영역 달성" /></div><label className={`center-input-label tone-${core.colorKey}`}>상세판의 중심 목표<input value={core.title} onChange={(event) => onUpdateCore(core.id, event.target.value)} placeholder="핵심 목표를 입력하세요" /></label><div className="focus-grid center-focus">{core.detailGoals.map((item, index) => <div className={`goal-card-row tone-${item.colorKey}`} key={item.id}>{editingId === item.id ? <input autoFocus aria-label={`세부 방향 ${index + 1}`} value={draft} onChange={(event) => setDraft(event.target.value)} onBlur={() => saveDetailDraft(item.id)} onKeyDown={(event) => { if (event.key === "Enter") saveDetailDraft(item.id); if (event.key === "Escape") setEditingId(null); }} /> : <button className="goal-open-button" type="button" aria-label={`${item.title || "이름 없는 방향"} 행동 편집 열기`} onClick={() => onSelectDetail(item.id)}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item.title || "세부 방향"}</strong></button>}<button className={`goal-edit-button tone-${item.colorKey}`} type="button" aria-label={`${item.title || "이름 없는 방향"} 이름 수정`} onMouseDown={(event) => event.preventDefault()} onClick={() => { setDraft(item.title); setEditingId(item.id); }}><Pencil size={15} /></button></div>)}</div></section>;

  return <section className={`editor-card tone-border-${detail.colorKey}`} aria-labelledby="editor-title"><button className="back-to-center" type="button" onClick={() => onSelectDetail(null)}><ArrowLeft size={15} /> {core.title || "상세 만다라트"}로 돌아가기</button><div className="section-heading editor-heading"><div><span className="eyebrow">행동 편집</span><h2 id="editor-title">{detail.title || "이름 없는 방향"} 행동</h2></div><ProgressRing value={calculateCoreProgress(detail)} label="방향 달성" /></div><label className={`center-input-label tone-${detail.colorKey}`}>세부 방향<input value={detail.title} onChange={(event) => onUpdateDetailCore(core.id, detail.id, event.target.value)} placeholder="세부 방향을 입력하세요" /></label><div className="focus-grid">{detail.actions.map((action, index) => <div className={`action-row ${action.completed ? "completed" : ""}`} key={action.id}><input type="checkbox" checked={action.completed} disabled={!action.text.trim()} onChange={() => onToggleDetailAction(core.id, detail.id, action.id)} aria-label={`${action.text || `실행 항목 ${index + 1}`} 완료`} /><label><span>{String(index + 1).padStart(2, "0")}</span><input aria-label={`실행 항목 ${index + 1}`} value={action.text} onChange={(event) => onUpdateDetailAction(core.id, detail.id, action.id, event.target.value)} placeholder="구체적인 행동을 적어보세요" /></label></div>)}</div></section>;
}
