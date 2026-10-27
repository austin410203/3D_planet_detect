/**
 * gamecenter-setup.mjs — 用 App Store Connect API 建立 Game Center 排行榜（docs/game-center.md 的 30 個）
 * --------------------------------------------------
 * 在 GitHub Actions 跑（.github/workflows/gamecenter.yml），金鑰只放在 repo secrets：
 *   ASC_ISSUER_ID、ASC_KEY_ID、ASC_KEY_P8（.p8 完整內容）
 * 可以重複執行：已存在的排行榜（同一個 vendorIdentifier）會略過，只補缺少的語系名稱。
 * 加 --dry-run 只印出要建立的內容，不呼叫 API。
 */
import { createSign } from 'node:crypto';
import { LEVELS } from '../src/levels.js';
import { LEVEL_TEXT as EN } from '../src/locales/levels-en.js';
import { LEVEL_TEXT as JA } from '../src/locales/levels-ja.js';
import { LEVEL_TEXT as KO } from '../src/locales/levels-ko.js';

const APP_ID = '6827234202'; // App Store Connect 的 App Apple ID
const API = 'https://api.appstoreconnect.apple.com';
const DRY = process.argv.includes('--dry-run');

// ---------- 排行榜清單 ----------
const LOCALES = ['zh-Hant', 'en-US', 'ja', 'ko'];
const nameOf = (lv) => ({ 'zh-Hant': lv.name, 'en-US': EN[lv.id]?.name ?? lv.name, ja: JA[lv.id]?.name ?? lv.name, ko: KO[lv.id]?.name ?? lv.name });
const BEST_SUFFIX = { 'zh-Hant': '最快時間', 'en-US': 'Best Time', ja: '最速タイム', ko: '최단 기록' };

// 每日挑戰從下一個 00:00 UTC+8（＝16:00 UTC）開始循環，與遊戲換日一致
const next16 = new Date();
next16.setUTCHours(16, 0, 0, 0);
if (next16 <= new Date()) next16.setUTCDate(next16.getUTCDate() + 1);

const BOARDS = [
  {
    vendorIdentifier: 'plf.daily', referenceName: 'Daily Challenge', defaultFormatter: 'ELAPSED_TIME_CENTISECOND',
    submissionType: 'BEST_SCORE', scoreSortType: 'ASC',
    recurrenceStartDate: next16.toISOString().replace(/\.\d{3}Z$/, 'Z'), recurrenceDuration: 'PT24H', recurrenceRule: 'FREQ=DAILY;INTERVAL=1',
    names: { 'zh-Hant': '每日挑戰', 'en-US': 'Daily Challenge', ja: 'デイリーチャレンジ', ko: '데일리 챌린지' },
  },
  {
    vendorIdentifier: 'plf.stars', referenceName: 'Total Stars', defaultFormatter: 'INTEGER',
    submissionType: 'BEST_SCORE', scoreSortType: 'DESC', scoreRangeStart: '0', scoreRangeEnd: String(LEVELS.length * 3),
    names: { 'zh-Hant': '總星數', 'en-US': 'Total Stars', ja: '合計スター', ko: '총 별 개수' },
    suffix: { 'zh-Hant': [' 顆星', ' 顆星'], 'en-US': [' stars', ' star'], ja: [' 個', ' 個'], ko: ['개', '개'] },
  },
  ...LEVELS.map((lv, i) => {
    const n = nameOf(lv);
    return {
      vendorIdentifier: `plf.best.${lv.id}`, referenceName: `Best ${String(i + 1).padStart(2, '0')} ${EN[lv.id]?.name ?? lv.id}`,
      defaultFormatter: 'ELAPSED_TIME_CENTISECOND', submissionType: 'BEST_SCORE', scoreSortType: 'ASC',
      // Apple 限制名稱最多 30 字：太長就只放星球名稱
      names: Object.fromEntries(LOCALES.map((l) => { const full = `${n[l]} ${BEST_SUFFIX[l]}`; return [l, [...full].length <= 30 ? full : n[l].slice(0, 30)]; })),
    };
  }),
];

if (DRY) {
  for (const b of BOARDS) console.log(b.vendorIdentifier, '|', b.referenceName, '|', Object.values(b.names).join(' / '), b.recurrenceStartDate ?? '');
  console.log(`共 ${BOARDS.length} 個`);
  process.exit(0);
}

const DURATIONS = ['PT24H', 'P1DT0H0M0S', 'P0Y0M1DT0H0M0S', 'PT1440M', 'P1DT0H', 'PT86400S'];

