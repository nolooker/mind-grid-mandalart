import { Check } from "lucide-react";
import type { CoreGoal, DetailGoal, Mandalart } from "../lib/mandalart";

interface Props {
  mandalart: Mandalart;
  selectedCoreId: string | null;
  selectedDetailId: string | null;
  onSelectCore: (coreId: string | null) => void;
  onSelectDetail: (detailId: string | null) => void;
}

const CENTER_ORDER = [0, 1, 2, 3, -1, 4, 5, 6, 7];

function OuterRegion({ core, selected, onSelect }: { core: CoreGoal | DetailGoal; selected: boolean; onSelect: () => void }) {
  const cells = [core.actions[0], core.actions[1], core.actions[2], core.actions[3], null, core.actions[4], core.actions[5], core.actions[6], core.actions[7]];
  return <div className={`board-region tone-${core.colorKey} ${selected ? "selected" : ""}`}>{cells.map((action, index) => action ? <div className={`board-cell action-cell ${action.completed ? "is-complete" : ""}`} key={action.id} title={action.text}>{action.completed && <Check size={10} aria-hidden="true" />}{action.text || <span className="empty-dot" />}</div> : <button className="board-cell core-cell" type="button" key={`core-${index}`} onClick={onSelect} aria-label={`${core.title || "이름 없는 목표"} 영역 편집`}>{core.title || "핵심 목표"}</button>)}</div>;
}

export function MandalartBoard({ mandalart, selectedCoreId, selectedDetailId, onSelectCore, onSelectDetail }: Props) {
  const selectedCore = mandalart.coreGoals.find((item) => item.id === selectedCoreId) ?? null;
  const title = selectedCore ? `${selectedCore.title || "이름 없는 목표"} 상세 만다라트` : "한눈에 보는 만다라트";
  const eyebrow = selectedCore ? "상세 지도" : "전체 지도";
  const help = selectedCore ? "색깔 중심 칸을 눌러 행동 편집으로 들어가세요." : "큰 방향을 눌러 상세 만다라트로 들어가세요.";

  return <section className="board-card" aria-labelledby="board-title"><div className="section-heading"><div><span className="eyebrow">{eyebrow}</span><h2 id="board-title">{title}</h2></div><p>{help}</p></div><div className="mandalart-board">{Array.from({ length: 9 }, (_, regionIndex) => {
    if (!selectedCore) {
      if (regionIndex === 4) return <div className="board-region center-region" key="center">{CENTER_ORDER.map((coreIndex) => coreIndex === -1 ? <button className="board-cell goal-cell" type="button" key="goal" onClick={() => onSelectCore(null)} aria-label="중심 목표 편집">{mandalart.centerGoal || "중심 목표"}</button> : <button className={`board-cell core-cell tone-${mandalart.coreGoals[coreIndex].colorKey}`} type="button" key={mandalart.coreGoals[coreIndex].id} onClick={() => onSelectCore(mandalart.coreGoals[coreIndex].id)} aria-label={`${mandalart.coreGoals[coreIndex].title || "이름 없는 목표"} 상세 만다라트 열기`}>{mandalart.coreGoals[coreIndex].title || "핵심 목표"}</button>)}</div>;
      const core = mandalart.coreGoals[regionIndex < 4 ? regionIndex : regionIndex - 1];
      return <OuterRegion key={core.id} core={core} selected={selectedCoreId === core.id} onSelect={() => onSelectCore(core.id)} />;
    }

    if (regionIndex === 4) return <div className="board-region center-region" key="center">{CENTER_ORDER.map((detailIndex) => detailIndex === -1 ? <button className={`board-cell goal-cell tone-${selectedCore.colorKey}`} type="button" key="goal" onClick={() => onSelectDetail(null)} aria-label={`${selectedCore.title || "이름 없는 목표"} 상세 중심 편집`}>{selectedCore.title || "핵심 목표"}</button> : <button className={`board-cell core-cell tone-${selectedCore.detailGoals[detailIndex].colorKey}`} type="button" key={selectedCore.detailGoals[detailIndex].id} onClick={() => onSelectDetail(selectedCore.detailGoals[detailIndex].id)} aria-label={`${selectedCore.detailGoals[detailIndex].title || "이름 없는 목표"} 행동 편집`}>{selectedCore.detailGoals[detailIndex].title || "세부 방향"}</button>)}</div>;
    const detail = selectedCore.detailGoals[regionIndex < 4 ? regionIndex : regionIndex - 1];
    return <OuterRegion key={detail.id} core={detail} selected={selectedDetailId === detail.id} onSelect={() => onSelectDetail(detail.id)} />;
  })}</div></section>;
}
