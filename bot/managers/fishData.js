// 낚시 데이터: 어종, 낚싯대별 확률표, 미끼 종류. 확률표는 낚싯대마다 합이 TOTAL(1,000,000)이고 기대 환수율이 94%다.
// (낚싯대가 좋아져도 환수율은 그대로 — 새 어종이 나타나고 대신 기존 희귀종 확률이 조금 줄어든다)
const FISH = [
  { key: "boot", name: "👢 낡은 장화", mult: 0, rod: 0 },
  { key: "crucian", name: "🐟 붕어", mult: 0.4, rod: 0 },
  { key: "carp", name: "🐠 잉어", mult: 0.9, rod: 0 },
  { key: "bass", name: "🐡 농어", mult: 1.5, rod: 0 },
  { key: "salmon", name: "🍣 연어", mult: 3, rod: 0 },
  { key: "tuna", name: "🦈 참치", mult: 6, rod: 0 },
  { key: "gold", name: "👑 황금물고기", mult: 20, rod: 0 },
  { key: "squid", name: "🦑 오징어", mult: 2, rod: 1 },
  { key: "octopus", name: "🐙 문어", mult: 8, rod: 2 },
  { key: "whale", name: "🐋 고래", mult: 40, rod: 3 },
];
const BY_KEY = new Map(FISH.map((f) => [f.key, f]));

// 낚싯대 단계별 확률(가중치). 인덱스 = 낚싯대 단계
const WEIGHTS = [
  { boot: 250000, crucian: 306000, carp: 214000, bass: 140000, salmon: 65000, tuna: 20000, gold: 5000 },
  { boot: 250000, crucian: 249800, carp: 261200, bass: 110000, salmon: 50000, tuna: 15000, gold: 4000, squid: 60000 },
  { boot: 250000, crucian: 306000, carp: 234000, bass: 90000, salmon: 40000, tuna: 12000, gold: 3000, squid: 50000, octopus: 15000 },
  { boot: 250000, crucian: 403500, carp: 164000, bass: 80000, salmon: 35000, tuna: 10000, gold: 2500, squid: 40000, octopus: 12000, whale: 3000 },
];
/** 낚싯대 단계의 pickWeighted용 표 [{...어종, weight}] */
const tableFor = (rod) => Object.entries(WEIGHTS[rod]).map(([key, weight]) => ({ ...BY_KEY.get(key), weight }));

const RODS = [
  { name: "맨손", price: 0 },
  { name: "대나무 낚싯대", price: 1500 },
  { name: "탄소 낚싯대", price: 8000 },
  { name: "티타늄 낚싯대", price: 30000 },
];

// 미끼 한 개 가격 = 한 번 던질 때의 판돈. 잡은 물고기는 가격 × 배율에 바로 팔린다
const BAITS = [
  { key: "basic", name: "일반 미끼", price: 100 },
  { key: "premium", name: "고급 미끼", price: 1000 },
  { key: "deluxe", name: "최고급 미끼", price: 10000 },
];
const BAIT_BY_KEY = new Map(BAITS.map((b) => [b.key, b]));
const MAX_BAIT_PER_KIND = 500;

module.exports = { FISH, BY_KEY, WEIGHTS, tableFor, RODS, BAITS, BAIT_BY_KEY, MAX_BAIT_PER_KIND };
