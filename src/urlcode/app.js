const $ = (id) => document.getElementById(id);
async function copy(text, btn) {
  try { await sreeos.clipboard.write(text); } catch { return; }
  if (btn) { const t = btn.dataset.t || (btn.dataset.t = btn.textContent); btn.textContent = 'Copied'; setTimeout(() => (btn.textContent = t), 900); }
}
let mode = 'enc';
function update() {
  const v = $('in').value;
  $('msg').textContent = '';
  try {
    $('out').value = mode === 'enc' ? ($('full').checked ? encodeURI(v) : encodeURIComponent(v)) : ($('full').checked ? decodeURI(v) : decodeURIComponent(v.replace(/\+/g, ' ')));
  } catch { $('out').value = ''; $('msg').textContent = 'Malformed escape sequence'; }
  const q = v.includes('?') ? v.slice(v.indexOf('?') + 1).split('#')[0] : v.includes('=') ? v : '';
  const box = $('params'); box.textContent = '';
  const pairs = q ? q.split('&').filter(Boolean) : [];
  if (!pairs.length) { box.textContent = 'No parameters found'; box.style.color = 'var(--muted)'; return; }
  box.style.color = '';
  const dc = (s) => { try { return decodeURIComponent(s.replace(/\+/g, ' ')); } catch { return s; } };
  for (const p of pairs) {
    const i = p.indexOf('=');
    const row = document.createElement('div');
    const k = document.createElement('b'); k.textContent = dc(i < 0 ? p : p.slice(0, i));
    row.append(k, ' = ', i < 0 ? '' : dc(p.slice(i + 1)));
    box.append(row);
  }
}
function setMode(m) { mode = m; $('enc').classList.toggle('on', m === 'enc'); $('dec').classList.toggle('on', m === 'dec'); update(); }
$('enc').onclick = () => setMode('enc');
$('dec').onclick = () => setMode('dec');
$('in').oninput = update;
$('full').onchange = update;
$('cp').onclick = (e) => copy($('out').value, e.target);
update();
