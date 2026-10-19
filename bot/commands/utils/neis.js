// NEIS 교육정보 개방 포털 공통 도우미 (급식·시간표·학사일정·학교등록에서 사용)
const axios = require("axios");
const MessageFlags = require("discord.js").MessageFlags;
const db = require("../../../Database");
const cache = require("./cache");

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const TIMETABLE_SERVICE = {
  초등학교: "elsTimetable",
  중학교: "misTimetable",
  고등학교: "hisTimetable",
  특수학교: "spsTimetable",
};

const stmtSchool = db.prepare("SELECT * FROM guild_school WHERE guild_id = ?");

/** 서버에 등록된 학교. 없으면 null */
function getSchool(guildId) {
  if (!guildId) return null;
  const r = stmtSchool.get(guildId);
  if (!r) return null;
  return {
    atpt: r.atpt_code,
    code: r.school_code,
    name: r.school_name,
    kind: r.school_kind,
    timetableService: TIMETABLE_SERVICE[r.school_kind] ?? null,
    maxGrade: r.school_kind === "초등학교" ? 6 : 3,
  };
}

/** 등록된 학교를 돌려준다. 없으면 안내 메시지를 보내고 null (명령어 맨 앞에서 호출) */
async function requireSchool(interaction) {
  const school = getSchool(interaction.guildId);
  if (!school) {
    await interaction.reply({
      content: "🏫 이 서버에 등록된 학교가 없어요. 관리자가 `/학교등록 검색`으로 먼저 학교를 등록해 주세요.",
      flags: MessageFlags.Ephemeral,
    });
  }
  return school;
}

/** 한국 시각(KST) 기준 날짜. offsetDays만큼 이동 */
function kstDate(offsetDays = 0, base = Date.now()) {
  const d = new Date(base + 9 * 3600 * 1000 + offsetDays * 86400 * 1000);
  const iso = d.toISOString().slice(0, 10); // YYYY-MM-DD
  return {
    iso,
    ymd: iso.replace(/-/g, ""),
    month: Number(iso.slice(5, 7)),
    day: Number(iso.slice(8, 10)),
    weekday: WEEKDAYS[d.getUTCDay()],
    dow: d.getUTCDay(),
  };
}

/** YYYYMMDD → "10/20(화)" */
function shortDate(ymd) {
  const d = new Date(Date.UTC(+ymd.slice(0, 4), +ymd.slice(4, 6) - 1, +ymd.slice(6, 8)));
  return `${+ymd.slice(4, 6)}/${+ymd.slice(6, 8)}(${WEEKDAYS[d.getUTCDay()]})`;
}

/**
 * NEIS 서비스를 호출해 행 목록을 돌려준다 (결과는 기본 30분 캐시).
 * school이 있으면 그 학교의 교육청·학교 코드를 붙인다. 오류 메시지에는 API 키가 들어가지 않는다.
 */
async function neisRows(school, service, params = {}, ttlMs = 30 * 60 * 1000) {
  const key = process.env.NEIS_KEY || process.env.NEIS_TOKEN;
  if (!key) throw new Error("NEIS API 키가 설정되지 않았어요.");
  const base = school ? { ATPT_OFCDC_SC_CODE: school.atpt, SD_SCHUL_CODE: school.code } : {};
  const cacheKey = `neis:${service}:${JSON.stringify({ ...base, ...params })}`;
  return cache.getOrSet(cacheKey, ttlMs, async () => {
    let data;
    try {
      const res = await axios.get(`https://open.neis.go.kr/hub/${service}`, {
        timeout: 5000,
        params: { KEY: key, Type: "json", pIndex: 1, pSize: 100, ...base, ...params },
      });
      data = res.data;
    } catch (e) {
      throw new Error(`NEIS ${service} 요청 실패: ${e.message}`);
    }
    const code = data?.RESULT?.CODE ?? data?.[service]?.[0]?.head?.[1]?.RESULT?.CODE;
    if (code === "INFO-200") return []; // 해당 데이터 없음
    if (code && code !== "INFO-000") throw new Error(`NEIS ${service} 오류: ${code}`);
    return data?.[service]?.[1]?.row ?? [];
  });
}

module.exports = { WEEKDAYS, getSchool, requireSchool, kstDate, shortDate, neisRows };
