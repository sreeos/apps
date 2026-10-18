const $ = (id) => document.getElementById(id);
async function copy(text, btn) {
  try { await sreeos.clipboard.write(text); } catch { return; }
  if (btn) { const t = btn.dataset.t || (btn.dataset.t = btn.textContent); btn.textContent = 'Copied'; setTimeout(() => (btn.textContent = t), 900); }
}
const DEFAULT = ['UTC', 'America/New_York', 'Europe/London', 'Asia/Kolkata', 'Asia/Tokyo'];
let zones = [];
try { for (const z of Intl.supportedValuesOf('timeZone')) $('zones').append(new Option(z)); } catch {}
const valid = (z) => { try { new Intl.DateTimeFormat('en', { timeZone: z }); return true; } catch { return false; } };
const save = () => sreeos.fs.write('zones.json', JSON.stringify(zones)).catch(() => {});
function build() {
  const box = $('clocks'); box.textContent = '';
  zones.forEach((z, i) => {
    const d = document.createElement('div'); d.className = 'clock';
    const n = document.createElement('div'); n.className = 'name';
    const b = document.createElement('b'); b.textContent = z.split('/').pop().replace(/_/g, ' ');
    const sub = document.createElement('span'); sub.className = 'muted'; sub.dataset.z = z;
    n.append(b, sub);
    const t = document.createElement('div'); t.className = 'time'; t.dataset.z = z;
    const rm = document.createElement('button'); rm.textContent = 'Remove'; rm.setAttribute('aria-label', 'Remove ' + z);
    rm.onclick = () => { zones.splice(i, 1); save(); build(); tick(); };
    d.append(n, t, rm); box.append(d);
  });
  if (!zones.length) box.textContent = 'No clocks yet. Add a time zone above.';
}
function tick() {
  const now = new Date();
  for (const el of document.querySelectorAll('.time')) {
    const z = el.dataset.z;
    const p = new Intl.DateTimeFormat([], { timeZone: z, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(now);
    el.textContent = p;
    const sub = document.querySelector(`.muted[data-z="${CSS.escape(z)}"]`);
    if (sub) sub.textContent = z + ' · ' + new Intl.DateTimeFormat([], { timeZone: z, weekday: 'short', day: 'numeric', month: 'short', timeZoneName: 'short' }).format(now);
  }
}
$('add').onclick = () => {
  const raw = $('zone').value.trim(); $('msg').textContent = '';
  if (!raw) return;
  const match = (Intl.supportedValuesOf ? Intl.supportedValuesOf('timeZone') : []).find((z) => z.toLowerCase() === raw.toLowerCase()) || raw;
  if (!valid(match)) { $('msg').textContent = `"${raw}" is not a known time zone`; return; }
  if (zones.includes(match)) { $('msg').textContent = 'Already added'; return; }
  zones.push(match); $('zone').value = ''; save(); build(); tick();
};
$('zone').onkeydown = (e) => { if (e.key === 'Enter') $('add').click(); };
sreeos.fs.readText('zones.json').then((t) => JSON.parse(t)).catch(() => DEFAULT).then((z) => { zones = z.filter(valid); build(); tick(); setInterval(tick, 1000); });
