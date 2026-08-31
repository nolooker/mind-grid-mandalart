import { Copy, Grid3X3, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { StorageStatus } from "../hooks/use-mandalarts";
import { calculateOverallProgress, type MandalartAppState } from "../lib/mandalart";
import { BackupControls } from "./backup-controls";

interface Props {
  state: MandalartAppState;
  storageStatus: StorageStatus;
  create: (title: string) => void;
  rename: (id: string, title: string) => void;
  duplicate: (id: string) => void;
  remove: (id: string) => void;
  select: (id: string) => void;
  replaceAll: (state: MandalartAppState) => void;
  onResetSelection: () => void;
}

export function MandalartSidebar({ state, storageStatus, create, rename, duplicate, remove, select, replaceAll, onResetSelection }: Props) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const selected = state.selectedMandalartId;
  const add = () => { const title = window.prompt("새 만다라트의 이름을 입력하세요", "새 만다라트"); if (title !== null) create(title); };
  const renameOne = (id: string, current: string) => { const title = window.prompt("새 이름을 입력하세요", current); if (title !== null) rename(id, title); setOpenMenu(null); };
  const removeOne = (id: string, title: string) => { if (window.confirm(`‘${title}’ 만다라트를 삭제할까요?`)) { remove(id); onResetSelection(); } setOpenMenu(null); };
  return <aside className="sidebar"><div className="brand"><span className="brand-mark"><Grid3X3 size={20} /></span><div><strong>마인드그리드</strong><small>나만의 목표 설계실</small></div></div><div className="side-label">MY MANDALARTS</div><nav className="mandalart-list" aria-label="내 만다라트">{state.mandalarts.map((item) => <div className={`mandalart-list-item ${item.id === selected ? "active" : ""}`} key={item.id}><button className="select-mandalart" type="button" onClick={() => { select(item.id); onResetSelection(); }} aria-label={`${item.title} 선택`}><span className="list-dot" /><span>{item.title}</span><small>{calculateOverallProgress(item)}%</small></button><button className="more-button" type="button" aria-label={`${item.title} 관리`} aria-haspopup="menu" aria-expanded={openMenu === item.id} onClick={() => setOpenMenu(openMenu === item.id ? null : item.id)}><MoreHorizontal size={16} /></button>{openMenu === item.id && <div className="item-menu" role="menu"><button role="menuitem" onClick={() => renameOne(item.id, item.title)}><Pencil size={14} /> 이름 변경</button><button role="menuitem" onClick={() => { duplicate(item.id); onResetSelection(); setOpenMenu(null); }}><Copy size={14} /> 복제</button><button role="menuitem" className="danger" onClick={() => removeOne(item.id, item.title)}><Trash2 size={14} /> 삭제</button></div>}</div>)}</nav><button className="new-button" type="button" onClick={add}><Plus size={17} /> 새 만다라트</button><BackupControls state={state} replaceAll={replaceAll} /><div className="sidebar-note"><span className={`status-dot ${storageStatus}`} />{storageStatus === "saved" ? "브라우저에 저장됨" : storageStatus === "saving" ? "저장 중…" : "저장할 수 없음"}</div></aside>;
}
