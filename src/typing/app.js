const $ = (s) => document.querySelector(s);
const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || '#888';
const rnd = (n) => Math.floor(Math.random() * n);
const fmtT = (ms) => { const s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
let SAVE = {}; // best scores, kept in the app's data folder
const save = async () => { try { await sreeos.fs.write('best.json', JSON.stringify(SAVE)); } catch {} };
const load = async () => { try { SAVE = JSON.parse(await sreeos.fs.readText('best.json')) || {}; } catch { SAVE = {}; } };

const W = 'the be to of and a in that have it for not on with he as you do at this but his by from they we say her she or an will my one all would there their what so up out if about who get which go me when make can like time no just him know take people into year your good some could them see other than then now look only come its over think also back after use two how our work first well way even new want because any these give day most us'.split(' ');
let text, typed, t0, tick, over, secs, spans = [], errors;
function start() {
  secs = parseInt($('#secs').value); text = ''; while (text.length < 600) text += W[rnd(W.length)] + ' '; text = text.trim();
  typed = ''; t0 = 0; over = false; errors = 0; clearInterval(tick);
  const st = $('#stage'); st.innerHTML = ''; spans = [];
  for (const c of text) { const s = document.createElement('span'); s.textContent = c; s.className = 'todo'; st.appendChild(s); spans.push(s); }
  st.scrollTop = 0; paint(); info(); $('#msg').textContent = 'Start typing to begin. Backspace fixes mistakes.';
}
function stats() {
  const mins = Math.max((Date.now() - t0) / 60000, 1 / 600), ok = [...typed].filter((c, i) => c === text[i]).length;
  return { wpm: Math.round(ok / 5 / mins), acc: typed.length ? Math.round(100 * (typed.length - errors) / typed.length) : 100 };
}
function info() {
  if (!t0) { $('#info').textContent = `Time: ${secs}s`; }
  else { const left = Math.max(0, secs - Math.floor((Date.now() - t0) / 1000)), s = stats(); $('#info').textContent = `Time: ${left}s  WPM: ${s.wpm}  Acc: ${s.acc}%`; }
  $('#best').textContent = `Best (${secs}s): ${(SAVE.best || {})[secs] || '-'} WPM`;
}
function paint() {
  spans.forEach((s, i) => { s.className = i < typed.length ? (typed[i] === text[i] ? 'ok' : 'bad') : i === typed.length ? 'todo cur' : 'todo'; });
  const cur = spans[typed.length]; if (cur) { const st = $('#stage'); st.scrollTop = Math.max(0, cur.offsetTop - 80); }
}
function finish() {
  over = true; clearInterval(tick); const s = stats();
  SAVE.best = SAVE.best || {}; const nb = s.wpm > (SAVE.best[secs] || 0); if (nb) { SAVE.best[secs] = s.wpm; save(); }
  $('#info').textContent = `Done! ${s.wpm} WPM, ${s.acc}% accuracy`; $('#best').textContent = `Best (${secs}s): ${SAVE.best[secs] || '-'} WPM`;
  $('#msg').textContent = (nb ? 'New best! ' : '') + 'Press New game to try again.';
}
function init() {
  const st = $('#stage');
  st.addEventListener('keydown', (e) => {
    if (over || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Backspace') { e.preventDefault(); typed = typed.slice(0, -1); paint(); return; }
    if (e.key.length !== 1) return;
    e.preventDefault();
    if (!t0) { t0 = Date.now(); tick = setInterval(() => { info(); if (Date.now() - t0 >= secs * 1000) finish(); }, 250); $('#msg').textContent = ''; }
    if (e.key !== text[typed.length]) errors++;
    typed += e.key; paint(); if (typed.length >= text.length) finish();
  });
  $('#restart').onclick = () => { start(); st.focus(); }; $('#secs').onchange = () => { start(); st.focus(); };
  start(); st.focus();
}
load().then(init);
