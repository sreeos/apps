const $ = (id) => document.getElementById(id);
const h = (t, p = {}, ...c) => { const e = document.createElement(t); for (const k in p) k.startsWith("aria-") ? e.setAttribute(k, p[k]) : (e[k] = p[k]); e.append(...c); return e; };
const load = (f, d) => sreeos.fs.readText(f).then(JSON.parse, () => d);
const save = (f, d) => sreeos.fs.write(f, JSON.stringify(d));
const today = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
let running = false, elapsed = 0, last = 0, iv;
const fmt = (n) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const perSec = () => Math.max(0, +$('n').value) * Math.max(0, +$('r').value) / 3600;
function draw() {
  const t = Math.floor(elapsed / 1000), p = (x) => String(x).padStart(2, '0');
  $('cost').textContent = fmt(elapsed / 1000 * perSec());
  $('time').textContent = p(Math.floor(t / 3600)) + ':' + p(Math.floor(t / 60) % 60) + ':' + p(t % 60);
  $('rate').textContent = fmt(perSec() * 60) + ' per minute';
  sreeos.setTitle('Meeting Cost — ' + $('cost').textContent);
}
function tick() { const now = Date.now(); elapsed += now - last; last = now; draw(); }
$('go').onclick = () => {
  running = !running;
  $('go').textContent = running ? 'Pause' : 'Resume';
  clearInterval(iv);
  if (running) { last = Date.now(); iv = setInterval(tick, 200); }
};
$('reset').onclick = () => { running = false; elapsed = 0; clearInterval(iv); $('go').textContent = 'Start'; draw(); };
$('f').oninput = draw;
$('f').onsubmit = (e) => e.preventDefault();
draw();