// ---------- API ----------
const { ASC_ISSUER_ID, ASC_KEY_ID, ASC_KEY_P8 } = process.env;
if (!ASC_ISSUER_ID || !ASC_KEY_ID || !ASC_KEY_P8) throw new Error('缺少 ASC_ISSUER_ID／ASC_KEY_ID／ASC_KEY_P8');

const b64url = (x) => Buffer.from(typeof x === 'string' ? x : JSON.stringify(x)).toString('base64url');
function token() {
  const now = Math.floor(Date.now() / 1000);
  const body = `${b64url({ alg: 'ES256', kid: ASC_KEY_ID, typ: 'JWT' })}.${b64url({ iss: ASC_ISSUER_ID, iat: now, exp: now + 15 * 60, aud: 'appstoreconnect-v1' })}`;
  const sig = createSign('SHA256').update(body).sign({ key: ASC_KEY_P8, dsaEncoding: 'ieee-p1363' });
  return `${body}.${sig.toString('base64url')}`;
}
async function api(method, path, data) {
  const res = await fetch(API + path, {
    method, headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
    body: data ? JSON.stringify({ data }) : undefined,
  });
  const json = res.status === 204 ? {} : await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(`${method} ${path} → ${res.status} ${(json.errors ?? []).map((e) => `${e.code}: ${e.detail}`).join('；')}`);
    err.status = res.status;
    throw err;
  }
  return json;
}
async function all(path) {
  const out = [];
  for (let next = path; next;) {
    const j = await api('GET', next.replace(API, ''));
    out.push(...j.data);
    next = j.links?.next;
  }
  return out;
}

// 1. Game Center 設定（沒有就建立）
let detailId;
try {
  detailId = (await api('GET', `/v1/apps/${APP_ID}/gameCenterDetail`)).data?.id;
} catch (e) { if (e.status !== 404) throw e; }
if (!detailId) {
  detailId = (await api('POST', '/v1/gameCenterDetails', { type: 'gameCenterDetails', relationships: { app: { data: { type: 'apps', id: APP_ID } } } })).data.id;
  console.log('＋ 建立 Game Center 設定', detailId);
}
console.log('Game Center 設定：', detailId);

// 2. 排行榜與語系名稱
const existing = new Map((await all(`/v1/gameCenterDetails/${detailId}/gameCenterLeaderboards?limit=200`)).map((d) => [d.attributes.vendorIdentifier, d.id]));
let made = 0, locs = 0;
const failed = [];
for (const b of BOARDS) {
  try {
    let id = existing.get(b.vendorIdentifier);
    if (!id) {
      const attributes = Object.fromEntries(Object.entries(b).filter(([k]) => !['names', 'suffix'].includes(k)));
      // 循環長度的寫法 Apple 沒寫清楚，依序試幾種 ISO 8601 寫法
      const durations = attributes.recurrenceDuration ? DURATIONS : [undefined];
      for (const [i, d] of durations.entries()) {
        try {
          if (d) attributes.recurrenceDuration = d;
          id = (await api('POST', '/v1/gameCenterLeaderboards', {
            type: 'gameCenterLeaderboards', attributes,
            relationships: { gameCenterDetail: { data: { type: 'gameCenterDetails', id: detailId } } },
          })).data.id;
          if (d) console.log('  循環長度寫法：', d);
          break;
        } catch (e) {
          if (!d || i === durations.length - 1 || !/recurrenceDuration/.test(e.message)) throw e;
          console.log('  不接受', d);
        }
      }
      made++;
      console.log('＋ 排行榜', b.vendorIdentifier);
    }
    const have = new Set((await all(`/v1/gameCenterLeaderboards/${id}/localizations?limit=50`)).map((l) => l.attributes.locale));
    for (const locale of LOCALES) {
      if (have.has(locale)) continue;
      const [suffix, singular] = b.suffix?.[locale] ?? [];
      await api('POST', '/v1/gameCenterLeaderboardLocalizations', {
        type: 'gameCenterLeaderboardLocalizations',
        attributes: { locale, name: b.names[locale], ...(suffix ? { formatterSuffix: suffix, formatterSuffixSingular: singular } : {}) },
        relationships: { gameCenterLeaderboard: { data: { type: 'gameCenterLeaderboards', id } } },
      });
      locs++;
    }
  } catch (e) {
    failed.push(b.vendorIdentifier);
    console.error('✗', b.vendorIdentifier, e.message);
  }
}
console.log(`完成：新建排行榜 ${made} 個、語系名稱 ${locs} 筆；原本已有 ${existing.size} 個`);
if (failed.length) { console.error('失敗：', failed.join(', ')); process.exit(1); }
