const $ = (s) => document.querySelector(s);
const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || '#888';
const rnd = (n) => Math.floor(Math.random() * n);
const fmtT = (ms) => { const s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
let SAVE = {}; // best scores, kept in the app's data folder
const save = async () => { try { await sreeos.fs.write('best.json', JSON.stringify(SAVE)); } catch {} };
const load = async () => { try { SAVE = JSON.parse(await sreeos.fs.readText('best.json')) || {}; } catch { SAVE = {}; } };

const W = 320, H = 480, GAP = 130, PWID = 52, G = 0.32, FLAP = -6;
let cv, ctx, bird, pipes, score, state, frame, t = 0;
function start() { bird = { y: H / 2, v: 0 }; pipes = []; score = 0; state = 'ready'; frame = 0; $('#msg').textContent = 'Space, click or tap to flap.'; info(); }
function info() { $('#info').textContent = `Score: ${score}`; $('#best').textContent = `Best: ${SAVE.best || 0}`; }
function flap() {
  if (state === 'over') return;
  if (state === 'ready') { state = 'play'; $('#msg').textContent = ''; }
  bird.v = FLAP;
}
function die() {
  state = 'over'; $('#msg').textContent = `Game over. Score ${score}. Press New game.`;
  if (score > (SAVE.best || 0)) { SAVE.best = score; save(); info(); }
}
function update() {
  t++;
  if (state === 'ready') { bird.y = H / 2 + Math.sin(t / 10) * 8; return; }
  if (state === 'over') { if (bird.y < H - 30) { bird.v += G; bird.y += bird.v; } return; }
  bird.v += G; bird.y += bird.v; frame++;
  if (frame % 90 === 1) pipes.push({ x: W, top: 60 + rnd(H - GAP - 140), passed: false });
  pipes.forEach((p) => { p.x -= 2.2 + Math.min(1.5, score * 0.05); });
  pipes = pipes.filter((p) => p.x > -PWID);
  for (const p of pipes) {
    if (!p.passed && p.x + PWID < 80) { p.passed = true; score++; info(); }
    if (80 + 12 > p.x && 80 - 12 < p.x + PWID && (bird.y - 12 < p.top || bird.y + 12 > p.top + GAP)) die();
  }
  if (bird.y > H - 30 || bird.y < -20) die();
}
function draw() {
  ctx.fillStyle = css('--panel'); ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#4b8'; pipes.forEach((p) => { ctx.fillRect(p.x, 0, PWID, p.top); ctx.fillRect(p.x, p.top + GAP, PWID, H - p.top - GAP); });
  ctx.fillStyle = css('--line'); ctx.fillRect(0, H - 20, W, 20);
  ctx.save(); ctx.translate(80, bird.y); ctx.rotate(Math.max(-0.5, Math.min(1.2, bird.v / 10)));
  ctx.fillStyle = '#fc3'; ctx.beginPath(); ctx.arc(0, 0, 13, 0, 7); ctx.fill();
  ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(5, -4, 2.5, 0, 7); ctx.fill();
  ctx.fillStyle = '#e63'; ctx.fillRect(10, 0, 9, 5); ctx.restore();
  if (state !== 'ready') { ctx.fillStyle = css('--text'); ctx.font = 'bold 32px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(score, W / 2, 50); ctx.textAlign = 'left'; }
}
function loop() { update(); draw(); requestAnimationFrame(loop); }
function init() {
  cv = document.createElement('canvas'); cv.width = W; cv.height = H; $('#stage').appendChild(cv); ctx = cv.getContext('2d');
  const st = $('#stage');
  st.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'ArrowUp') { e.preventDefault(); flap(); } });
  cv.addEventListener('pointerdown', () => { st.focus(); flap(); });
  $('#restart').onclick = () => { start(); st.focus(); };
  start(); st.focus(); loop();
}
load().then(init);
