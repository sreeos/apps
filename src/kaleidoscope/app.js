const $ = (id) => document.getElementById(id);
const c = $('c'), g = c.getContext('2d'), cx = c.width / 2, cy = c.height / 2;
let last = null, hue = 0;
g.lineCap = 'round';
function pos(e) { const r = c.getBoundingClientRect(); return [(e.clientX - r.left) * c.width / r.width - cx, (e.clientY - r.top) * c.height / r.height - cy]; }
function seg(a, b) {
  const n = +$('n').value, m = $('mirror').checked;
  g.strokeStyle = $('rainbow').checked ? `hsl(${hue}, 90%, 60%)` : $('color').value; g.lineWidth = +$('size').value;
  for (let i = 0; i < n; i++) {
    g.save(); g.translate(cx, cy); g.rotate(i * 2 * Math.PI / n);
    for (const flip of m ? [1, -1] : [1]) {
      g.save(); g.scale(1, flip); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); g.restore();
    }
    g.restore();
  }
}
c.onpointerdown = (e) => { last = pos(e); c.setPointerCapture(e.pointerId); seg(last, [last[0] + 0.1, last[1]]); };
c.onpointermove = (e) => { if (!last) return; const p = pos(e); seg(last, p); last = p; hue = (hue + 2) % 360; };
c.onpointerup = c.onpointercancel = () => { last = null; };
$('clear').onclick = () => g.clearRect(0, 0, c.width, c.height);
$('n').oninput = (e) => { $('no').textContent = e.target.value; };
