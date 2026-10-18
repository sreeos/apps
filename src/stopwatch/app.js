const $ = (id) => document.getElementById(id);
async function copy(text, btn) {
  try { await sreeos.clipboard.write(text); } catch { return; }
  if (btn) { const t = btn.dataset.t || (btn.dataset.t = btn.textContent); btn.textContent = 'Copied'; setTimeout(() => (btn.textContent = t), 900); }
}
let lastTitle = '', elapsed = 0, startAt = 0, running = false, raf = 0, laps = [];
function fmt(ms) {
  const cs = Math.floor(ms / 10) % 100, s = Math.floor(ms / 1000) % 60, m = Math.floor(ms / 60000) % 60, h = Math.floor(ms / 3600000);
  const p = (n) => String(n).padStart(2, '0');
  return (h ? h + ':' : '') + p(m) + ':' + p(s) + '.' + p(cs);
}
const now = () => elapsed + (running ? performance.now() - startAt : 0);
function paint() {
  $('disp').textContent = fmt(now());
  if (running) raf = requestAnimationFrame(paint);
  const t = running ? 'Stopwatch ' + fmt(now()).slice(0, -3) : 'Stopwatch';
  if (t !== lastTitle) { lastTitle = t; sreeos.setTitle(t).catch(() => {}); }
}
function renderLaps() {
  const el = $('laps'); el.textContent = '';
  const splits = laps.map((t, i) => t - (laps[i - 1] || 0));
  const mx = Math.max(...splits), mn = Math.min(...splits);
  for (let i = laps.length - 1; i >= 0; i--) {
    const li = document.createElement('li');
    if (laps.length > 2) li.className = splits[i] === mn ? 'best' : splits[i] === mx ? 'worst' : '';
    const a = document.createElement('span'); a.textContent = 'Lap ' + (i + 1);
    const b = document.createElement('span'); b.textContent = fmt(splits[i]);
    const c = document.createElement('span'); c.textContent = fmt(laps[i]); c.style.color = 'var(--muted)';
    li.append(a, b, c); el.append(li);
  }
}
function setUi() {
  $('start').textContent = running ? 'Stop' : elapsed ? 'Resume' : 'Start';
  $('lap').disabled = !running; $('reset').disabled = running || !elapsed;
}
$('start').onclick = () => {
  if (running) { elapsed += performance.now() - startAt; running = false; cancelAnimationFrame(raf); }
  else { startAt = performance.now(); running = true; raf = requestAnimationFrame(paint); }
  setUi(); paint();
};
$('lap').onclick = () => { laps.push(now()); renderLaps(); };
$('reset').onclick = () => { elapsed = 0; laps = []; renderLaps(); setUi(); paint(); };
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'BUTTON') return;
  if (e.code === 'Space') { e.preventDefault(); $('start').click(); } else if (e.key === 'l' && running) $('lap').click();
});
setUi(); paint();
