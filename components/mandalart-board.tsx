import { Check } from "lucide-react";
import type { CoreGoal, Mandalart } from "../lib/mandalart";
interface Props { mandalart: Mandalart; selectedCoreId: string | null; onSelectCore: (coreId: string | null) => void; }
const CENTER_ORDER = [0, 1, 2, 3, -1, 4, 5, 6, 7];
function OuterRegion({ core, selected, onSelect }: { core: CoreGoal; selected: boolean; onSelect: () => void }) {
  const cells = [core.actions[0], core.actions[1], core.actions[2], core.actions[3], null, core.actions[4], core.actions[5], core.actions[6], core.actions[7]];
  return <div className={`board-region tone-${core.colorKey} ${selected ? "selected" : ""}`}>{cells.map((action, index) => action ? <div className={`board-cell action-cell ${action.completed ? "is-complete" : ""}`} key={action.id} title={action.text}>{action.completed && <Check size={10} aria-hidden="true" />}{action.text || <span className="empty-dot" />}</div> : <button className="board-cell core-cell" type="button" key={`core-${index}`} onClick={onSelect} aria-label={`${core.title || "이름 없는 목표"} 영역 편집`}>{core.title || "핵심 목표"}</button>)}</div>;
}
export function MandalartBoard({ mandalart, selectedCoreId, onSelectCore }: Props) {
  return <section className="board-card" aria-labelledby="board-title"><div className="section-heading"><div><span className="eyebrow">전체 지도</span><h2 id="board-title">한눈에 보는 만다라트</h2></div><p>색깔 중심 칸을 눌러 확대 편집하세요.</p></div><div className="mandalart-board">{Array.from({ length: 9 }, (_, regionIndex) => {
    if (regionIndex === 4) return <div className="board-region center-region" key="center">{CENTER_ORDER.map((coreIndex) => coreIndex === -1 ? <button className="board-cell goal-cell" type="button" key="goal" onClick={() => onSelectCore(null)} aria-label="중심 목표 편집">{mandalart.centerGoal || "중심 목표"}</button> : <button className={`board-cell core-cell tone-${mandalart.coreGoals[coreIndex].colorKey}`} type="button" key={mandalart.coreGoals[coreIndex].id} onClick={() => onSelectCore(mandalart.coreGoals[coreIndex].id)} aria-label={`${mandalart.coreGoals[coreIndex].title || "이름 없는 목표"} 영역 편집`}>{mandalart.coreGoals[coreIndex].title || "핵심 목표"}</button>)}</div>;
    const core = mandalart.coreGoals[regionIndex < 4 ? regionIndex : regionIndex - 1];
    return <OuterRegion key={core.id} core={core} selected={selectedCoreId === core.id} onSelect={() => onSelectCore(core.id)} />;
  })}</div></section>;
}
