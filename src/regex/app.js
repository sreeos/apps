const $ = (id) => document.getElementById(id);
async function copy(text, btn) {
  try { await sreeos.clipboard.write(text); } catch { return; }
  if (btn) { const t = btn.dataset.t || (btn.dataset.t = btn.textContent); btn.textContent = 'Copied'; setTimeout(() => (btn.textContent = t), 900); }
}
function run() {
  const msg = $('msg'), hl = $('hl'), list = $('list'), text = $('in').value;
  msg.textContent = ''; hl.textContent = ''; list.textContent = '';
  const pat = $('pat').value;
  if (!pat) { hl.textContent = text; $('count').textContent = ''; return; }
  let re;
  try { re = new RegExp(pat, $('flags').value); } catch (e) { msg.textContent = e.message; hl.textContent = text; $('count').textContent = ''; return; }
  const global = re.global || re.sticky;
  const ms = [];
  if (global) {
    for (const m of text.matchAll(new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g'))) { ms.push(m); if (ms.length >= 1000) break; }
  } else { const m = re.exec(text); if (m) ms.push(m); }
  let last = 0;
  for (const m of ms) {
    if (m[0] === '') continue;
    hl.append(text.slice(last, m.index));
    const mk = document.createElement('mark'); mk.textContent = m[0]; hl.append(mk);
    last = m.index + m[0].length;
  }
  hl.append(text.slice(last));
  $('count').textContent = `${ms.length} match${ms.length === 1 ? '' : 'es'}${ms.length >= 1000 ? ' (showing first 1000)' : ''}`;
  ms.slice(0, 100).forEach((m, i) => {
    const d = document.createElement('div'); d.className = 'm';
    const b = document.createElement('b'); b.textContent = `#${i + 1} at ${m.index}: `;
    d.append(b, JSON.stringify(m[0]));
    for (let g = 1; g < m.length; g++) { const gd = document.createElement('div'); gd.className = 'muted'; gd.textContent = `  group ${g}: ${m[g] === undefined ? '(no match)' : JSON.stringify(m[g])}`; d.append(gd); }
    if (m.groups) for (const [k, v] of Object.entries(m.groups)) { const gd = document.createElement('div'); gd.className = 'muted'; gd.textContent = `  <${k}>: ${v === undefined ? '(no match)' : JSON.stringify(v)}`; d.append(gd); }
    list.append(d);
  });
}
for (const id of ['pat', 'flags', 'in']) $(id).oninput = run;
run();
