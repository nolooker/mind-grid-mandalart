import { Download, Upload } from "lucide-react";
import type { ChangeEvent } from "react";
import type { MandalartAppState } from "../lib/mandalart";
import { buildBackup, readBackup } from "../lib/backup";

export function BackupControls({ state, replaceAll }: { state: MandalartAppState; replaceAll: (state: MandalartAppState) => void }) {
  const exportAll = () => {
    const url = URL.createObjectURL(buildBackup(state));
    const link = document.createElement("a");
    link.href = url;
    link.download = `mandalart-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const importAll = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const next = await readBackup(file);
      if (window.confirm("현재 만다라트를 백업 파일의 내용으로 바꿀까요?")) replaceAll(next);
    } catch {
      window.alert("백업 파일 형식을 확인해 주세요");
    }
  };
  return <div className="backup-controls"><button type="button" onClick={exportAll} aria-label="JSON 백업 내보내기"><Download size={15} /> 내보내기</button><label aria-label="JSON 백업 가져오기"><Upload size={15} /> 가져오기<input type="file" accept="application/json,.json" onChange={importAll} /></label></div>;
}
