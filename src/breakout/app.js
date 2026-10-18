const $ = (s) => document.querySelector(s);
const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || '#888';
const rnd = (n) => Math.floor(Math.random() * n);
const fmtT = (ms) => { const s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
let SAVE = {}; // best scores, kept in the app's data folder
const save = async () => { try { await sreeos.fs.write('best.json', JSON.stringify(SAVE)); } catch {} };
const load = async () => { try { SAVE = JSON.parse(await sreeos.fs.readText('best.json')) || {}; } catch { SAVE = {}; } };

const W = 400, H = 480, PW = 70, R = 7, BC = 8, BR = 6, BW = W / BC, BH = 20;
let cv, ctx, px, ball, bricks, score, lives, level, state, keys = {}, raf;
function layout() {
  bricks = []; for (let r = 0; r < BR; r++) for (let c = 0; c < BC; c++) bricks.push({ x: c * BW, y: 50 + r * BH, r, alive: true });
}
function reset() { px = W / 2 - PW / 2; ball = { x: W / 2, y: H - 40, vx: 0, vy: 0 }; state = 'ready'; }
function start() {
  score = 0; lives = 3; level = 1; layout(); reset(); $('#msg').textContent = 'Mouse / arrows move. Space or click launches.'; info();
}
function info() { $('#info').textContent = `Score ${score}  Lives ${lives}  Level ${level}`; $('#best').textContent = `Best: ${SAVE.best || 0}`; }
function launch() { if (state === 'ready') { const sp = 4.2 + level * 0.4; const a = -Math.PI / 2 + (Math.random() - 0.5) * 0.8; ball.vx = Math.cos(a) * sp; ball.vy = Math.sin(a) * sp; state = 'play'; $('#msg').textContent = ''; } }
function update() {
  if (keys.ArrowLeft) px -= 7; if (keys.ArrowRight) px += 7;
  px = Math.max(0, Math.min(W - PW, px));
  if (state === 'ready') { ball.x = px + PW / 2; ball.y = H - 40; }
  if (state !== 'play') return;
  ball.x += ball.vx; ball.y += ball.vy;
  if (ball.x < R) { ball.x = R; ball.vx *= -1; } if (ball.x > W - R) { ball.x = W - R; ball.vx *= -1; }
  if (ball.y < R) { ball.y = R; ball.vy *= -1; }
  if (ball.vy > 0 && ball.y + R >= H - 30 && ball.y - R <= H - 20 && ball.x >= px - R && ball.x <= px + PW + R) {
    const t = (ball.x - (px + PW / 2)) / (PW / 2), sp = Math.hypot(ball.vx, ball.vy) * 1.005, a = t * 1.1;
    ball.vx = Math.sin(a) * sp; ball.vy = -Math.cos(a) * sp; ball.y = H - 30 - R;
  }
  for (const b of bricks) if (b.alive && ball.x + R > b.x && ball.x - R < b.x + BW && ball.y + R > b.y && ball.y - R < b.y + BH) {
    b.alive = false; score += 10 * (BR - b.r);
    const ox = Math.min(ball.x + R - b.x, b.x + BW - (ball.x - R)), oy = Math.min(ball.y + R - b.y, b.y + BH - (ball.y - R));
    if (ox < oy) ball.vx *= -1; else ball.vy *= -1;
    if (score > (SAVE.best || 0)) { SAVE.best = score; save(); }
    info(); break;
  }
  if (!bricks.some((b) => b.alive)) { level++; layout(); reset(); info(); $('#msg').textContent = `Level ${level}! Launch when ready.`; }
  if (ball.y > H + R) {
    lives--; info();
    if (lives <= 0) { state = 'over'; $('#msg').textContent = 'Game over. Press New game.'; } else reset();
  }
}
function draw() {
  ctx.fillStyle = css('--panel'); ctx.fillRect(0, 0, W, H);
  bricks.forEach((b) => { if (b.alive) { ctx.fillStyle = `hsl(${b.r * 45},65%,55%)`; ctx.fillRect(b.x + 1, b.y + 1, BW - 2, BH - 2); } });
  ctx.fillStyle = css('--accent'); ctx.fillRect(px, H - 30, PW, 10);
  ctx.fillStyle = css('--text'); ctx.beginPath(); ctx.arc(ball.x, ball.y, R, 0, 7); ctx.fill();
}
function loop() { update(); draw(); raf = requestAnimationFrame(loop); }
function init() {
  cv = document.createElement('canvas'); cv.width = W; cv.height = H; $('#stage').appendChild(cv); ctx = cv.getContext('2d');
  const st = $('#stage');
  st.addEventListener('keydown', (e) => { if (e.key === ' ') { e.preventDefault(); launch(); } if (e.key.startsWith('Arrow')) { e.preventDefault(); keys[e.key] = true; } });
  st.addEventListener('keyup', (e) => { keys[e.key] = false; });
  st.addEventListener('blur', () => { keys = {}; });
  const move = (e) => { const r = cv.getBoundingClientRect(); px = (e.clientX - r.left) * (W / r.width) - PW / 2; };
  cv.addEventListener('pointermove', move);
  cv.addEventListener('pointerdown', (e) => { st.focus(); move(e); launch(); });
  $('#restart').onclick = () => { start(); st.focus(); };
  start(); st.focus(); loop();
}
load().then(init);
