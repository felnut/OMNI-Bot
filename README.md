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
| 경제·성장 | 출석 보상, 송금, 퀘스트(일일·주간·월간), 도전과제, 배지, 프로필, 랭킹 |
| 게임 | 블랙잭, 룰렛, 홀짝, 가위바위보, 동물경주, 슬롯, 카드뽑기, 숫자야구, 복권 |
| 낚시·무기 | 미끼와 낚싯대로 낚시하고 도감 채우기, 무기 강화 |
| 주식 | 가상 주식 시세, 매수·매도, 보유 자산, 실현 수익, 뉴스, 차트 |
| 음악 | 검색·재생, 대기열, 반복, 섞기, 볼륨 조절, 추천(서버 운영자가 정한 사이트 기준) |
| 학교 | 급식, 시간표, 학사일정, 일정 검색, 급식 알림 |
| 관리 | 메시지 청소, 슬로우모드, 채널 잠금, 공지, 경고, 타임아웃, 추방·차단 |
| 편의 | 계산, 주사위, 운세, 추첨, 디데이, 서버·유저 정보, 도움말(`/유틸 도움말`) |
| DM 전용 | 봇과의 1:1 대화에서 쓰는 타로, 업다운, 초성퀴즈, 알림, 메모 |

## 명령어

비슷한 기능은 하나의 명령어 아래 하위 명령어로 묶여 있습니다. `/명령어 [하위 명령어]` 형태로 쓰고, 괄호 안은 한 단계 더 들어가는 하위 명령어입니다. 전체 사용법은 `/유틸 도움말`에서도 볼 수 있습니다.

| 명령어 | 하위 명령어 |
| --- | --- |
| `/게임` | 가입 / 정보 / 출석 / 송금 / 퀘스트 / 도전과제 / 배지 / 랭킹 |
| `/도박` | 블랙잭 / 룰렛 / 홀짝 / 가위바위보 / 동물경주 / 슬롯 / 카드뽑기 / 숫자야구(시작 / 포기) |
| `/낚시` | 시작 / 도감 / 상점 / 랭킹 |
| `/복권` | 구매 |
| `/무기` | 생성 / 강화 / 정보 / 판매 / 랭킹 |
| `/주식` | 주가 / 매수 / 매도 / 내주식 / 수익 / 랭킹 / 뉴스 / 차트 |
| `/음악` | 재생 / 일시정지 / 스킵 / 정지 / 대기열 / 섞기 / 반복 / 볼륨 / 추천받기 / 추천차트 / 상태 / 추천알림설정 / 추천사이트추가 / 추천사이트삭제 |
| `/학교` | 등록(검색 / 확인 / 기본 / 해제) / 시간표 / 급식 / 학사일정 / 일정검색 / 급식알림설정(설정 / 해제 / 확인) |
| `/유틸` | 계산 / 주사위 / 운세 / 추첨 / 디데이(추가 / 목록 / 삭제) / 서버정보 / 유저정보 / 핑 / 도움말 |
| `/경고` | 지급 / 차감 / 조회 |
| `/차단` | 추가 / 해제 / 목록 |
| `/타임아웃` | 설정 / 해제 |
| `/서버관리` | 청소 / 슬로우모드 / 잠금 / 잠금해제 / 공지 |
| `/추방`, `/로그채널설정` | — |
| `/관리자` | 등록 / 확인 / 해제 |
| `/운영` | 돈설정 / 시세갱신 (봇 운영자 전용) |

**DM 전용** — 서버 채널에는 나타나지 않고, 봇에게 보내는 개인 메시지(DM)에서만 보입니다.

| 명령어 | 하위 명령어 |
| --- | --- |
| `/알림` | 추가 / 목록 / 취소 |
| `/메모` | 추가 / 목록 / 삭제 / 전체삭제 |
| `/타로`, `/업다운`, `/초성퀴즈` | — |

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

> 서버 명령어는 `GUILD_ID`로 지정한 서버와 봇이 들어가 있는 모든 서버에 등록됩니다. DM 전용 명령어는 서버가 아니라 전역으로 등록되어 반영에 시간이 걸릴 수 있습니다. 경제 데이터는 서버별로 분리되지 않습니다.

## 추가 설정

<details>
<summary>학교 정보</summary>

