const $ = (id) => document.getElementById(id);
async function copy(text, btn) {
  try { await sreeos.clipboard.write(text); } catch { return; }
  if (btn) { const t = btn.dataset.t || (btn.dataset.t = btn.textContent); btn.textContent = 'Copied'; setTimeout(() => (btn.textContent = t), 900); }
}
const pad = (n) => String(n).padStart(2, '0');
function tsToDate() {
  const raw = $('ts').value.trim(), out = $('tsOut'); out.textContent = '';
  if (!/^-?\d+(\.\d+)?$/.test(raw)) { out.textContent = raw ? 'Enter a number' : ''; return; }
  let n = Number(raw); const ms = Math.abs(n) >= 1e11 ? n : n * 1000, d = new Date(ms);
  if (isNaN(d)) { out.textContent = 'Out of range'; return; }
  const rows = [['Detected', Math.abs(n) >= 1e11 ? 'milliseconds' : 'seconds'], ['UTC', d.toUTCString()], ['ISO 8601', d.toISOString()], ['Local', d.toString()]];
  for (const [k, v] of rows) { const r = document.createElement('div'); const b = document.createElement('span'); b.className = 'muted'; b.textContent = k + ': '; r.append(b, v); out.append(r); }
}
function dateToTs() {
  const v = $('dt').value, out = $('dtOut'); out.textContent = '';
  if (!v) return;
  const m = /^(\d+)-(\d+)-(\d+)T(\d+):(\d+)(?::(\d+))?/.exec(v);
  const p = m.slice(1).map((x) => Number(x || 0));
  const d = $('zone').value === 'utc' ? new Date(Date.UTC(p[0], p[1] - 1, p[2], p[3], p[4], p[5])) : new Date(p[0], p[1] - 1, p[2], p[3], p[4], p[5]);
  out.textContent = `Seconds: ${Math.floor(d / 1000)}   Milliseconds: ${d.getTime()}`;
}
function tick() {
  const n = new Date(); $('nowS').textContent = Math.floor(n / 1000);
  $('nowI').textContent = `${n.toISOString()}  ·  ${n.getTime()} ms`;
}
$('ts').oninput = tsToDate; $('dt').oninput = dateToTs; $('zone').onchange = dateToTs;
$('useNow').onclick = () => { $('ts').value = Math.floor(Date.now() / 1000); tsToDate(); };
$('cpNow').onclick = (e) => copy($('nowS').textContent, e.target);
const n0 = new Date(); $('dt').value = `${n0.getFullYear()}-${pad(n0.getMonth() + 1)}-${pad(n0.getDate())}T${pad(n0.getHours())}:${pad(n0.getMinutes())}:${pad(n0.getSeconds())}`;
$('ts').value = Math.floor(Date.now() / 1000);
tsToDate(); dateToTs(); tick(); setInterval(tick, 1000);
