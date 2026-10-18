const $ = (s) => document.querySelector(s);
const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || '#888';
const rnd = (n) => Math.floor(Math.random() * n);
const fmtT = (ms) => { const s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
let SAVE = {}; // best scores, kept in the app's data folder
const save = async () => { try { await sreeos.fs.write('best.json', JSON.stringify(SAVE)); } catch {} };
const load = async () => { try { SAVE = JSON.parse(await sreeos.fs.readText('best.json')) || {}; } catch { SAVE = {}; } };

const SZ = { Small: 15, Medium: 25, Large: 35 };
let n, cell, walls, px, py, trail, t0, tick, done, cv, ctx, started;
function gen() { // iterative DFS; walls[y][x] = [top,right,bottom,left]
  walls = Array.from({ length: n }, () => Array.from({ length: n }, () => [1, 1, 1, 1]));
  const seen = Array.from({ length: n }, () => Array(n).fill(false)), st = [[0, 0]]; seen[0][0] = true;
  const D = [[0, -1, 0, 2], [1, 0, 1, 3], [0, 1, 2, 0], [-1, 0, 3, 1]];
  while (st.length) {
    const [x, y] = st[st.length - 1];
    const opts = D.filter(([dx, dy]) => x + dx >= 0 && y + dy >= 0 && x + dx < n && y + dy < n && !seen[y + dy][x + dx]);
    if (!opts.length) { st.pop(); continue; }
    const [dx, dy, a, b] = opts[rnd(opts.length)];
    walls[y][x][a] = 0; walls[y + dy][x + dx][b] = 0; seen[y + dy][x + dx] = true; st.push([x + dx, y + dy]);
  }
}
function start() {
  n = SZ[$('#size').value]; cell = Math.floor(480 / n); gen(); px = py = 0; trail = new Set(['0,0']); t0 = 0; done = false; started = false; clearInterval(tick);
  cv.width = cv.height = cell * n; $('#msg').textContent = 'Arrow keys / WASD move. Reach the green square.'; info(); draw();
}
function info() {
  $('#info').textContent = `Time: ${t0 ? fmtT((done || Date.now()) - t0) : '0:00'}`;
  const b = (SAVE.best || {})[$('#size').value]; $('#best').textContent = `Best: ${b ? fmtT(b) : '-'}`;
}
function move(dir) {
  if (done) return;
  if (walls[py][px][dir]) return;
  if (!t0) { t0 = Date.now(); tick = setInterval(info, 500); }
  px += [0, 1, 0, -1][dir]; py += [-1, 0, 1, 0][dir]; trail.add(px + ',' + py);
  if (px === n - 1 && py === n - 1) {
    done = Date.now(); clearInterval(tick); const t = done - t0, k = $('#size').value; SAVE.best = SAVE.best || {};
    const nb = !SAVE.best[k] || t < SAVE.best[k]; if (nb) { SAVE.best[k] = t; save(); }
    $('#msg').textContent = `Escaped in ${fmtT(t)}!` + (nb ? ' New best!' : ''); info();
  }
  draw();
}
function draw() {
  ctx.fillStyle = css('--panel'); ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.fillStyle = css('--accent'); ctx.globalAlpha = 0.25; trail.forEach((k) => { const [x, y] = k.split(',').map(Number); ctx.fillRect(x * cell, y * cell, cell, cell); }); ctx.globalAlpha = 1;
  ctx.fillStyle = '#2eaa4a'; ctx.fillRect((n - 1) * cell + 2, (n - 1) * cell + 2, cell - 4, cell - 4);
  ctx.strokeStyle = css('--text'); ctx.lineWidth = 2; ctx.beginPath();
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const w = walls[y][x], X = x * cell, Y = y * cell;
    if (w[0]) { ctx.moveTo(X, Y); ctx.lineTo(X + cell, Y); } if (w[1]) { ctx.moveTo(X + cell, Y); ctx.lineTo(X + cell, Y + cell); }
    if (w[2]) { ctx.moveTo(X, Y + cell); ctx.lineTo(X + cell, Y + cell); } if (w[3]) { ctx.moveTo(X, Y); ctx.lineTo(X, Y + cell); }
  }
  ctx.stroke();
  ctx.fillStyle = css('--danger'); ctx.beginPath(); ctx.arc(px * cell + cell / 2, py * cell + cell / 2, cell * 0.3, 0, 7); ctx.fill();
}
function init() {
  cv = document.createElement('canvas'); $('#stage').appendChild(cv); ctx = cv.getContext('2d');
  const st = $('#stage');
  st.addEventListener('keydown', (e) => {
    const d = { ArrowUp: 0, w: 0, ArrowRight: 1, d: 1, ArrowDown: 2, s: 2, ArrowLeft: 3, a: 3 }[e.key];
    if (d !== undefined) { e.preventDefault(); move(d); }
  });
  let sx, sy;
  cv.addEventListener('pointerdown', (e) => { st.focus(); sx = e.clientX; sy = e.clientY; });
  cv.addEventListener('pointerup', (e) => {
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 15) return;
    move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0));
  });
  $('#restart').onclick = () => { start(); st.focus(); }; $('#size').onchange = () => { start(); st.focus(); };
  sreeos.on('theme', draw);
  start(); st.focus();
}
load().then(init);
