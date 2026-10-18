const $ = (id) => document.getElementById(id);
async function copy(text, btn) {
  try { await sreeos.clipboard.write(text); } catch { return; }
  if (btn) { const t = btn.dataset.t || (btn.dataset.t = btn.textContent); btn.textContent = 'Copied'; setTimeout(() => (btn.textContent = t), 900); }
}
const ALGOS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];
let bytes = new Uint8Array(0), mode = 'text', seq = 0;
const res = $('results');
const codes = {};
for (const a of ALGOS) {
  const d = document.createElement('div'); d.className = 'res';
  const b = document.createElement('b'); b.textContent = a;
  const c = document.createElement('code'); c.setAttribute('aria-label', a + ' digest');
  const btn = document.createElement('button'); btn.textContent = 'Copy';
  btn.onclick = () => copy(c.textContent, btn);
  d.append(b, c, btn); res.append(d); codes[a] = c;
}
async function update() {
  const my = ++seq;
  for (const a of ALGOS) {
    const h = new Uint8Array(await crypto.subtle.digest(a, bytes));
    if (my !== seq) return;
    let hex = Array.from(h, (x) => x.toString(16).padStart(2, '0')).join('');
    codes[a].textContent = $('upper').checked ? hex.toUpperCase() : hex;
  }
}
function setMode(m) {
  mode = m; $('mText').classList.toggle('on', m === 'text'); $('mFile').classList.toggle('on', m === 'file');
  $('textBox').hidden = m !== 'text'; $('fileBox').hidden = m !== 'file';
  bytes = m === 'text' ? new TextEncoder().encode($('in').value) : new Uint8Array(0);
  if (m === 'file') $('file').value = '';
  update();
}
$('mText').onclick = () => setMode('text');
$('mFile').onclick = () => setMode('file');
$('in').oninput = () => { bytes = new TextEncoder().encode($('in').value); update(); };
$('file').onchange = async () => { const f = $('file').files[0]; bytes = f ? new Uint8Array(await f.arrayBuffer()) : new Uint8Array(0); update(); };
$('upper').onchange = update;
update();
