const $ = (id) => document.getElementById(id);
const h = (t, p = {}, ...c) => { const e = document.createElement(t); for (const k in p) k.startsWith("aria-") ? e.setAttribute(k, p[k]) : (e[k] = p[k]); e.append(...c); return e; };
const load = (f, d) => sreeos.fs.readText(f).then(JSON.parse, () => d);
const save = (f, d) => sreeos.fs.write(f, JSON.stringify(d));
const today = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const MOODS = [['😞', 'Awful'], ['🙁', 'Bad'], ['😐', 'Okay'], ['🙂', 'Good'], ['😄', 'Great']];
let log = {}, view = new Date(), sel = today();
view.setDate(1);
const persist = () => save('mood.json', log);
const ds = (y, m, d) => y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
function render() {
  $('mt').textContent = view.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  $('pick').replaceChildren(h('span', { className: 'muted', textContent: sel === today() ? 'Today:' : sel + ':' }), ...MOODS.map(([e, n], i) => h('button', {
    textContent: e, className: log[sel] === i + 1 ? 'on' : '', title: n, 'aria-label': n, 'aria-pressed': String(log[sel] === i + 1),
    onclick: () => { if (log[sel] === i + 1) delete log[sel]; else log[sel] = i + 1; persist(); render(); } })));
  const y = view.getFullYear(), m = view.getMonth(), n = new Date(y, m + 1, 0).getDate();
  const cells = ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => h('div', { className: 'dow', textContent: d }));
  for (let i = 0; i < view.getDay(); i++) cells.push(h('div', { className: 'c blank' }));
  let sum = 0, cnt = 0;
  for (let d = 1; d <= n; d++) {
    const s = ds(y, m, d), v = log[s];
    if (v) { sum += v; cnt++; }
    cells.push(h('button', { className: 'c' + (s === today() ? ' today' : ''), 'aria-label': s + (v ? ' ' + MOODS[v - 1][1] : ''), onclick: () => { sel = s; render(); } }, String(d), h('b', { textContent: v ? MOODS[v - 1][0] : '·' })));
  }
  $('cal').replaceChildren(...cells);
  $('avg').textContent = cnt ? 'Average: ' + MOODS[Math.round(sum / cnt) - 1][0] + ' (' + (sum / cnt).toFixed(1) + '/5, ' + cnt + ' days logged)' : 'No moods logged this month.';
}
$('prev').onclick = () => { view.setMonth(view.getMonth() - 1); render(); };
$('next').onclick = () => { view.setMonth(view.getMonth() + 1); render(); };
load('mood.json', {}).then((d) => { log = d; render(); });
