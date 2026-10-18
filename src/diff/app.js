const $ = (id) => document.getElementById(id);
async function copy(text, btn) {
  try { await sreeos.clipboard.write(text); } catch { return; }
  if (btn) { const t = btn.dataset.t || (btn.dataset.t = btn.textContent); btn.textContent = 'Copied'; setTimeout(() => (btn.textContent = t), 900); }
}
function lcsDiff(a, b, eq) {
  const n = a.length, m = b.length;
  const t = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--)
    t[i][j] = eq(a[i], b[j]) ? t[i + 1][j + 1] + 1 : Math.max(t[i + 1][j], t[i][j + 1]);
  const out = []; let i = 0, j = 0;
  while (i < n && j < m) {
    if (eq(a[i], b[j])) { out.push(['=', b[j]]); i++; j++; }
    else if (t[i + 1][j] >= t[i][j + 1]) out.push(['-', a[i++]]);
    else out.push(['+', b[j++]]);
  }
  while (i < n) out.push(['-', a[i++]]);
  while (j < m) out.push(['+', b[j++]]);
  return out;
}
function run() {
  const A = $('a').value, B = $('b').value, out = $('out');
  out.textContent = '';
  if (!A && !B) { $('stat').textContent = ''; return; }
  const a = A ? A.split('\n') : [], b = B ? B.split('\n') : [];
  if (a.length * b.length > 4e6) { $('stat').textContent = 'Inputs too large to compare'; return; }
  const norm = (s) => { if ($('ws').checked) s = s.replace(/\s+/g, ' ').trim(); return $('ci').checked ? s.toLowerCase() : s; };
  const d = lcsDiff(a, b, (x, y) => norm(x) === norm(y));
  let add = 0, del = 0;
  for (const [k, text] of d) {
    const row = document.createElement('div');
    row.className = 'l ' + (k === '+' ? 'add' : k === '-' ? 'del' : '');
    const mark = document.createElement('i'); mark.textContent = k === '=' ? '' : k;
    const span = document.createElement('span'); span.textContent = text || ' ';
    row.append(mark, span); out.append(row);
    if (k === '+') add++; else if (k === '-') del++;
  }
  $('stat').textContent = add || del ? `${add} added, ${del} removed` : 'Texts are identical';
}
for (const id of ['a', 'b', 'ws', 'ci']) $(id).oninput = run;
run();
