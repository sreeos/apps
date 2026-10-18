const $ = (id) => document.getElementById(id);
const c = $('c'), g = c.getContext('2d'), W = c.width, H = c.height;
const home = { x: -0.6, y: 0, w: 3.4 };
let v = { ...home };
function color(i, max, pal) {
  if (i >= max) return [0, 0, 0];
  const t = i / max, h = (i * 7) % 360;
  if (pal === 0) return [255 * Math.min(1, t * 3), 255 * Math.max(0, Math.min(1, t * 3 - 1)), 255 * Math.max(0, t * 3 - 2)].map((x) => Math.min(255, x * 1.2 + 20));
  if (pal === 1) return [20 + 60 * t, 80 + 175 * Math.sqrt(t), 140 + 115 * Math.sqrt(t)];
  if (pal === 3) return [255 * Math.sqrt(t), 255 * Math.sqrt(t), 255 * Math.sqrt(t)];
  const f = (n) => { const k = (n + h / 30) % 12; return 255 * (0.5 - 0.5 * Math.max(-1, Math.min(k - 3, 9 - k, 1))); };
  return [f(0), f(8), f(4)];
}
function render() {
  const max = +$('it').value, pal = +$('pal').value, img = g.createImageData(W, H), h = v.w * H / W;
  const lut = Array.from({ length: max + 1 }, (_, i) => color(i, max, pal));
  for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) {
    const cr = v.x - v.w / 2 + px / W * v.w, ci = v.y - h / 2 + py / H * h;
    let zr = 0, zi = 0, i = 0, a = 0, b = 0;
    while (i < max && a + b <= 4) { zi = 2 * zr * zi + ci; zr = a - b + cr; a = zr * zr; b = zi * zi; i++; }
    const o = (py * W + px) * 4, k = lut[i]; img.data[o] = k[0]; img.data[o + 1] = k[1]; img.data[o + 2] = k[2]; img.data[o + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  $('info').textContent = `center ${v.x.toPrecision(8)} ${v.y >= 0 ? '+' : '-'} ${Math.abs(v.y).toPrecision(8)}i, zoom ${(home.w / v.w).toFixed(1)}x`;
}
function at(e) { const r = c.getBoundingClientRect(); return [v.x - v.w / 2 + (e.clientX - r.left) / r.width * v.w, v.y - v.w * H / W / 2 + (e.clientY - r.top) / r.height * v.w * H / W]; }
c.onclick = (e) => { [v.x, v.y] = at(e); v.w /= 2.5; render(); };
$('out').onclick = () => { v.w *= 2.5; render(); };
$('reset').onclick = () => { v = { ...home }; render(); };
$('it').oninput = (e) => { $('ito').textContent = e.target.value; };
$('it').onchange = $('pal').onchange = render;
render();
