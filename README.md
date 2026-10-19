# OMNI

**서버에 필요한 다양한 기능을 하나로.**

[![Node.js](https://img.shields.io/badge/Node.js-22%20%7C%2024-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?style=flat-square&logo=discord&logoColor=white)](https://discord.js.org/)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![License](https://img.shields.io/badge/License-PolyForm%20Noncommercial-17191F?style=flat-square)](LICENSE)

옴니봇은 게임, 음악, 학교생활 정보와 서버 관리를 지원하는 다기능 Discord 봇입니다.

[기능](#기능) · [시작하기](#시작하기) · [이용약관](https://felnut.github.io/OMNI-Bot/terms) · [개인정보 처리방침](https://felnut.github.io/OMNI-Bot/privacy) · [변경 기록](https://felnut.github.io/OMNI-Bot/changelog)

## 기능

| 분야 | 기능 |
| --- | --- |
| 경제 | 출석 보상, 잔액 조회, 송금, 랭킹 |
| 게임 | 홀짝, 복권, 카드뽑기, 블랙잭, 룰렛, 숫자야구 |
| 주식 | 가상 주식 시세, 매수·매도, 보유 자산, 뉴스, 차트 |
| 음악 | 검색·재생, 대기열, 반복, 섞기, 볼륨 조절 |
| 학교 | 급식, 시간표, 학사일정, 일정 검색, 급식 알림 |
| 관리 | 메시지 청소, 슬로우모드, 채널 잠금, 공지, 경고, 타임아웃, 추방·차단 |
| 편의 | 디데이, 추첨, 서버·유저 정보 |

## 시작하기

Node.js **22 또는 24**와 Discord 봇 토큰이 필요합니다.

```bash
git clone https://github.com/felnut/OMNI-Bot.git
cd OMNI-Bot
npm install
```

프로젝트 루트에 `.env` 파일을 생성합니다.

```dotenv
DISCORD_TOKEN=봇_토큰
CLIENT_ID=애플리케이션_ID
GUILD_ID=서버_ID
OWNER_ID=봇_소유자_ID
NEIS_TOKEN=나이스_API_키
```

명령어를 등록하고 봇을 실행합니다.

```bash
node index.js --deploy
node index.js
```

> 명령어는 `GUILD_ID`로 지정한 서버에 등록됩니다. 경제 데이터는 서버별로 분리되지 않습니다.

## 추가 설정

<details>
<summary>학교 정보</summary>

[NEIS Open API](https://open.neis.go.kr/)에서 발급한 키를 `NEIS_TOKEN`에 입력합니다.

서버 관리자가 학교를 검색하고 등록하면 학교 관련 기능을 사용할 수 있습니다.

```text
/학교등록 검색 이름:학교명
/학교등록 확인
```

- `/급식` — 급식 조회
- `/시간표` — 시간표 조회
- `/학사일정` — 학사일정 조회
- `/일정검색` — 키워드로 일정 검색
- `/급식알림` — 평일 아침 급식 알림 설정

</details>

<details>
<summary>음악 재생</summary>

음악 기능에는 **Java 17 이상**, **Lavalink v4**, **yt-dlp**가 필요합니다.

1. [Lavalink](https://github.com/lavalink-devs/Lavalink/releases)의 `Lavalink.jar`를 `music/`에 넣습니다.
2. `music/application.yml.example`을 `music/application.yml`로 복사하고 비밀번호를 설정합니다.
3. `.env`에 연결 정보를 추가합니다.

```dotenv
LAVALINK_HOST=127.0.0.1
LAVALINK_PORT=2333
LAVALINK_PASSWORD=설정한_비밀번호
YTDLP_PATH=yt-dlp
```

Windows에서는 `music/start.bat`으로 Lavalink를 실행한 뒤 봇을 시작합니다.

```text
/음악 재생 검색어:곡명 또는 링크
```

**선택: yt-dlp 상시 워커**

Python 3.10 이상에서 가상환경에 yt-dlp를 설치하면 봇이 워커를 자동으로 실행합니다.

```bash
python -m venv music/tools/ytdlp-venv
```

Windows:

```bash
music/tools/ytdlp-venv/Scripts/python.exe -m pip install yt-dlp
```

Linux / macOS:

```bash
music/tools/ytdlp-venv/bin/python -m pip install yt-dlp
```

| 환경 변수 | 기본값 | 설명 |
| --- | --- | --- |
| `MUSIC_CACHE_MAX_MB` | `2048` | 음원 캐시 용량(MB). `0`이면 비활성화 |
| `MUSIC_CACHE_MAX_MINUTES` | `30` | 캐시에 저장할 곡의 최대 길이(분) |
| `MUSIC_CACHE_PORT` | `2334` | 로컬 캐시 서버 포트 |
| `YTDLP_USE_WORKER` | 활성화 | `0`이면 상시 워커 비활성화 |
| `YTDLP_AUTO_UPDATE` | 활성화 | `0`이면 추출 실패 시 자동 업데이트 비활성화 |

캐시는 `music/cache/`에 저장됩니다.

</details>

<details>
<summary>주식 초기화</summary>

```bash
node index.js --reset-stocks
```

데이터를 백업한 뒤 주가를 기준가로 복원하고, 보유 주식 평가액의 50%를 현금으로 보상합니다. 한 번만 실행되는 작업이며, 안내문은 콘솔에 출력됩니다.

</details>

## 기술

Node.js · discord.js · SQLite · better-sqlite3 · Lavalink · yt-dlp · NEIS Open API

## 문제 해결

| 문제 | 확인 사항 |
| --- | --- |
| 인증 오류 `401` | `DISCORD_TOKEN` 확인 |
| 명령어가 표시되지 않음 | `CLIENT_ID`, `GUILD_ID` 확인 후 `--deploy` 실행 |
| 데이터베이스 생성 실패 | 프로젝트 폴더 쓰기 권한 확인 |
| 학교 정보 조회 실패 | `NEIS_TOKEN` 및 `/학교등록 확인` 점검 |
| 음악 재생 실패 | Lavalink 실행 상태, 연결 정보, yt-dlp 설치 확인 |

## 기여

버그와 기능 제안은 [Issues](https://github.com/felnut/OMNI-Bot/issues)에 남겨 주세요. Pull Request도 환영합니다.

## 라이선스

[PolyForm Noncommercial 1.0.0](LICENSE) · 비상업적 이용

2026년 10월 15일 이전에 MIT 라이선스로 받은 사본에는 당시 라이선스가 계속 적용됩니다.

© 2026 felnut
