const $ = (s) => document.querySelector(s);
const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || '#888';
const rnd = (n) => Math.floor(Math.random() * n);
const fmtT = (ms) => { const s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
let SAVE = {}; // best scores, kept in the app's data folder
const save = async () => { try { await sreeos.fs.write('best.json', JSON.stringify(SAVE)); } catch {} };
const load = async () => { try { SAVE = JSON.parse(await sreeos.fs.readText('best.json')) || {}; } catch { SAVE = {}; } };

const LV = { Easy: [9, 9, 10], Medium: [16, 16, 40], Hard: [20, 20, 70] };
let W, H, M, cells, mines, state, flags, t0, tick, flagMode, opened, btns = [];
const nb = (i) => { const x = i % W, y = (i / W) | 0, r = []; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { if ((dx || dy) && x + dx >= 0 && x + dx < W && y + dy >= 0 && y + dy < H) r.push((y + dy) * W + x + dx); } return r; };
function start() {
  [W, H, M] = LV[$('#level').value];
  const st = $('#stage'); st.innerHTML = ''; st.style.gridTemplateColumns = `repeat(${W}, 24px)`; btns = [];
  for (let i = 0; i < W * H; i++) {
    const b = document.createElement('button'); b.setAttribute('aria-label', 'Hidden cell');
    b.onclick = () => click(i); b.oncontextmenu = (e) => { e.preventDefault(); flag(i); };
    let lp; b.onpointerdown = () => { lp = setTimeout(() => { lp = 0; flag(i); b.dataset.lp = 1; }, 450); };
    b.onpointerup = b.onpointerleave = () => clearTimeout(lp);
    b.onclick = () => { if (b.dataset.lp) { delete b.dataset.lp; return; } click(i); };
    st.appendChild(b); btns.push(b);
  }
  mines = null; cells = Array(W * H).fill(0); state = Array(W * H).fill(0); // 0 hidden 1 open 2 flag
  flags = 0; opened = 0; t0 = 0; clearInterval(tick); over = false; info();
  $('#msg').textContent = 'Click to reveal. Right-click, long-press or Flag mode to flag. Click a number to chord.';
}
let over = false;
function info() {
  $('#info').textContent = `Mines: ${M - flags}  Time: ${t0 ? fmtT(Date.now() - t0) : '0:00'}`;
  const b = (SAVE.best || {})[$('#level').value]; $('#best').textContent = `Best: ${b ? fmtT(b) : '-'}`;
}
function place(safe) {
  const ban = new Set([safe, ...nb(safe)]); mines = new Set();
  while (mines.size < M) { const i = rnd(W * H); if (!ban.has(i)) mines.add(i); }
  cells = cells.map((_, i) => nb(i).filter((j) => mines.has(j)).length);
  t0 = Date.now(); tick = setInterval(info, 500);
}
function reveal(i) {
  const q = [i];
  while (q.length) {
    const k = q.pop(); if (state[k]) continue;
    state[k] = 1; opened++; paint(k);
    if (!cells[k]) nb(k).forEach((j) => { if (!state[j]) q.push(j); });
  }
}
function paint(i) {
  const b = btns[i];
  if (state[i] === 2) { b.textContent = '🚩'; b.setAttribute('aria-label', 'Flag'); }
  else if (state[i] === 1) {
    b.className = 'open'; b.textContent = cells[i] || ''; if (cells[i]) b.classList.add('n' + cells[i]); b.setAttribute('aria-label', cells[i] + ' mines nearby');
  } else { b.textContent = ''; b.setAttribute('aria-label', 'Hidden cell'); }
}
function flag(i) {
  if (over || state[i] === 1) return;
  state[i] = state[i] ? 0 : 2; flags += state[i] ? 1 : -1; paint(i); info();
}
function click(i) {
  if (over) return;
  if (flagMode && state[i] !== 1) return flag(i);
  if (state[i] === 2) return;
  if (!mines) place(i);
  if (state[i] === 1) { // chord
    const n = nb(i); if (n.filter((j) => state[j] === 2).length !== cells[i]) return;
    n.forEach((j) => { if (state[j] === 0) hit(j); }); return finish();
  }
  hit(i); finish();
}
function hit(j) { if (over) return; if (mines.has(j)) lose(j); else reveal(j); }
function lose(j) {
  over = true; clearInterval(tick);
  mines.forEach((m) => { btns[m].textContent = '💣'; if (state[m] !== 2) btns[m].classList.add('open'); });
  btns[j].className = 'mine'; btns[j].textContent = '💥';
  $('#msg').textContent = 'Boom! Press New game.';
}
function finish() {
  if (over || opened < W * H - M) return;
  over = true; clearInterval(tick);
  const t = Date.now() - t0, lv = $('#level').value;
  SAVE.best = SAVE.best || {};
  if (!SAVE.best[lv] || t < SAVE.best[lv]) { SAVE.best[lv] = t; save(); $('#msg').textContent = `Cleared in ${fmtT(t)}. New best!`; } else $('#msg').textContent = `Cleared in ${fmtT(t)}.`;
  mines.forEach((m) => { state[m] = 2; paint(m); }); info();
}
function init() {
  $('#restart').onclick = start; $('#level').onchange = start;
  $('#flag').onclick = () => { flagMode = !flagMode; $('#flag').textContent = 'Flag mode: ' + (flagMode ? 'on' : 'off'); };
  start();
}
load().then(init);
