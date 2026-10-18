const $ = (s) => document.querySelector(s);
const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || '#888';
const rnd = (n) => Math.floor(Math.random() * n);
const fmtT = (ms) => { const s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
let SAVE = {}; // best scores, kept in the app's data folder
const save = async () => { try { await sreeos.fs.write('best.json', JSON.stringify(SAVE)); } catch {} };
const load = async () => { try { SAVE = JSON.parse(await sreeos.fs.readText('best.json')) || {}; } catch { SAVE = {}; } };

const W = 480, H = 320, PH = 60, PWID = 10, R = 7;
const SPD = { Easy: 2.6, Normal: 3.8, Hard: 5.4 };
let cv, ctx, py, ay, ball, ps, as, state, keys = {}, mouseY = null, streak;
function serve(dir) { ball = { x: W / 2, y: H / 2, vx: 4 * dir, vy: (Math.random() - 0.5) * 4 }; }
function start() {
  py = ay = H / 2 - PH / 2; ps = as = 0; state = 'ready'; serve(Math.random() < 0.5 ? 1 : -1);
  $('#msg').textContent = 'W/S, arrows or mouse move. Space/click to serve. First to 7.'; info();
}
function info() { $('#info').textContent = `You ${ps} : ${as} AI`; $('#best').textContent = `Wins: ${SAVE.wins || 0}  Streak: ${SAVE.streak || 0}`; }
function update() {
  if (keys.ArrowUp || keys.w) py -= 6; if (keys.ArrowDown || keys.s) py += 6;
  if (mouseY !== null) py = mouseY - PH / 2;
  py = Math.max(0, Math.min(H - PH, py));
  if (state !== 'play') return;
  const sp = SPD[$('#level').value], c = ay + PH / 2;
  if (ball.vx > 0 || $('#level').value === 'Hard') { const dy = ball.y - c; if (Math.abs(dy) > 8) ay += Math.sign(dy) * Math.min(sp, Math.abs(dy)); }
  ay = Math.max(0, Math.min(H - PH, ay));
  ball.x += ball.vx; ball.y += ball.vy;
  if (ball.y < R || ball.y > H - R) { ball.vy *= -1; ball.y = Math.max(R, Math.min(H - R, ball.y)); }
  const hit = (px, py2, dir) => {
    if (ball.vx * dir > 0 && Math.abs(ball.x - px) < PWID / 2 + R && ball.y > py2 - R && ball.y < py2 + PH + R) {
      const t = (ball.y - (py2 + PH / 2)) / (PH / 2), s = Math.min(11, Math.hypot(ball.vx, ball.vy) * 1.06);
      ball.vx = -dir * s * Math.cos(t * 0.9); ball.vy = s * Math.sin(t * 0.9);
    }
  };
  hit(20, py, -1); hit(W - 20, ay, 1);
  if (ball.x < -R) point(false); else if (ball.x > W + R) point(true);
}
function point(me) {
  if (me) ps++; else as++;
  info(); state = 'ready'; serve(me ? -1 : 1);
  if (ps >= 7 || as >= 7) {
    state = 'over';
    if (ps >= 7) { SAVE.wins = (SAVE.wins || 0) + 1; SAVE.streak = (SAVE.streak || 0) + 1; $('#msg').textContent = 'You win! Press New game.'; }
    else { SAVE.streak = 0; $('#msg').textContent = 'AI wins. Press New game.'; }
    save(); info();
  }
}
function draw() {
  ctx.fillStyle = css('--panel'); ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = css('--line'); ctx.setLineDash([6, 8]); ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = css('--accent'); ctx.fillRect(20 - PWID / 2, py, PWID, PH);
  ctx.fillStyle = css('--danger'); ctx.fillRect(W - 20 - PWID / 2, ay, PWID, PH);
  ctx.fillStyle = css('--text'); ctx.beginPath(); ctx.arc(ball.x, ball.y, R, 0, 7); ctx.fill();
}
function loop() { update(); draw(); requestAnimationFrame(loop); }
function go() { if (state === 'ready') { state = 'play'; $('#msg').textContent = ''; } }
function init() {
  cv = document.createElement('canvas'); cv.width = W; cv.height = H; $('#stage').appendChild(cv); ctx = cv.getContext('2d');
  const st = $('#stage');
  st.addEventListener('keydown', (e) => { const k = e.key.length === 1 ? e.key.toLowerCase() : e.key; if (k === ' ') { e.preventDefault(); go(); } if (['ArrowUp', 'ArrowDown', 'w', 's'].includes(k)) { e.preventDefault(); keys[k] = true; mouseY = null; } });
  st.addEventListener('keyup', (e) => { keys[e.key.length === 1 ? e.key.toLowerCase() : e.key] = false; });
  st.addEventListener('blur', () => { keys = {}; });
  const mv = (e) => { const r = cv.getBoundingClientRect(); mouseY = (e.clientY - r.top) * (H / r.height); };
  cv.addEventListener('pointermove', mv);
  cv.addEventListener('pointerdown', (e) => { st.focus(); mv(e); go(); });
  $('#restart').onclick = () => { start(); st.focus(); };
  start(); st.focus(); loop();
}
load().then(init);
