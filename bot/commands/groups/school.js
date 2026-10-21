const { makeGroup } = require("../../commandGroup");
const u = (file) => require(`../utils/${file}`);

// /학교 — 학교 등록과 급식·시간표·학사일정
module.exports = makeGroup({
  name: "학교",
  description: "학교 등록, 급식·시간표·학사일정 확인",
  entries: [
    { name: "등록", module: require("../admin/school_register") },
    { name: "시간표", module: u("timetable") },
    { name: "급식", module: u("school_lunch") },
    { name: "학사일정", module: u("school_schedule") },
    { name: "일정검색", module: u("school_search") },
    { name: "급식알림설정", module: require("../admin/lunch_notice") },
  ],
});
