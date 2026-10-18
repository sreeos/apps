const $ = (id) => document.getElementById(id);
const c = $('c'), g = c.getContext('2d'), cx = c.width / 2, cy = c.height / 2;
let t = 0, prev = null, play = true, hue = 0;
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const p = () => ({ R: +$('R').value, r: +$('r').value, d: +$('d').value });
const pt = (t, { R, r, d }) => [cx + (R - r) * Math.cos(t) + d * Math.cos((R - r) / r * t), cy + (R - r) * Math.sin(t) - d * Math.sin((R - r) / r * t)];
function labels() { document.querySelectorAll('.grid label').forEach((l) => { l.lastChild.textContent = l.querySelector('input').value; }); }
function restart() { t = 0; prev = null; hue = 0; g.clearRect(0, 0, c.width, c.height); labels(); }
const turns = () => { const { R, r } = p(); return r / gcd(R, r) * 2 * Math.PI; }; // curve closes after this angle
function frame() {
  if (play && t < turns()) {
    const q = p(), steps = +$('sp').value;
    for (let i = 0; i < steps && t < turns(); i++) {
      t += 0.03; const pos = pt(t, q);
      if (prev) { g.strokeStyle = `hsl(${hue}, 80%, 60%)`; g.beginPath(); g.moveTo(prev[0], prev[1]); g.lineTo(pos[0], pos[1]); g.stroke(); }
      prev = pos; hue = (hue + 0.4) % 360;
    }
  }
  requestAnimationFrame(frame);
}
g.lineWidth = 1.2;
document.querySelectorAll('.grid input').forEach((i) => i.addEventListener('input', () => { if (i.id !== 'sp') restart(); else labels(); }));
$('go').onclick = () => { play = !play; $('go').textContent = play ? 'Pause' : 'Resume'; };
$('clear').onclick = restart;
$('rand').onclick = () => { $('R').value = 60 + Math.floor(Math.random() * 90); $('r').value = 10 + Math.floor(Math.random() * 100); $('d').value = 20 + Math.floor(Math.random() * 120); restart(); };
restart(); frame();
