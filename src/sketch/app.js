const $ = (id) => document.getElementById(id);
const c = $('c'), g = c.getContext('2d');
let erasing = false, drawing = false, last = null, undo = [];
g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
g.lineCap = g.lineJoin = 'round';

const pos = (e) => { const r = c.getBoundingClientRect(); return { x: (e.clientX - r.left) * c.width / r.width, y: (e.clientY - r.top) * c.height / r.height }; };
function line(a, b) {
  g.strokeStyle = erasing ? '#fff' : $('color').value;
  g.lineWidth = +$('size').value;
  g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x + 0.01, b.y); g.stroke();
}
c.onpointerdown = (e) => {
  undo.push(g.getImageData(0, 0, c.width, c.height)); if (undo.length > 30) undo.shift();
  drawing = true; last = pos(e); c.setPointerCapture(e.pointerId); line(last, last);
};
c.onpointermove = (e) => { if (!drawing) return; const p = pos(e); line(last, p); last = p; };
c.onpointerup = c.onpointercancel = () => { drawing = false; };

function tool(er) { erasing = er; $('pen').classList.toggle('on', !er); $('eraser').classList.toggle('on', er); }
$('pen').onclick = () => tool(false);
$('eraser').onclick = () => tool(true);
$('size').oninput = (e) => { $('sizeo').textContent = e.target.value; };
$('undo').onclick = () => { const s = undo.pop(); if (s) g.putImageData(s, 0, 0); };
$('clear').onclick = () => { undo.push(g.getImageData(0, 0, c.width, c.height)); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); };
document.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); $('undo').click(); } });
$('save').onclick = () => c.toBlob(async (b) => {
  try { await sreeos.fs.write('~/Pictures/sketch.png', new Uint8Array(await b.arrayBuffer())); $('msg').textContent = 'Saved to ~/Pictures/sketch.png'; }
  catch (err) { $('msg').textContent = 'Could not save: ' + err.message; }
});
