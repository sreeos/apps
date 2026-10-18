const $ = (id) => document.getElementById(id);
async function copy(text, btn) {
  try { await sreeos.clipboard.write(text); } catch { return; }
  if (btn) { const t = btn.dataset.t || (btn.dataset.t = btn.textContent); btn.textContent = 'Copied'; setTimeout(() => (btn.textContent = t), 900); }
}
function v4() {
  if (crypto.randomUUID) return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
function gen() {
  const n = Math.max(1, Math.min(500, Math.floor(Number($('count').value)) || 1));
  let list = Array.from({ length: n }, v4);
  if ($('nodash').checked) list = list.map((u) => u.replace(/-/g, ''));
  if ($('upper').checked) list = list.map((u) => u.toUpperCase());
  $('out').value = list.join('\n');
}
$('gen').onclick = gen;
$('cp').onclick = (e) => copy($('out').value, e.target);
gen();
