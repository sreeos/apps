const $ = (id) => document.getElementById(id);
async function copy(text, btn) {
  try { await sreeos.clipboard.write(text); } catch { return; }
  if (btn) { const t = btn.dataset.t || (btn.dataset.t = btn.textContent); btn.textContent = 'Copied'; setTimeout(() => (btn.textContent = t), 900); }
}
const W = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum'.split(' ');
const pick = () => W[Math.floor(Math.random() * W.length)];
const cap = (s) => s[0].toUpperCase() + s.slice(1);
function sentence(first) {
  const n = 6 + Math.floor(Math.random() * 10), w = Array.from({ length: n }, pick);
  if (first) w.splice(0, 2, 'lorem', 'ipsum');
  for (let i = 4; i < w.length - 2; i += 4 + Math.floor(Math.random() * 3)) w[i] += ',';
  return cap(w.join(' ')) + '.';
}
function gen() {
  const n = Math.max(1, Math.min(100, Math.floor(Number($('n').value)) || 1)), u = $('unit').value, st = $('start').checked;
  let out;
  if (u === 'w') { const w = Array.from({ length: n }, pick); if (st && n >= 2) w.splice(0, 2, 'lorem', 'ipsum'); out = cap(w.join(' ')) + '.'; }
  else if (u === 's') out = Array.from({ length: n }, (_, i) => sentence(st && !i)).join(' ');
  else out = Array.from({ length: n }, (_, p) => Array.from({ length: 3 + Math.floor(Math.random() * 4) }, (_, i) => sentence(st && !p && !i)).join(' ')).join('\n\n');
  $('out').value = out;
}
$('gen').onclick = gen;
for (const id of ['n', 'unit', 'start']) $(id).onchange = gen;
$('cp').onclick = (e) => copy($('out').value, e.target);
gen();
