# Personal Mandalart Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 여러 만다라트를 브라우저에 자동 저장하고 9×9 보드, 확대 편집, 완료 체크, 진행률, JSON 백업으로 관리하는 개인용 웹 앱을 만든다.

**Architecture:** Sites의 단일 페이지 React 앱으로 구현한다. 순수 TypeScript 도메인 모듈이 데이터 생성·검증·진행률을 담당하고, React 상태 훅이 `localStorage` 영속화를 담당하며, 화면 컴포넌트는 이 인터페이스만 사용한다.

**Tech Stack:** Sites vinext starter, React, TypeScript, CSS, lucide-react, Vitest, Testing Library, browser `localStorage`/File APIs

**Spec:** `docs/superpowers/specs/2026-08-31-personal-mandalart-design.md`

## Global Constraints

- 한 페이지에서 앱 셸, 목록, 9×9 보드, 3×3 확대 편집기를 제공한다.
- 계정, 서버 데이터베이스, 동기화, 협업, 외부 API를 사용하지 않는다.
- 작성된 실행 항목만 진행률 분모에 포함하며 작성 항목이 없으면 0%다.
- 완료된 실행 항목의 문구가 비면 완료 상태도 해제한다.
- 데이터는 버전이 포함된 단일 JSON 값으로 `localStorage`에 저장한다.
- JSON 가져오기는 검증과 사용자 확인을 통과하기 전 기존 데이터를 변경하지 않는다.
- 데스크톱과 모바일, 키보드 조작, 명확한 포커스와 접근성 이름을 지원한다.
- 장식 이미지를 사용하지 않고 아이보리 배경, 타이포그래피, 영역별 색상으로 시각 체계를 만든다.

---

### Task 1: Sites 프로젝트와 만다라트 도메인 모델

**Files:**
- Create via initializer: `package.json`, `app/page.tsx`, `app/layout.tsx`, `app/globals.css`, `.openai/hosting.json`
- Create: `lib/mandalart.ts`
- Create: `lib/mandalart.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `MandalartAppState`, `Mandalart`, `CoreGoal`, `ActionItem` types
- Produces: `createMandalart(title?: string): Mandalart`
- Produces: `createInitialState(): MandalartAppState`
- Produces: `calculateCoreProgress(core: CoreGoal): number`
- Produces: `calculateOverallProgress(mandalart: Mandalart): number`
- Produces: `normalizeActionText(item: ActionItem, text: string): ActionItem`

- [ ] **Step 1: Initialize the Sites starter and add test dependencies**

Run the Sites initializer once against the workspace, retain installation until complete, then add `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, and `@testing-library/user-event` as dev dependencies. Add scripts `"test": "vitest run"` and `"test:watch": "vitest"`.

- [ ] **Step 2: Write failing domain tests**

Create `lib/mandalart.test.ts` with tests asserting that `createMandalart("건강")` returns exactly 8 core goals with 8 action items each and stable non-empty IDs; progress ignores blank text; two written items with one complete returns 50; and `normalizeActionText({ completed: true }, "   ")` returns empty text with `completed: false`.

```ts
expect(createMandalart("건강").coreGoals).toHaveLength(8)
expect(createMandalart("건강").coreGoals.every((goal) => goal.actions.length === 8)).toBe(true)
expect(calculateCoreProgress(coreWith("걷기", true, "", false))).toBe(100)
expect(calculateCoreProgress(coreWith("걷기", true, "물 마시기", false))).toBe(50)
expect(normalizeActionText({ id: "a", text: "걷기", completed: true }, "   ").completed).toBe(false)
```

- [ ] **Step 3: Run the domain tests and verify failure**

Run: `npm test -- lib/mandalart.test.ts`
Expected: FAIL because `lib/mandalart.ts` does not exist.

- [ ] **Step 4: Implement the domain module**

Define schema version `1`, eight stable color keys, UUID generation using `crypto.randomUUID()`, trimmed-text eligibility, and integer progress rounded with `Math.round(completed / written * 100)`. `createInitialState()` must include one example titled `나의 첫 만다라트` with center goal `더 나은 나 만들기`, useful Korean sample core goals, and at least several editable example actions.

- [ ] **Step 5: Run tests and commit**

Run: `npm test -- lib/mandalart.test.ts`
Expected: PASS.

