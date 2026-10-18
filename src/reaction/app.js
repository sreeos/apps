const $ = (s) => document.querySelector(s);
const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || '#888';
const rnd = (n) => Math.floor(Math.random() * n);
const fmtT = (ms) => { const s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
let SAVE = {}; // best scores, kept in the app's data folder
const save = async () => { try { await sreeos.fs.write('best.json', JSON.stringify(SAVE)); } catch {} };
const load = async () => { try { SAVE = JSON.parse(await sreeos.fs.readText('best.json')) || {}; } catch { SAVE = {}; } };

const ROUNDS = 5;
let state, t0, timer, times;
const set = (cls, text) => { const s = $('#stage'); s.className = cls; s.textContent = text; };
function info() { $('#info').textContent = `Round ${Math.min(times.length + 1, ROUNDS)}/${ROUNDS}`; const b = SAVE.best; $('#best').textContent = `Best: ${b ? b + ' ms' : '-'}`; $('#res').textContent = times.length ? 'Times: ' + times.map((t) => t + ' ms').join(', ') : ''; }
function start() { clearTimeout(timer); times = []; state = 'idle'; set('', 'Click (or press Space) to start'); $('#msg').textContent = ''; info(); }
function arm() { state = 'wait'; set('wait', 'Wait for green...'); timer = setTimeout(() => { state = 'go'; t0 = performance.now(); set('go', 'CLICK NOW!'); }, 1000 + Math.random() * 3000); }
function hit() {
  if (state === 'idle') return arm();
  if (state === 'wait') { clearTimeout(timer); state = 'early'; set('early', 'Too early! Click to retry.'); return; }
  if (state === 'early') return arm();
  if (state === 'go') {
    const t = Math.round(performance.now() - t0); times.push(t);
    if (!SAVE.best || t < SAVE.best) { SAVE.best = t; save(); }
    if (times.length >= ROUNDS) {
      state = 'done'; const avg = Math.round(times.reduce((a, b) => a + b, 0) / ROUNDS);
      set('', `Average: ${avg} ms`);
      if (!SAVE.avg || avg < SAVE.avg) { SAVE.avg = avg; save(); $('#msg').textContent = 'New best average!'; } else $('#msg').textContent = `Best average: ${SAVE.avg} ms. Press New game.`;
    } else { state = 'idle'; set('', `${t} ms. Click for next round.`); }
    info();
  }
}
function init() {
  const st = $('#stage');
  st.addEventListener('pointerdown', (e) => { e.preventDefault(); st.focus(); hit(); });
  st.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); hit(); } });
  $('#restart').onclick = () => { start(); st.focus(); };
  start(); st.focus();
}
load().then(init);
