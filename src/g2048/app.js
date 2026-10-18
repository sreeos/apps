const $ = (s) => document.querySelector(s);
const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || '#888';
const rnd = (n) => Math.floor(Math.random() * n);
const fmtT = (ms) => { const s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
let SAVE = {}; // best scores, kept in the app's data folder
const save = async () => { try { await sreeos.fs.write('best.json', JSON.stringify(SAVE)); } catch {} };
const load = async () => { try { SAVE = JSON.parse(await sreeos.fs.readText('best.json')) || {}; } catch { SAVE = {}; } };

let g, score, over, won, keepGoing;
const tiles = [];
function empty() { const r = []; g.forEach((v, i) => { if (!v) r.push(i); }); return r; }
function spawn() { const e = empty(); if (e.length) g[e[rnd(e.length)]] = Math.random() < 0.9 ? 2 : 4; }
function start() {
  g = Array(16).fill(0); score = 0; over = false; won = false; keepGoing = false; spawn(); spawn();
  $('#msg').textContent = 'Arrow keys / WASD / swipe to slide tiles.'; render();
}
function slide(line) {
  const a = line.filter(Boolean), out = []; let gain = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] === a[i + 1]) { out.push(a[i] * 2); gain += a[i] * 2; i++; } else out.push(a[i]);
  }
  while (out.length < 4) out.push(0);
  return { out, gain };
}
function move(d) { // 0 left 1 up 2 right 3 down
  if (over) return;
  let moved = false;
  for (let k = 0; k < 4; k++) {
    const idx = [0, 1, 2, 3].map((j) => d === 0 ? k * 4 + j : d === 2 ? k * 4 + 3 - j : d === 1 ? j * 4 + k : (3 - j) * 4 + k);
    const { out, gain } = slide(idx.map((i) => g[i]));
    idx.forEach((i, j) => { if (g[i] !== out[j]) moved = true; g[i] = out[j]; });
    score += gain;
  }
  if (!moved) return;
  spawn();
  if (score > (SAVE.best || 0)) { SAVE.best = score; save(); }
  if (!won && g.includes(2048)) { won = true; $('#msg').textContent = 'You made 2048! Keep going for a higher score.'; }
  if (!empty().length && !canMove()) { over = true; $('#msg').textContent = 'No more moves. Press New game.'; }
  render();
}
function canMove() {
  for (let i = 0; i < 16; i++) { const x = i % 4, y = (i / 4) | 0; if ((x < 3 && g[i] === g[i + 1]) || (y < 3 && g[i] === g[i + 4])) return true; }
  return false;
}
function render() {
  g.forEach((v, i) => {
    const t = tiles[i]; t.textContent = v || '';
    t.className = 't' + (v >= 1024 ? ' huge' : v >= 128 ? ' big' : '');
    t.style.background = v ? `hsl(${Math.round(40 - Math.log2(v) * 3.5 + 0)}, ${Math.min(95, 40 + Math.log2(v) * 5)}%, ${Math.max(35, 82 - Math.log2(v) * 4)}%)` : '';
    t.style.color = v ? (v <= 4 ? '#444' : '#fff') : '';
    t.setAttribute('aria-label', v ? String(v) : 'empty');
  });
  $('#info').textContent = `Score: ${score}`; $('#best').textContent = `Best: ${SAVE.best || 0}`;
}
function init() {
  const st = $('#stage');
  for (let i = 0; i < 16; i++) { const t = document.createElement('div'); st.appendChild(t); tiles.push(t); }
  st.addEventListener('keydown', (e) => {
    const d = { arrowleft: 0, a: 0, arrowup: 1, w: 1, arrowright: 2, d: 2, arrowdown: 3, s: 3 }[e.key.toLowerCase()];
    if (d !== undefined) { e.preventDefault(); move(d); }
  });
  let sx, sy;
  st.addEventListener('pointerdown', (e) => { st.focus(); sx = e.clientX; sy = e.clientY; });
  st.addEventListener('pointerup', (e) => {
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
    move(Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 0 : 2) : (dy < 0 ? 1 : 3));
  });
  $('#restart').onclick = () => { start(); st.focus(); };
  start(); st.focus();
}
load().then(init);
