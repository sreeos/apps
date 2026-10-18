const $ = (s) => document.querySelector(s);
const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || '#888';
const rnd = (n) => Math.floor(Math.random() * n);
const fmtT = (ms) => { const s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
let SAVE = {}; // best scores, kept in the app's data folder
const save = async () => { try { await sreeos.fs.write('best.json', JSON.stringify(SAVE)); } catch {} };
const load = async () => { try { SAVE = JSON.parse(await sreeos.fs.readText('best.json')) || {}; } catch { SAVE = {}; } };

const N = 18, C = 22;
let cv, ctx, snake, dir, nextDir, food, score, alive, paused, timer, started;
function place() { do { food = { x: rnd(N), y: rnd(N) }; } while (snake.some((s) => s.x === food.x && s.y === food.y)); }
function start() {
  snake = [{ x: 9, y: 9 }, { x: 8, y: 9 }, { x: 7, y: 9 }]; dir = nextDir = { x: 1, y: 0 };
  score = 0; alive = true; paused = false; started = false; place();
  $('#msg').textContent = 'Arrow keys / WASD / swipe to start. Space pauses.';
  clearInterval(timer); draw(); info();
}
function info() { $('#info').textContent = `Score: ${score}`; $('#best').textContent = `Best: ${SAVE.best || 0}`; }
function setDir(x, y) {
  if (!alive) return;
  if (x === -dir.x && y === -dir.y) return;
  nextDir = { x, y };
  if (!started) { started = true; $('#msg').textContent = ''; schedule(); }
}
function schedule() { clearInterval(timer); timer = setInterval(tick, Math.max(55, 140 - score * 3)); }
function tick() {
  if (paused || !alive) return;
  dir = nextDir;
  const h = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
  if (h.x < 0 || h.y < 0 || h.x >= N || h.y >= N || snake.some((s, i) => i < snake.length - 1 && s.x === h.x && s.y === h.y)) return die();
  snake.unshift(h);
  if (h.x === food.x && h.y === food.y) { score++; place(); schedule(); if (score > (SAVE.best || 0)) { SAVE.best = score; save(); } } else snake.pop();
  draw(); info();
}
function die() {
  alive = false; clearInterval(timer); draw();
  $('#msg').textContent = `Game over. Score ${score}. Press New game.`;
}
function draw() {
  ctx.fillStyle = css('--panel'); ctx.fillRect(0, 0, N * C, N * C);
  ctx.fillStyle = css('--danger'); ctx.beginPath(); ctx.arc(food.x * C + C / 2, food.y * C + C / 2, C / 2 - 3, 0, 7); ctx.fill();
  snake.forEach((s, i) => { ctx.fillStyle = i ? css('--accent') : css('--text'); ctx.globalAlpha = alive ? 1 : 0.5; ctx.fillRect(s.x * C + 1, s.y * C + 1, C - 2, C - 2); });
  ctx.globalAlpha = 1;
}
function init() {
  cv = document.createElement('canvas'); cv.width = cv.height = N * C; $('#stage').appendChild(cv); ctx = cv.getContext('2d');
  const st = $('#stage');
  st.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    const m = { arrowup: [0, -1], w: [0, -1], arrowdown: [0, 1], s: [0, 1], arrowleft: [-1, 0], a: [-1, 0], arrowright: [1, 0], d: [1, 0] }[k];
    if (m) { e.preventDefault(); setDir(...m); }
    else if (k === ' ') { e.preventDefault(); if (started && alive) { paused = !paused; $('#msg').textContent = paused ? 'Paused' : ''; } }
  });
  let sx, sy;
  cv.addEventListener('pointerdown', (e) => { st.focus(); sx = e.clientX; sy = e.clientY; });
  cv.addEventListener('pointerup', (e) => {
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 15) return;
    if (Math.abs(dx) > Math.abs(dy)) setDir(Math.sign(dx), 0); else setDir(0, Math.sign(dy));
  });
  $('#restart').onclick = () => { start(); st.focus(); };
  sreeos.on('theme', draw);
  start(); st.focus();
}
load().then(init);
