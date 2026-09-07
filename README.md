# 마인드그리드

개인용 만다라트 목표 관리 앱입니다. 큰 목표를 8개의 큰 방향으로 나누고, 각 큰 방향마다 한 번 더 9×9 상세 만다라트를 열어 세부 방향과 실행 행동을 관리합니다.

배포 URL: https://mind-grid-mandalart.seoteang.chatgpt.site

## 주요 기능

- 여러 만다라트 생성, 전환, 이름 변경, 복제, 삭제
- 관리 비밀번호 기반 잠금 화면
- 큰 목표 중심의 전체 9×9 만다라트
- 큰 방향별 2-depth 상세 9×9 만다라트
- 상세판 가운데 칸 클릭 시 세부 방향 목록/설계 편집
- 상세판 바깥 8개 방향 클릭 시 해당 방향의 행동 편집으로 바로 이동
- 실행 행동 완료 체크와 진행률 표시
- 모바일에서는 편집 영역을 우선 배치하고 9×9 보드는 확인용으로 아래 배치
- JSON 백업 내보내기/가져오기
- Sites D1 SQLite DB를 통한 서버 저장

## 현재 구조

```text
나의 성장 계획
└─ 큰 방향 8개
   └─ 각 큰 방향의 상세 9×9
      ├─ 가운데: 세부 방향 목록/설계
      └─ 바깥 8개 방향: 행동 편집
```

진행률은 문구가 작성된 실행 행동만 분모에 포함합니다. 빈 행동은 진행률 계산에서 제외되고, 완료된 행동의 문구를 지우면 완료 상태도 자동으로 해제됩니다.

## 저장 방식

데이터는 Sites에 연결된 D1 SQLite DB에 하나의 JSON 상태로 저장됩니다. 그래서 같은 URL과 같은 관리 비밀번호로 접속하면 기기가 달라도 같은 데이터를 봅니다.

관리 비밀번호는 Sites 런타임 환경변수 `MANDALART_PASSCODE`로 관리합니다. 저장소에는 비밀번호 값을 커밋하지 않습니다.

## 개발 명령어

```bash
npm install
npm run dev
npm test
npm run build
```

## 배포

이 프로젝트는 OpenAI Sites로 배포합니다.

- Sites 프로젝트 ID는 `.openai/hosting.json`의 `project_id`를 사용합니다.
- D1 바인딩 이름은 `DB`입니다.
- 배포 전 `npm test`와 `npm run build`를 통과해야 합니다.

## 기술 스택

- vinext / React / TypeScript
- Cloudflare Workers compatible runtime
- OpenAI Sites
- D1 SQLite
- Drizzle schema/migration
- Vitest / Testing Library
