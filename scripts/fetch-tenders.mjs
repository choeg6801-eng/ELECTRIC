// BidLens · 해외 전력 입찰 공고 수집 스크립트
// GitHub Actions가 몇 시간마다 실행해서 tenders.json을 새로 만들어요.
// 출처: World Bank 조달 공고 API (키 불필요), EU TED Search API v3 (키 불필요)
// 직접 실행: node scripts/fetch-tenders.mjs   (Node 18 이상)

import { writeFile, readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const OUT = new URL('../tenders.json', import.meta.url);
const TODAY = new Date(); TODAY.setUTCHours(0, 0, 0, 0);
const MAX_TEXT = 20000;           // 공고 원문은 분석용으로 앞부분만 보관
const UA = { 'User-Agent': 'BidLens tender feed (portfolio project)' };
const TIMEOUT = () => (typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? AbortSignal.timeout(30000) : undefined);
const REFRESH_HOURS = 20;          // 공고가 그대로여도 이 시간이 지나면 파일을 새로 써서 '업데이트 시각'을 갱신

// 품목 분류: 제목 · 설명에서 찾는 단어
export const CATS = [
  { k: 'transformer', re: /transformer|\bxfmr\b|\bkva\b|\bmva\b/i },
  { k: 'substation', re: /substation|switchyard|grid station|gas[- ]insulated|\bgis\s+(?:sub|switch|bay)|bay extension/i },
  { k: 'switchgear', re: /switchgear|circuit breaker|recloser|ring main unit|\brmu\b|disconnector|isolator/i },
  { k: 'line', re: /transmission line|distribution line|overhead line|\bohl\b|power cable|underground cable|\b(?:11|33|66|110|132|220|230|400)\s?kv\b/i },
  { k: 'power', re: /electri(?:c|cal)\s+(?:power|network|grid|distribution|equipment|works|installation)|power (?:supply|grid|network|distribution|system|plant)|\bkv\b|\bmva\b|electrification/i }
];
const BID_TYPES = /invitation for bids|request for bids|request for quotations?|invitation for prequalification|specific procurement notice|invitation to tender|request for proposals? \(goods|tender notice/i;

export function category(text){ for(const c of CATS) if(c.re.test(text)) return c.k; return null; }
function stripHtml(h){ return String(h || '').replace(/<(?:br|\/p|\/div|\/li|\/tr|\/h\d)\s*\/?>/gi, '\n').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/[ \t]+/g, ' ').replace(/\n\s*\n\s*\n+/g, '\n\n').trim(); }
function isoDay(s){ if(!s) return null; const m = String(s).match(/(\d{4})-(\d{2})-(\d{2})/); return m ? `${m[1]}-${m[2]}-${m[3]}` : null; }
function upcoming(d){ return d && new Date(d + 'T00:00:00Z') >= TODAY; }

// ---------- World Bank ----------
const WB_TERMS = ['transformer', 'substation', 'switchgear', 'transmission line', 'distribution line', 'circuit breaker', 'power cable', 'electrification'];
export function mapWorldBank(n){
  const desc = String(n.bid_description || '').replace(/\s+/g, ' ').trim();
  const text = desc + ' ' + (n.project_name || '');
  const deadline = isoDay(n.submission_deadline_date);
  if(!BID_TYPES.test(n.notice_type || '')) return null;
  if(!upcoming(deadline)) return null;
  const cat = category(text); if(!cat) return null;
  return {
    id: 'wb-' + n.id, src: 'World Bank', title: desc || n.project_name, buyer: n.contact_organization || '', country: n.project_ctry_name || n.contact_ctry_name || '',
    deadline, deadlineTime: n.submission_deadline_time || '', published: isoDay(n.submission_date) || null, type: n.notice_type || '', ref: n.bid_reference_no || '', method: n.procurement_method_name || '',
    project: n.project_name || '', cat, url: 'https://projects.worldbank.org/en/projects-operations/procurement-detail/' + n.id,
    text: n.notice_text ? stripHtml(n.notice_text).slice(0, MAX_TEXT) : ''
  };
}
async function fetchWorldBank(){
  const seen = new Map(); const errors = [];
  for(const t of WB_TERMS){
    const url = 'https://search.worldbank.org/api/v2/procnotices?format=json&rows=100&os=0&qterm=' + encodeURIComponent(t);
    try {
      const r = await fetch(url, { headers: UA, signal: TIMEOUT() }); if(!r.ok) throw new Error('HTTP ' + r.status);
      const j = await r.json(); const list = Array.isArray(j.procnotices) ? j.procnotices : Object.values(j.procnotices || {});
      for(const n of list){ const m = mapWorldBank(n); if(m && !seen.has(m.id)) seen.set(m.id, m); }
    } catch(e){ errors.push(t + ': ' + e.message); }
  }
  return { items: [...seen.values()], errors };
}

// ---------- EU TED ----------
const TED_CPV = ['31170000', '31171000', '31172000', '31173000', '31174000', '31214000', '31211000', '31321000', '31682000'];
function allVals(v){ if(v == null) return []; if(Array.isArray(v)) return v.flatMap(allVals); if(typeof v === 'object') return Object.values(v).flatMap(allVals); return [String(v)]; }
function cpvCat(cpvs){ const c = allVals(cpvs).join(' '); return /\b3117\d{4}/.test(c) ? 'transformer' : /\b3121[0-9]{4}/.test(c) ? 'switchgear' : /\b3132\d{4}/.test(c) ? 'line' : 'power'; }
function pick(v){ if(v == null) return ''; if(typeof v === 'string') return v; if(Array.isArray(v)) return pick(v[0]); if(typeof v === 'object') return pick(v.eng ?? v.ENG ?? Object.values(v)[0]); return String(v); }
export function mapTed(n){
  const days = allVals(n['deadline-receipt-tender-date-lot']).map(isoDay).filter(upcoming).sort();
  const deadline = days[0] || null;
  if(!deadline) return null;
  const title = pick(n['notice-title']).replace(/\s+/g, ' ').trim();
  const pub = n['publication-number'];
  return {
    id: 'ted-' + pub, src: 'EU TED', title, buyer: pick(n['buyer-name']), country: pick(n['buyer-country']) || pick(n['place-of-performance']), deadline, deadlineTime: '',
    published: isoDay(pick(n['publication-date'])), type: 'Contract notice', ref: pub, method: '', project: '', cat: category(title) || cpvCat(n['classification-cpv']),
    url: 'https://ted.europa.eu/en/notice/-/detail/' + pub, text: ''
  };
}
async function fetchTed(){
  const from = new Date(TODAY.getTime() - 60 * 864e5).toISOString().slice(0, 10).replace(/-/g, '');
  const body = { query: `classification-cpv IN (${TED_CPV.join(' ')}) AND publication-date>=${from}`,
    fields: ['publication-number', 'notice-title', 'buyer-name', 'buyer-country', 'deadline-receipt-tender-date-lot', 'publication-date', 'classification-cpv'], limit: 250 };
  try {
    const r = await fetch('https://api.ted.europa.eu/v3/notices/search', { method: 'POST', headers: { ...UA, 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body), signal: TIMEOUT() });
    if(!r.ok) throw new Error('HTTP ' + r.status + ' ' + (await r.text()).slice(0, 200));
    const j = await r.json(); const items = (j.notices || []).map(mapTed).filter(Boolean);
    return { items, errors: [] };
  } catch(e){ return { items: [], errors: [e.message] }; }
}

// ---------- main ----------
async function readPrev(){ try { return JSON.parse(await readFile(OUT, 'utf8')); } catch(e){ return null; } }
export async function build(prev){
  const [wb, ted] = await Promise.all([fetchWorldBank(), fetchTed()]);
  const keep = (src, res) => {
    // 한 출처가 통째로 실패하면 그 출처의 이전 공고(아직 마감 전인 것)를 그대로 유지해요.
    if(res.items.length || !res.errors.length || !prev || !Array.isArray(prev.items)) return { items: res.items, carried: 0 };
    const old = prev.items.filter(i => i.src === src && upcoming(i.deadline));
    return { items: old, carried: old.length };
  };
  const W = keep('World Bank', wb), T = keep('EU TED', ted);
  const items = [...W.items, ...T.items].sort((a, b) => a.deadline < b.deadline ? -1 : a.deadline > b.deadline ? 1 : a.id < b.id ? -1 : 1);
  return { updatedAt: new Date().toISOString(), sources: {
    'World Bank': { ok: !wb.errors.length, count: W.items.length, carried: W.carried, errors: wb.errors },
    'EU TED': { ok: !ted.errors.length, count: T.items.length, carried: T.carried, errors: ted.errors } }, items };
}
export function shouldWrite(prev, next){
  if(!prev || !Array.isArray(prev.items) || !prev.updatedAt) return true;
  if(JSON.stringify(prev.items) !== JSON.stringify(next.items)) return true;
  if(JSON.stringify(prev.sources) !== JSON.stringify(next.sources)) return true;
  return Date.now() - new Date(prev.updatedAt).getTime() > REFRESH_HOURS * 3600e3;
}

if(process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href){
  const prev = await readPrev();
  const out = await build(prev);
  if(shouldWrite(prev, out)){ await writeFile(OUT, JSON.stringify(out)); console.log(`tenders.json written: ${out.items.length} notices`, JSON.stringify(out.sources)); }
  else console.log('No change in notices; tenders.json kept as is.');
}