```bash
git add package.json package-lock.json app .openai lib
git commit -m "feat: scaffold mandalart domain model"
```

### Task 2: 저장소 검증과 자동 저장 상태 훅

**Files:**
- Create: `lib/storage.ts`
- Create: `lib/storage.test.ts`
- Create: `hooks/use-mandalarts.ts`
- Create: `hooks/use-mandalarts.test.tsx`

**Interfaces:**
- Consumes: `MandalartAppState`, `createInitialState()`
- Produces: `STORAGE_KEY = "personal-mandalart:v1"`
- Produces: `parseStoredState(raw: string | null): MandalartAppState | null`
- Produces: `serializeState(state: MandalartAppState): string`
- Produces: `useMandalarts(): { state, storageStatus, create, rename, duplicate, remove, select, updateCenter, updateCore, updateAction, toggleAction, replaceAll }`

- [ ] **Step 1: Write failing storage and hook tests**

Test that malformed JSON and wrong schema return `null`; a serialized valid state round-trips; the hook restores valid saved data; updates render immediately; blanking a completed action clears completion; and fake timers show one `localStorage.setItem` call after a 250 ms debounce.

```ts
expect(parseStoredState("not-json")).toBeNull()
expect(parseStoredState(JSON.stringify({ schemaVersion: 99 }))).toBeNull()
expect(parseStoredState(serializeState(state))).toEqual(state)
```

- [ ] **Step 2: Run tests and verify failure**

Run: `npm test -- lib/storage.test.ts hooks/use-mandalarts.test.tsx`
Expected: FAIL because the storage module and hook do not exist.

- [ ] **Step 3: Implement strict storage parsing**

Validate the complete nested shape without coercing unknown input. Never write during parsing. Return `null` for missing required IDs, non-array core goals, counts other than 8, invalid action counts, or non-boolean completion values.

- [ ] **Step 4: Implement the state hook**

Initialize from storage when valid, otherwise from `createInitialState()`. Implement immutable updates, unique-copy IDs, safe selection after deletion, `storageStatus` values `saved | saving | error`, and 250 ms debounced persistence inside an effect. Catch storage exceptions without reverting in-memory state.

- [ ] **Step 5: Run tests and commit**

Run: `npm test -- lib/storage.test.ts hooks/use-mandalarts.test.tsx`
Expected: PASS.

```bash
git add lib/storage.ts lib/storage.test.ts hooks
git commit -m "feat: persist mandalarts locally"
```

### Task 3: 첫 화면, 전체 보드, 확대 편집기

