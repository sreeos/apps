const $ = (s) => document.querySelector(s);
const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || '#888';
const rnd = (n) => Math.floor(Math.random() * n);
const fmtT = (ms) => { const s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
let SAVE = {}; // best scores, kept in the app's data folder
const save = async () => { try { await sreeos.fs.write('best.json', JSON.stringify(SAVE)); } catch {} };
const load = async () => { try { SAVE = JSON.parse(await sreeos.fs.readText('best.json')) || {}; } catch { SAVE = {}; } };

const COLS = 56, ROWS = 36, S = 10;
const PATS = {
  'Glider': ['.#.', '..#', '###'], 'Blinker': ['###'],
  'Pulsar': ['..###...###..', '.............', '#....#.#....#', '#....#.#....#', '#....#.#....#', '..###...###..', '.............', '..###...###..', '#....#.#....#', '#....#.#....#', '#....#.#....#', '.............', '..###...###..'],
  'Lightweight spaceship': ['.####', '#...#', '....#', '#..#.'], 'R-pentomino': ['.##', '##.', '.#.'],
  'Gosper glider gun': ['........................#...........', '......................#.#...........', '............##......##............##', '...........#...#....##............##', '##........#.....#...##..............', '##........#...#.##....#.#...........', '..........#.....#.......#...........', '...........#...#....................', '............##......................'],
};
let g, cv, ctx, running = false, timer, gen = 0, peak = 0, drawing = null, lastTick = 0;
const idx = (x, y) => y * COLS + x;
function pop() { return g.reduce((a, b) => a + b, 0); }
function info() {
  const p = pop(); if (p > peak) peak = p;
  $('#info').textContent = `Generation ${gen}  Population ${p}`;
  if (peak > (SAVE.peak || 0)) { SAVE.peak = peak; }
  $('#best').textContent = `Peak population: ${SAVE.peak || 0}`;
}
function persist() { SAVE.cells = []; g.forEach((v, i) => { if (v) SAVE.cells.push(i); }); save(); }
function stepGen() {
  const n = new Uint8Array(COLS * ROWS);
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
    let c = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (dx || dy) c += g[idx((x + dx + COLS) % COLS, (y + dy + ROWS) % ROWS)];
    n[idx(x, y)] = c === 3 || (c === 2 && g[idx(x, y)]) ? 1 : 0;
  }
  g = n; gen++; info(); draw();
}
function draw() {
  ctx.fillStyle = css('--panel'); ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.strokeStyle = css('--line'); ctx.globalAlpha = 0.5; ctx.beginPath();
  for (let x = 0; x <= COLS; x++) { ctx.moveTo(x * S + .5, 0); ctx.lineTo(x * S + .5, ROWS * S); }
  for (let y = 0; y <= ROWS; y++) { ctx.moveTo(0, y * S + .5); ctx.lineTo(COLS * S, y * S + .5); }
  ctx.stroke(); ctx.globalAlpha = 1; ctx.fillStyle = css('--accent');
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (g[idx(x, y)]) ctx.fillRect(x * S + 1, y * S + 1, S - 1, S - 1);
}
function setRun(on) {
  running = on; $('#run').textContent = on ? 'Pause' : 'Run'; clearInterval(timer);
  if (on) timer = setInterval(stepGen, 1000 / $('#speed').value);
}
function cellAt(e) { const r = cv.getBoundingClientRect(); return [Math.floor((e.clientX - r.left) * (cv.width / r.width) / S), Math.floor((e.clientY - r.top) * (cv.height / r.height) / S)]; }
function paintAt(e) {
  const [x, y] = cellAt(e); if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return;
  g[idx(x, y)] = drawing; draw(); info();
}
function place() {
  const p = PATS[$('#pat').value], ox = Math.floor((COLS - p[0].length) / 2), oy = Math.floor((ROWS - p.length) / 2);
  p.forEach((row, y) => [...row].forEach((c, x) => { if (c === '#') g[idx(ox + x, oy + y)] = 1; }));
  draw(); info(); persist();
}
function init() {
  g = new Uint8Array(COLS * ROWS); (SAVE.cells || []).forEach((i) => { if (i < g.length) g[i] = 1; });
  cv = document.createElement('canvas'); cv.width = COLS * S + 1; cv.height = ROWS * S + 1; $('#stage').appendChild(cv); ctx = cv.getContext('2d');
  const st = $('#stage');
  cv.addEventListener('pointerdown', (e) => { st.focus(); cv.setPointerCapture(e.pointerId); const [x, y] = cellAt(e); drawing = g[idx(x, y)] ? 0 : 1; paintAt(e); });
  cv.addEventListener('pointermove', (e) => { if (drawing !== null) paintAt(e); });
  cv.addEventListener('pointerup', () => { if (drawing !== null) { drawing = null; persist(); } });
  st.addEventListener('keydown', (e) => { if (e.key === ' ') { e.preventDefault(); setRun(!running); } else if (e.key === 's' || e.key === 'ArrowRight') stepGen(); });
  $('#run').onclick = () => setRun(!running); $('#step').onclick = () => { setRun(false); stepGen(); };
  $('#speed').oninput = () => { if (running) setRun(true); };
  $('#rand').onclick = () => { g = g.map(() => (Math.random() < 0.25 ? 1 : 0)); gen = 0; peak = 0; draw(); info(); persist(); };
  $('#place').onclick = place;
  $('#restart').textContent = 'Clear';
  $('#restart').onclick = () => { setRun(false); g = new Uint8Array(COLS * ROWS); gen = 0; peak = 0; draw(); info(); persist(); };
  $('#msg').textContent = 'Click or drag to toggle cells. Space runs/pauses. The board wraps around and is saved.';
  sreeos.on('theme', draw);
  draw(); info();
}
load().then(init);
