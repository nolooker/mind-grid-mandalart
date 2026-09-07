export const SCHEMA_VERSION = 1;

export const COLOR_KEYS = [
  "coral",
  "amber",
  "olive",
  "teal",
  "sky",
  "indigo",
  "violet",
  "rose",
] as const;

export type ColorKey = (typeof COLOR_KEYS)[number];

export interface ActionItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface CoreGoal {
  id: string;
  title: string;
  colorKey: ColorKey;
  actions: ActionItem[];
  detailGoals: DetailGoal[];
}

export interface DetailGoal {
  id: string;
  title: string;
  colorKey: ColorKey;
  actions: ActionItem[];
}

export interface Mandalart {
  id: string;
  title: string;
  centerGoal: string;
  createdAt: string;
  updatedAt: string;
  coreGoals: CoreGoal[];
}

export interface MandalartAppState {
  schemaVersion: 1;
  selectedMandalartId: string | null;
  mandalarts: Mandalart[];
}

const uid = () => crypto.randomUUID();

const createAction = (): ActionItem => ({ id: uid(), text: "", completed: false });

const createDetailGoal = (colorKey: ColorKey): DetailGoal => ({
  id: uid(),
  title: "",
  colorKey,
  actions: Array.from({ length: 8 }, createAction),
});

export function createMandalart(title = "새 만다라트"): Mandalart {
  const now = new Date().toISOString();
  return {
    id: uid(),
    title: title.trim() || "새 만다라트",
    centerGoal: "",
    createdAt: now,
    updatedAt: now,
    coreGoals: COLOR_KEYS.map((colorKey) => ({
      id: uid(),
      title: "",
      colorKey,
      actions: Array.from({ length: 8 }, createAction),
      detailGoals: COLOR_KEYS.map(createDetailGoal),
    })),
  };
}

const writtenActions = (core: CoreGoal | DetailGoal) => core.actions.filter((action) => action.text.trim());
const coreWrittenActions = (core: CoreGoal) => core.detailGoals.length ? core.detailGoals.flatMap(writtenActions) : writtenActions(core);

export function calculateCoreProgress(core: CoreGoal | DetailGoal): number {
  const written = writtenActions(core);
  if (!written.length) return 0;
  return Math.round((written.filter((action) => action.completed).length / written.length) * 100);
}

export function calculateCoreTreeProgress(core: CoreGoal): number {
  const written = coreWrittenActions(core);
  if (!written.length) return 0;
  return Math.round((written.filter((action) => action.completed).length / written.length) * 100);
}

export function calculateOverallProgress(mandalart: Mandalart): number {
  const written = mandalart.coreGoals.flatMap(coreWrittenActions);
  if (!written.length) return 0;
  return Math.round((written.filter((action) => action.completed).length / written.length) * 100);
}

export function normalizeActionText(item: ActionItem, text: string): ActionItem {
  const normalized = text.trim() ? text : "";
  return { ...item, text: normalized, completed: normalized ? item.completed : false };
}

export function createInitialState(): MandalartAppState {
  const mandalart = createMandalart("나의 성장 계획");
  mandalart.centerGoal = "더 나은 나 만들기";
  const examples = [
    ["건강", "주 3회 30분 걷기", "하루 물 6잔 마시기"],
    ["커리어", "주 2회 포트폴리오 개선", "월 1개 프로젝트 회고"],
    ["배움", "매일 20분 독서", "주 1회 배운 내용 기록"],
    ["관계", "주 1회 안부 전하기", "월 1회 가족과 식사"],
    ["재정", "월 예산 점검", "자동 저축 유지"],
    ["생활", "매일 10분 정리", "주말 다음 주 계획"],
    ["마음", "하루 한 줄 감사 기록", "주 1회 디지털 휴식"],
    ["도전", "분기별 새 경험", "작은 시도 기록하기"],
  ];
  mandalart.coreGoals = mandalart.coreGoals.map((core, index) => ({
    ...core,
    title: examples[index][0],
    actions: core.actions.map((action, actionIndex) => ({
      ...action,
      text: examples[index][actionIndex + 1] ?? "",
    })),
    detailGoals: core.detailGoals.map((detail, detailIndex) => ({
      ...detail,
      title: detailIndex === 0 ? examples[index][0] : "",
      actions: detailIndex === 0
        ? detail.actions.map((action, actionIndex) => ({ ...action, text: examples[index][actionIndex + 1] ?? "" }))
        : detail.actions,
    })),
  }));
  return { schemaVersion: SCHEMA_VERSION, selectedMandalartId: mandalart.id, mandalarts: [mandalart] };
}
