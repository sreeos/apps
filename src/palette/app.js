const $ = (id) => document.getElementById(id);
let cols = [], locked = [];
const wrap = (h) => ((h % 360) + 360) % 360;
function hsl2hex(h, s, l) {
  s /= 100; l /= 100; const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
  const f = (n) => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))));
  return '#' + [f(0), f(8), f(4)].map((v) => v.toString(16).padStart(2, '0')).join('');
}
const r = (a, b) => a + Math.random() * (b - a);
function make(mode) {
  const h = r(0, 360), offs = { random: null, analogous: [-40, -20, 0, 20, 40], complementary: [0, 15, 180, 195, 165], triadic: [0, 120, 240, 20, 140], tetradic: [0, 90, 180, 270, 45], mono: [0, 0, 0, 0, 0] }[mode];
  return Array.from({ length: 5 }, (_, i) => offs ? hsl2hex(wrap(h + offs[i]), mode === 'mono' ? 55 : r(45, 85), mode === 'mono' ? 20 + i * 15 : r(35, 70)) : hsl2hex(r(0, 360), r(40, 90), r(30, 75)));
}
function gen() {
  const n = make($('mode').value); cols = cols.length ? cols.map((c, i) => (locked[i] ? c : n[i])) : n; draw();
}
const lum = (hex) => { const v = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)); return 0.299 * v[0] + 0.587 * v[1] + 0.114 * v[2]; };
function draw() {
  $('sw').replaceChildren(...cols.map((c, i) => {
    const d = document.createElement('div'); d.className = 'sw'; d.style.background = c; d.style.color = lum(c) > 150 ? '#111' : '#fff';
    const lk = document.createElement('button'); lk.className = 'lock'; lk.textContent = locked[i] ? 'Locked' : 'Lock'; lk.setAttribute('aria-pressed', !!locked[i]);
    lk.onclick = () => { locked[i] = !locked[i]; draw(); };
    const cp = document.createElement('button'); cp.textContent = c.toUpperCase(); cp.setAttribute('aria-label', 'Copy ' + c);
    cp.onclick = async () => {
      try { await sreeos.clipboard.write(c); $('msg').textContent = 'Copied ' + c; }
      catch { const s = getSelection(), g = document.createRange(); g.selectNodeContents(cp); s.removeAllRanges(); s.addRange(g); $('msg').textContent = 'Selected ' + c + ' - press Ctrl+C'; }
    };
    d.append(lk, cp); return d;
  }));
}
$('gen').onclick = gen; $('mode').onchange = gen;
document.addEventListener('keydown', (e) => { if (e.code === 'Space' && !['SELECT', 'BUTTON'].includes(e.target.tagName)) { e.preventDefault(); gen(); } });
gen();
