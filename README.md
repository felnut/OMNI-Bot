# 단붕봇 (DanBungBot)

[![Node.js](https://img.shields.io/badge/Node.js-v18+-378e3d?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?logo=discord&logoColor=white)](https://discord.js.org/)
[![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

단국대학교부속소프트웨어고등학교 Discord 서버를 위한 게임 & 유틸리티 봇입니다.  
로컬 SQLite 데이터베이스를 활용해 사용자 돈, 출석, 저금 등을 관리합니다.

데일리 출석, 홀짝·복권·조커 같은 미니게임,  
송금·랭킹 시스템, 학교 급식 조회, 욕설 검열 기능까지 포함되어 있습니다.

---

## 기능 한눈에 보기

- 💰 **경제 시스템** : 개인 돈 관리, 데일리 출석 보상, 송금, 서버 랭킹
- 🎲 **미니게임** : 홀짝 (2배), 복권 (꽝 없음), 조커 (저금 + 대박)
- 🔧 **관리자 명령어** : 봇 주인 전용 돈 강제 설정
- 🍽️ **학교 급식** : [NEIS Open API](https://open.neis.go.kr/) 기반 급식 조회
- 🚫 **채팅 검열** : 욕설 자동 필터링 & 대체어 변환
- 🧪 **테스트 모드** : `--test` 플래그로 `game-test.db` 분리 사용 가능

---

## 기술 스택

- [Node.js](https://nodejs.org/)
- [discord.js v14](https://discord.js.org/#/docs)
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- [SQLite](https://www.sqlite.org/index.html)
- [axios](https://axios-http.com/)
- [dotenv](https://github.com/motdotla/dotenv)

---

## 요구 사항

- Node.js v18 이상 권장 (v16 이상 동작 가능)
- npm 또는 pnpm / yarn
- Discord Bot 토큰 ([Discord Developer Portal](https://discord.com/developers/applications))
- NEIS Open API 키 ([발급 페이지](https://open.neis.go.kr/portal/mainPage.do))

---

## 설치

### 1. 저장소 클론

```bash
git clone https://github.com/zyntax6760/DanBungBot
cd DanBungBot
```

### 2. 의존성 설치

```bash
npm install
# 또는
pnpm install
# 또는
yarn install
```

---

## 환경 변수 설정

### `.env` (운영용)

```
DISCORD_TOKEN=실제 봇 토큰
NEIS_TOKEN=나이스 API 키
CLIENT_ID=봇 애플리케이션 ID
GUILD_ID=운영서버 ID
OWNER_ID=테스터 ID
```

### `.env.test` (테스트용)

```
DISCORD_TOKEN=테스트 봇 토큰
NEIS_TOKEN=나이스 API 키
CLIENT_ID=테스트 봇 애플리케이션 ID
GUILD_ID=테스트 서버 ID
OWNER_ID=테스터_ID
```

`.env` 파일에 잘못된 따옴표나 공백이 포함될 경우  
`deploy-commands.js`가 자동 정리 후 `.env.bak` 파일을 생성합니다.

---

## 실행 방법

| 명령어 | 설명 | 사용 DB |
|--------|------|---------|
| `node index.js` | 실제 봇 실행 | game.db |
| `node index.js --test` | 테스트 봇 실행 | game-test.db |
| `node index.js --deploy` | 실제 서버 슬래시 커맨드 등록 | game.db |
| `node index.js --test --deploy` | 테스트 서버 슬래시 커맨드 등록 | game-test.db |

---

### 정상 실행 로그 예시

```
✅ Connect Database Success!
🔄 커맨드 등록 시작합니다...
✅ 명령어 등록 성공!
✅ 준비 완료! 계정: BotName#1234
```

---

## 데이터베이스 구조

### 파일

- `game.db` (본 서버)
- `game-test.db` (테스트 서버)

### 테이블

#### user

| 컬럼 | 설명 |
|------|------|
| user_id (PK) | 디스코드 사용자 ID |
| money | 보유 금액 |
| daily_last_reset | 마지막 출석 날짜 |
| streak | 연속 출석 일수 |

#### bank

| 컬럼 | 설명 |
|------|------|
| id (PK) | 고정값 |
| amount | 조커 누적 저금 |
| failed_attempts | 실패 횟수 |

---

## 텍스트 검열 시스템

- `text_censorship.js`
- `filter.json`

동작 흐름:

욕설 감지 → 원본 메시지 삭제 → 대체어 변환 후 임베드 재전송

---

## 문제 해결 FAQ

**401 Unauthorized**  
→ Discord 토큰이 잘못되었습니다.

**명령어가 보이지 않음**  
→ `node index.js --deploy` 다시 실행

**DB 파일이 생성되지 않음**  
→ 디렉토리 쓰기 권한 확인

**NEIS 급식이 나오지 않음**  
→ NEIS API 키 및 학교 코드 확인

---

## 기여

버그 리포트 및 기능 제안은  
[Issues](https://github.com/zyntax6760/DanBungBot/issues)에서 등록해 주세요.

Pull Request도 언제든 환영합니다.

---

## 라이선스

본 프로젝트는 [MIT License](https://opensource.org/licenses/MIT)를 따릅니다.

Copyright © 2025 [이름 또는 닉네임]