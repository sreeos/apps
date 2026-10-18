const $ = (id) => document.getElementById(id);
const c = $('c'), g = c.getContext('2d');
const COLORS = ['#000000','#ffffff','#7f7f7f','#c3c3c3','#880015','#ed1c24','#ff7f27','#ffc90e','#fff200','#22b14c','#00a2e8','#3f48cc','#a349a4','#ffaec9','#b97a57','#99d9ea'];
let N = 16, cells, color = '#000000', tool = 'draw', down = false, hist = [];
const fresh = () => Array(N * N).fill(null);
cells = fresh();

COLORS.forEach((col) => {
  const b = document.createElement('button');
  b.className = 'sw'; b.style.background = col; b.setAttribute('aria-label', 'Color ' + col);
  b.onclick = () => { color = col; tool = tool === 'erase' ? 'draw' : tool; sync(); };
  $('pal').append(b);
});
function sync() {
  [...$('pal').children].forEach((b, i) => b.classList.toggle('on', COLORS[i] === color));
  ['draw', 'erase', 'fill'].forEach((t) => $(t).classList.toggle('on', t === tool));
}
function render() {
  const s = c.width / N;
  g.clearRect(0, 0, c.width, c.height);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const v = cells[y * N + x];
    g.fillStyle = v || ((x + y) % 2 ? '#e4e4e4' : '#f6f6f6'); g.fillRect(x * s, y * s, s, s);
  }
}
const snap = () => { hist.push(cells.slice()); if (hist.length > 50) hist.shift(); };
function flood(i, to) {
  const from = cells[i]; if (from === to) return;
  const st = [i];
  while (st.length) {
    const k = st.pop(); if (cells[k] !== from) continue;
    cells[k] = to; const x = k % N;
    if (x > 0) st.push(k - 1); if (x < N - 1) st.push(k + 1);
    if (k >= N) st.push(k - N); if (k < N * N - N) st.push(k + N);
  }
}
function apply(e) {
  const r = c.getBoundingClientRect();
  const x = Math.floor((e.clientX - r.left) / r.width * N), y = Math.floor((e.clientY - r.top) / r.height * N);
  if (x < 0 || y < 0 || x >= N || y >= N) return;
  if (tool === 'fill') flood(y * N + x, color); else cells[y * N + x] = tool === 'erase' ? null : color;
  render();
}
c.onpointerdown = (e) => { snap(); down = true; c.setPointerCapture(e.pointerId); apply(e); if (tool === 'fill') down = false; };
c.onpointermove = (e) => { if (down) apply(e); };
c.onpointerup = c.onpointercancel = () => { down = false; };
$('draw').onclick = () => { tool = 'draw'; sync(); };
$('erase').onclick = () => { tool = 'erase'; sync(); };
$('fill').onclick = () => { tool = 'fill'; sync(); };
$('clear').onclick = () => { snap(); cells = fresh(); render(); };
$('undo').onclick = () => { const h = hist.pop(); if (h && h.length === cells.length) { cells = h; render(); } };
$('grid').onchange = (e) => { N = +e.target.value; cells = fresh(); hist = []; render(); };
$('save').onclick = () => {
  const s = +$('scale').value, o = document.createElement('canvas');
  o.width = o.height = N * s; const og = o.getContext('2d');
  cells.forEach((v, i) => { if (v) { og.fillStyle = v; og.fillRect(i % N * s, Math.floor(i / N) * s, s, s); } });
  o.toBlob(async (b) => {
    try { await sreeos.fs.write('~/Pictures/pixelart.png', new Uint8Array(await b.arrayBuffer())); $('msg').textContent = `Saved ${N * s}px PNG to ~/Pictures/pixelart.png`; }
    catch (err) { $('msg').textContent = 'Could not save: ' + err.message; }
  });
};
sync(); render();