[NEIS Open API](https://open.neis.go.kr/)에서 발급한 키를 `NEIS_TOKEN`에 입력합니다.

서버 관리자가 학교를 검색하고 등록하면 학교 관련 기능을 사용할 수 있습니다.

```text
/학교 등록 검색 이름:학교명
/학교 등록 확인
```

- `/학교 급식` — 급식 조회
- `/학교 시간표` — 시간표 조회
- `/학교 학사일정` — 학사일정 조회
- `/학교 일정검색` — 키워드로 일정 검색
- `/학교 급식알림설정` — 평일 아침 급식 알림 설정

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

봇을 실행하면 같은 컴퓨터의 Lavalink(`music/Lavalink.jar`)도 자동으로 함께 실행됩니다. 이미 실행 중이면 그대로 이어서 쓰고, Lavalink가 예기치 않게 종료되면 다시 실행하며, 봇이 정상 종료되면 함께 종료됩니다. 로그는 `music/run.log`에 남습니다. 직접 관리하고 싶다면 `.env`에 `LAVALINK_AUTOSTART=0`을 넣고 `music/start.bat`으로 따로 실행하세요.

```text
/음악 재생 검색어:곡명 또는 링크
```

**음악 추천**

서버 운영자(소유자·관리자·서버 관리 권한)가 추천 기준 사이트를 등록하면, 그 사이트의 곡 중에서 무작위로 추천합니다.

```text
/음악 추천사이트추가 주소:재생목록 주소   (유튜브·유튜브 뮤직·사운드클라우드 재생목록, 스포티파이 재생목록·앨범)
/음악 추천받기                           (누구나, 원할 때 추천받기)
/음악 추천차트                           (누구나, 사이트별 순위 TOP 10을 카테고리로 나눠 일반 텍스트로 보기)
/음악 추천알림설정 설정:켜기                (재생이 끝나면 추천곡을 자동으로 올림, 기본 꺼짐)
/음악 상태, /음악 추천사이트삭제 번호:1
```

- 스포티파이는 키 없이도 공개 재생목록·앨범 웹 페이지(`/playlist/`, `/album/`, `/track/`)에서 앞쪽 20곡을 읽어 옵니다. `.env`에 `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`이 있으면 공식 API를 먼저 쓰고, 막히면 웹 방식으로 넘어갑니다. 스포티파이 이용약관은 자동 수집을 금지하므로 이 방식을 쓰고 싶지 않다면 `SPOTIFY_WEB_FALLBACK=0`으로 끄세요(끄면 키가 있을 때만 스포티파이를 씁니다).
- 등록한 사이트가 없으면 기본 사이트(유튜브 뮤직 한국 차트, 멜론 차트, 스포티파이 한국·글로벌 Top 50)를 씁니다.
- 멜론은 사이트 페이지를 읽지 않고, 카카오엔터테인먼트가 운영하는 공식 멜론 MCP 서버(`https://mcp.melon.com/mcp/`)의 실시간 TOP 100 차트에서 1~10위만 받아 옵니다. `melon.com/chart/...` 주소를 등록해도 같은 공식 경로로 처리됩니다. 멜론 서버는 베타이며 호출 조건이 바뀔 수 있습니다(문의: melon_info@kakaoent.com).

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
| `MUSIC_CACHE_MAX_MB` | `0` (꺼짐) | 음원 캐시 용량(MB). 음원 파일을 서버에 저장하므로 저작권 위험이 있어 기본은 꺼짐입니다 |
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

<details>
<summary>웹사이트</summary>

소개 사이트(홈, 명령어, 업데이트, 이용약관, 개인정보 처리방침)는 이 저장소 옆의 별도 폴더 `02_OMNI-Bot_site`에 있습니다. 명령어 목록과 초대 주소는 봇의 명령어 정의에서 만들어서 사이트 폴더로 보냅니다.

```bash
node scripts/build-site-data.js
```

명령어를 추가하거나 설명을 바꾼 뒤 위 명령을 실행하면 사이트 폴더의 `_data`가 갱신됩니다. DB와 Discord에는 접속하지 않으며, 초대 주소는 `.env`의 `CLIENT_ID`로 만듭니다. 사이트 폴더가 다른 곳이면 `SITE_DIR=경로`를 지정하세요. 사이트 작업과 게시 방법은 사이트 폴더의 README를 보세요.

현재 `docs/`의 약관·방침은 봇이 안내하는 주소(`/OMNI-Bot/privacy`)의 원본이라 새 사이트를 게시하고 주소를 옮기기 전까지 그대로 둡니다.

</details>

## 기술

Node.js · discord.js · SQLite · better-sqlite3 · Lavalink · yt-dlp · NEIS Open API

## 문제 해결

| 문제 | 확인 사항 |
| --- | --- |
| 인증 오류 `401` | `DISCORD_TOKEN` 확인 |
| 명령어가 표시되지 않음 | `CLIENT_ID`, `GUILD_ID` 확인 후 `--deploy` 실행. 타로·업다운 같은 DM 전용 명령어는 서버가 아니라 봇과의 DM에서만 보입니다 |
| 데이터베이스 생성 실패 | 프로젝트 폴더 쓰기 권한 확인 |
| 학교 정보 조회 실패 | `NEIS_TOKEN` 및 `/학교 등록 확인` 점검 |
| 음악 재생 실패 | Lavalink 실행 상태, 연결 정보, yt-dlp 설치 확인 |

## 기여

버그와 기능 제안은 [Issues](https://github.com/felnut/OMNI-Bot/issues)에 남겨 주세요. Pull Request도 환영합니다.

## 라이선스

[PolyForm Noncommercial 1.0.0](LICENSE) · 비상업적 이용

2026년 10월 15일 이전에 MIT 라이선스로 받은 사본에는 당시 라이선스가 계속 적용됩니다.

© 2026 felnut