**Files:**
- Create: `components/app-shell.tsx`
- Create: `components/mandalart-board.tsx`
- Create: `components/focus-editor.tsx`
- Create: `components/progress-ring.tsx`
- Create: `components/editor.test.tsx`
- Modify: `app/page.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: `useMandalarts()` and progress functions
- Produces: `MandalartBoard({ mandalart, selectedCoreId, onSelectCore })`
- Produces: `FocusEditor({ mandalart, selectedCoreId, onUpdateCenter, onUpdateCore, onUpdateAction, onToggleAction })`
- Produces: responsive `AppShell`

- [ ] **Step 1: Write failing interaction tests**

Render the editor with a fixture and assert the center goal and all eight core goal labels appear; selecting a board region changes the visible editor heading; typing in an action calls `onUpdateAction`; clicking its checkbox calls `onToggleAction`; and accessible names identify each control.

```tsx
await user.click(screen.getByRole("button", { name: /건강 영역 편집/ }))
expect(screen.getByRole("heading", { name: /건강 세부 계획/ })).toBeVisible()
await user.click(screen.getByRole("checkbox", { name: /아침 산책 완료/ }))
expect(onToggleAction).toHaveBeenCalledWith(coreId, actionId)
```

- [ ] **Step 2: Run tests and verify failure**

Run: `npm test -- components/editor.test.tsx`
Expected: FAIL because the components do not exist.

- [ ] **Step 3: Build the first meaningful product slice**

Replace the starter skeleton with the app shell, representative sidebar, overall progress, recognizable 9×9 board, and a working selected 3×3 editor. Update metadata to title `마인드그리드 — 나만의 만다라트` and a Korean description. Remove the starter preview import and metadata marker. Once it compiles and the route responds successfully, open this first working version in the existing Codex preview tab before making broader product edits.

- [ ] **Step 4: Complete editing interactions and visual system**

Wire the hook to all fields. Use CSS Grid for nine 3×3 regions; visually repeat each core goal at the center of its corresponding outer region while keeping one authoritative data value. Provide eight muted accent colors, ivory background, high-contrast text, visible focus rings, hover/selected states, touch targets of at least 44 px in the editor, and no model-authored SVG imagery.

- [ ] **Step 5: Run tests and commit**

Run: `npm test -- components/editor.test.tsx`
Expected: PASS.

```bash
git add app components
git commit -m "feat: add mandalart board and focus editor"
```

### Task 4: 여러 만다라트 관리와 JSON 백업

**Files:**
- Create: `components/mandalart-sidebar.tsx`
- Create: `components/backup-controls.tsx`
- Create: `components/management.test.tsx`
- Create: `lib/backup.ts`
- Create: `lib/backup.test.ts`
- Modify: `components/app-shell.tsx`

**Interfaces:**
- Consumes: hook management actions and `parseStoredState`
- Produces: `buildBackup(state): Blob`
- Produces: `readBackup(file: File): Promise<MandalartAppState>` that rejects invalid data
- Produces: create, rename, duplicate, delete, import, export UI

- [ ] **Step 1: Write failing backup and management tests**

Assert exported JSON contains schema version and every mandalart; invalid files reject without calling `replaceAll`; valid files require confirmation before replacement; create adds and selects a mandalart; duplicate appends `복사본`; delete requires confirmation; and deleting the final item renders the empty-state creation prompt.

- [ ] **Step 2: Run tests and verify failure**

Run: `npm test -- lib/backup.test.ts components/management.test.tsx`
Expected: FAIL because backup and management components do not exist.

- [ ] **Step 3: Implement backup helpers and controls**

Generate filename `mandalart-backup-YYYY-MM-DD.json`. Read text with `File.text()`, reuse strict stored-state validation, limit accepted input to `.json`, and surface `백업 파일 형식을 확인해 주세요` without mutating state on failure. Use native confirmation dialogs for destructive replacement and deletion in this first version.

- [ ] **Step 4: Implement multi-mandalart management**

Add list switching, inline or dialog-based creation/rename, duplicate, delete, selected styling, empty state, and `저장 중 / 저장됨 / 저장할 수 없음` status. Ensure menus close on Escape and actions have visible Korean labels or accessible names.

- [ ] **Step 5: Run tests and commit**

Run: `npm test -- lib/backup.test.ts components/management.test.tsx`
Expected: PASS.

```bash
git add components lib/backup.ts lib/backup.test.ts
git commit -m "feat: manage and back up mandalarts"
```

### Task 5: 반응형 완성도, 전체 검증, Sites 배포

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`
- Delete: `app/_sites-preview/` if present
- Modify: `package.json` and lockfile only if removing the unused preview dependency

**Interfaces:**
- Consumes: complete application
- Produces: production build and private deployed Sites URL

- [ ] **Step 1: Add regression tests for agreed edge cases**

Add tests covering safe selection after deletion, storage failure status, zero written actions returning 0%, invalid import preserving current state, and every interactive icon having an accessible name.

- [ ] **Step 2: Run all automated tests**

Run: `npm test`
Expected: all tests PASS with no unhandled promise rejection.

- [ ] **Step 3: Complete responsive and accessibility styles**

At widths below 760 px, turn the sidebar into a top switcher, stack board and editor, allow the 9×9 overview to remain legible without forcing page-wide horizontal overflow, and preserve editor touch targets. Confirm `:focus-visible`, reduced-motion behavior, readable contrast, and text wrapping for long Korean goals.

- [ ] **Step 4: Remove starter artifacts and build**

Remove `app/_sites-preview` and its imports. Remove `react-loading-skeleton` only if unused, update the lockfile, then run `npm run build` while the retained development preview stays alive.

Expected: production build exits 0; root route compiles without runtime error.

- [ ] **Step 5: Commit and publish with Sites**

```bash
git add app package.json package-lock.json
git commit -m "feat: finish responsive mandalart experience"
```

Use the `sites-hosting` workflow to deploy the validated build. Reuse the existing preview tab for the publishing handoff, return the deployed private URL, then stop the retained development process.

