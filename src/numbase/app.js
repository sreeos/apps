const $ = (id) => document.getElementById(id);
async function copy(text, btn) {
  try { await sreeos.clipboard.write(text); } catch { return; }
  if (btn) { const t = btn.dataset.t || (btn.dataset.t = btn.textContent); btn.textContent = 'Copied'; setTimeout(() => (btn.textContent = t), 900); }
}
const BASES = { bin: 2, oct: 8, dec: 10, hex: 16 };
const DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz';
function parse(str, base) {
  str = str.trim().toLowerCase().replace(/[_\s]/g, '');
  if (!str) return null;
  let neg = false;
  if (str[0] === '-') { neg = true; str = str.slice(1); }
  if (base === 16) str = str.replace(/^0x/, ''); else if (base === 2) str = str.replace(/^0b/, ''); else if (base === 8) str = str.replace(/^0o/, '');
  if (!str) throw new Error('empty');
  let v = 0n; const B = BigInt(base);
  for (const c of str) { const d = DIGITS.indexOf(c); if (d < 0 || d >= base) throw new Error(`"${c}" is not a base-${base} digit`); v = v * B + BigInt(d); }
  return neg ? -v : v;
}
function fmt(v, base) { return v.toString(base); }
function setAll(v, except) {
  for (const [id, b] of Object.entries(BASES)) if (id !== except) $(id).value = fmt(v, b);
  const cb = Number($('cbase').value);
  if (except !== 'cust') $('cust').value = cb >= 2 && cb <= 36 ? fmt(v, cb) : '';
}
function from(id, base) {
  $('msg').textContent = '';
  try {
    const v = parse($(id).value, base);
    if (v === null) { for (const k of [...Object.keys(BASES), 'cust']) if (k !== id) $(k).value = ''; return; }
    setAll(v, id);
  } catch (e) { $('msg').textContent = e.message; }
}
for (const [id, b] of Object.entries(BASES)) $(id).oninput = () => from(id, b);
$('cust').oninput = () => { const b = Number($('cbase').value); if (b >= 2 && b <= 36) from('cust', b); else $('msg').textContent = 'Base must be 2-36'; };
$('cbase').oninput = () => { const b = Number($('cbase').value); if (!(b >= 2 && b <= 36)) { $('msg').textContent = 'Base must be 2-36'; return; } $('msg').textContent = ''; from('dec', 10); };
$('cp').onclick = (e) => copy($('hex').value, e.target);
from('dec', 10);
