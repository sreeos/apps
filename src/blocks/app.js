const $ = (s) => document.querySelector(s);
const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || '#888';
const rnd = (n) => Math.floor(Math.random() * n);
const fmtT = (ms) => { const s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
let SAVE = {}; // best scores, kept in the app's data folder
const save = async () => { try { await sreeos.fs.write('best.json', JSON.stringify(SAVE)); } catch {} };
const load = async () => { try { SAVE = JSON.parse(await sreeos.fs.readText('best.json')) || {}; } catch { SAVE = {}; } };

const COLS = 10, ROWS = 20, S = 26;
const SHAPES = { I: [[0,1],[1,1],[2,1],[3,1]], O: [[1,0],[2,0],[1,1],[2,1]], T: [[1,0],[0,1],[1,1],[2,1]], S: [[1,0],[2,0],[0,1],[1,1]], Z: [[0,0],[1,0],[1,1],[2,1]], J: [[0,0],[0,1],[1,1],[2,1]], L: [[2,0],[0,1],[1,1],[2,1]] };
const COLORS = { I: '#2cc', O: '#ec3', T: '#b5c', S: '#4b4', Z: '#d44', J: '#46d', L: '#e83' };
let cv, ctx, grid, cur, next, score, lines, level, over, paused, timer, bag = [];
function nextType() { if (!bag.length) bag = Object.keys(SHAPES).sort(() => Math.random() - 0.5); return bag.pop(); }
function mk(t) { return { t, c: SHAPES[t].map((p) => p.slice()), x: 3, y: 0 }; }
function fits(c, x, y) { return c.every(([cx, cy]) => { const gx = cx + x, gy = cy + y; return gx >= 0 && gx < COLS && gy < ROWS && (gy < 0 || !grid[gy][gx]); }); }
function rot(c, t) {
  if (t === 'O') return c;
  const n = t === 'I' ? 3 : 2; // pivot in a (n+1) box
  return c.map(([x, y]) => [n - y, x]);
}
function start() {
  grid = Array.from({ length: ROWS }, () => Array(COLS).fill('')); score = 0; lines = 0; level = 1; over = false; paused = false; bag = [];
  next = mk(nextType()); spawn(); $('#msg').textContent = 'Arrows move/rotate, Space drops, P pauses.';
  schedule(); draw(); info();
}
function spawn() { cur = next; next = mk(nextType()); if (!fits(cur.c, cur.x, cur.y)) { over = true; clearInterval(timer); $('#msg').textContent = 'Game over. Press New game.'; } }
function schedule() { clearInterval(timer); timer = setInterval(() => step(), Math.max(80, 700 - (level - 1) * 60)); }
function info() { $('#info').textContent = `Score ${score}  Lines ${lines}  Level ${level}`; $('#best').textContent = `Best: ${SAVE.best || 0}`; }
function step() { if (over || paused) return; if (fits(cur.c, cur.x, cur.y + 1)) cur.y++; else lock(); draw(); }
function lock() {
  cur.c.forEach(([cx, cy]) => { if (cy + cur.y >= 0) grid[cy + cur.y][cx + cur.x] = cur.t; });
  let n = 0;
  for (let y = ROWS - 1; y >= 0; y--) if (grid[y].every(Boolean)) { grid.splice(y, 1); grid.unshift(Array(COLS).fill('')); n++; y++; }
  if (n) { score += [0, 100, 300, 500, 800][n] * level; lines += n; const lv = 1 + Math.floor(lines / 10); if (lv !== level) { level = lv; schedule(); } }
  if (score > (SAVE.best || 0)) { SAVE.best = score; save(); }
  spawn(); info();
}
function act(a) {
  if (over || paused) return;
  if (a === 'l' && fits(cur.c, cur.x - 1, cur.y)) cur.x--;
  else if (a === 'r' && fits(cur.c, cur.x + 1, cur.y)) cur.x++;
  else if (a === 'd') { if (fits(cur.c, cur.x, cur.y + 1)) { cur.y++; score++; info(); } else lock(); }
  else if (a === 'u') { const r = rot(cur.c, cur.t); for (const k of [0, -1, 1, -2, 2]) if (fits(r, cur.x + k, cur.y)) { cur.c = r; cur.x += k; break; } }
  else if (a === 'h') { while (fits(cur.c, cur.x, cur.y + 1)) { cur.y++; score += 2; } lock(); }
  draw();
}
function cell(c, x, y, col, a = 1) { ctx.globalAlpha = a; ctx.fillStyle = col; ctx.fillRect(x * S + 1, y * S + 1, S - 2, S - 2); ctx.globalAlpha = 1; }
function draw() {
  ctx.fillStyle = css('--panel'); ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.strokeStyle = css('--line'); ctx.globalAlpha = 0.5; ctx.strokeRect(0, 0, COLS * S, ROWS * S); ctx.globalAlpha = 1;
  grid.forEach((row, y) => row.forEach((t, x) => { if (t) cell(ctx, x, y, COLORS[t]); }));
  if (!over) {
    let gy = cur.y; while (fits(cur.c, cur.x, gy + 1)) gy++;
    cur.c.forEach(([cx, cy]) => cell(ctx, cx + cur.x, cy + gy, COLORS[cur.t], 0.25));
    cur.c.forEach(([cx, cy]) => cell(ctx, cx + cur.x, cy + cur.y, COLORS[cur.t]));
  }
  ctx.fillStyle = css('--muted'); ctx.font = '13px sans-serif'; ctx.fillText('Next', COLS * S + 14, 20);
  next.c.forEach(([cx, cy]) => cell(ctx, cx + COLS + 0.5, cy + 1.2, COLORS[next.t]));
  if (paused) { ctx.fillStyle = css('--text'); ctx.font = '22px sans-serif'; ctx.fillText('Paused', 80, 240); }
}
function init() {
  cv = document.createElement('canvas'); cv.width = COLS * S + 100; cv.height = ROWS * S; $('#stage').appendChild(cv); ctx = cv.getContext('2d');
  const st = $('#stage');
  st.addEventListener('keydown', (e) => {
    const a = { ArrowLeft: 'l', ArrowRight: 'r', ArrowDown: 'd', ArrowUp: 'u', ' ': 'h', x: 'u', z: 'u' }[e.key];
    if (a) { e.preventDefault(); act(a); }
    else if (e.key === 'p' || e.key === 'P') { paused = !paused; draw(); }
  });
  [['◀', 'l'], ['⟳', 'u'], ['▶', 'r'], ['▼', 'd'], ['⤓', 'h']].forEach(([t, a]) => {
    const b = document.createElement('button'); b.textContent = t; b.setAttribute('aria-label', { l: 'Left', u: 'Rotate', r: 'Right', d: 'Down', h: 'Drop' }[a]);
    b.onclick = () => act(a); $('#ctl').appendChild(b);
  });
  $('#restart').onclick = () => { start(); st.focus(); };
  sreeos.on('theme', draw);
  start(); st.focus();
}
load().then(init);
