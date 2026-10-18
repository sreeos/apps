const $ = (id) => document.getElementById(id);
async function copy(text, btn) {
  try { await sreeos.clipboard.write(text); } catch { return; }
  if (btn) { const t = btn.dataset.t || (btn.dataset.t = btn.textContent); btn.textContent = 'Copied'; setTimeout(() => (btn.textContent = t), 900); }
}
const SETS = { lo: 'abcdefghijklmnopqrstuvwxyz', up: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', di: '0123456789', sy: '!@#$%^&*()-_=+[]{};:,.?/' };
function rnd(n) { // unbiased random int in [0, n)
  const lim = Math.floor(0x100000000 / n) * n, a = new Uint32Array(1);
  do crypto.getRandomValues(a); while (a[0] >= lim);
  return a[0] % n;
}
function gen() {
  const am = $('am').checked, sets = [];
  for (const k of Object.keys(SETS)) if ($(k).checked) sets.push(am ? [...SETS[k]].filter((c) => !'0O1lI|'.includes(c)).join('') : SETS[k]);
  if (!sets.length) { $('pw').textContent = 'Select at least one set'; $('meter').value = 0; $('strength').textContent = ''; return; }
  const len = Number($('len').value), all = sets.join('');
  const chars = sets.slice(0, len).map((s) => s[rnd(s.length)]); // one from each set
  while (chars.length < len) chars.push(all[rnd(all.length)]);
  for (let i = chars.length - 1; i > 0; i--) { const j = rnd(i + 1); [chars[i], chars[j]] = [chars[j], chars[i]]; }
  $('pw').textContent = chars.join('');
  const bits = len * Math.log2(all.length);
  $('meter').value = Math.min(100, bits / 1.28);
  $('strength').textContent = `${bits < 40 ? 'Weak' : bits < 60 ? 'Fair' : bits < 90 ? 'Strong' : 'Very strong'} (about ${Math.round(bits)} bits)`;
}
$('len').oninput = () => { $('lenv').textContent = $('len').value; gen(); };
for (const k of [...Object.keys(SETS), 'am']) $(k).onchange = gen;
$('gen').onclick = gen;
$('cp').onclick = (e) => copy($('pw').textContent, e.target);
gen();
