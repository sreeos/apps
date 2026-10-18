const $ = (id) => document.getElementById(id);
async function copy(text, btn) {
  try { await sreeos.clipboard.write(text); } catch { return; }
  if (btn) { const t = btn.dataset.t || (btn.dataset.t = btn.textContent); btn.textContent = 'Copied'; setTimeout(() => (btn.textContent = t), 900); }
}
const inp = $('in'), msg = $('msg');
function sortKeys(v) {
  if (Array.isArray(v)) return v.map(sortKeys);
  if (v && typeof v === 'object') return Object.fromEntries(Object.keys(v).sort().map((k) => [k, sortKeys(v[k])]));
  return v;
}
function run(mode) {
  const src = inp.value.trim();
  if (!src) { msg.textContent = ''; return; }
  try {
    let v = JSON.parse(src);
    if (mode === 'sort') v = sortKeys(v);
    const ind = $('indent').value === 't' ? '\t' : Number($('indent').value);
    inp.value = mode === 'min' ? JSON.stringify(v) : JSON.stringify(v, null, ind);
    const t = Array.isArray(v) ? `array of ${v.length}` : v && typeof v === 'object' ? `object with ${Object.keys(v).length} keys` : typeof v;
    msg.style.color = 'var(--muted)';
    msg.textContent = `Valid JSON: ${t}, ${inp.value.length} characters`;
  } catch (e) {
    msg.style.color = '';
    let m = e.message;
    const p = /position (\d+)/.exec(m);
    if (p) { const before = src.slice(0, Number(p[1])).split('\n'); m += ` (line ${before.length}, column ${before[before.length - 1].length + 1})`; }
    msg.textContent = 'Invalid JSON: ' + m;
  }
}
$('fmt').onclick = () => run('fmt');
$('min').onclick = () => run('min');
$('sort').onclick = () => run('sort');
$('cp').onclick = (e) => copy(inp.value, e.target);
$('clr').onclick = () => { inp.value = ''; msg.textContent = ''; inp.focus(); };
$('indent').onchange = () => run('fmt');
