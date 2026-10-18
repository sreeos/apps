const $ = (id) => document.getElementById(id);
async function copy(text, btn) {
  try { await sreeos.clipboard.write(text); } catch { return; }
  if (btn) { const t = btn.dataset.t || (btn.dataset.t = btn.textContent); btn.textContent = 'Copied'; setTimeout(() => (btn.textContent = t), 900); }
}
let mode = 'enc';
function toB64(s) {
  const bytes = new TextEncoder().encode(s);
  let bin = ''; for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}
function fromB64(s) {
  s = s.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s);
  return new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}
function update() {
  $('msg').textContent = '';
  const v = $('in').value;
  try {
    if (mode === 'enc') {
      let r = toB64(v);
      if ($('url').checked) r = r.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      $('out').value = r;
    } else $('out').value = v.trim() ? fromB64(v) : '';
  } catch { $('out').value = ''; $('msg').textContent = 'Not valid Base64 text'; }
}
function setMode(m) { mode = m; $('enc').classList.toggle('on', m === 'enc'); $('dec').classList.toggle('on', m === 'dec'); update(); }
$('enc').onclick = () => setMode('enc');
$('dec').onclick = () => setMode('dec');
$('in').oninput = update;
$('url').onchange = update;
$('cp').onclick = (e) => copy($('out').value, e.target);
$('swap').onclick = () => { $('in').value = $('out').value; setMode(mode === 'enc' ? 'dec' : 'enc'); };
