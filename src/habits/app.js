const $ = (id) => document.getElementById(id);
const h = (t, p = {}, ...c) => { const e = document.createElement(t); for (const k in p) k.startsWith("aria-") ? e.setAttribute(k, p[k]) : (e[k] = p[k]); e.append(...c); return e; };
const load = (f, d) => sreeos.fs.readText(f).then(JSON.parse, () => d);
const save = (f, d) => sreeos.fs.write(f, JSON.stringify(d));
const today = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
let habits = [];
const persist = () => save('habits.json', habits);
const dayStr = (back) => { const d = new Date(); d.setDate(d.getDate() - back); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
function streak(hb) {
  let n = 0, i = hb.days.includes(dayStr(0)) ? 0 : 1;
  while (hb.days.includes(dayStr(i))) { n++; i++; }
  return n;
}
function render() {
  const days = [6, 5, 4, 3, 2, 1, 0];
  const head = h('tr', {}, h('th', { textContent: 'Habit' }), ...days.map((b) => {
    const d = new Date(); d.setDate(d.getDate() - b);
    return h('th', { textContent: d.toLocaleDateString(undefined, { weekday: 'short' }) });
  }), h('th', { textContent: 'Streak' }), h('th'));
  const rows = habits.map((hb) => h('tr', {}, h('td', { textContent: hb.name }),
    ...days.map((b) => {
      const ds = dayStr(b), on = hb.days.includes(ds);
      return h('td', { className: b === 0 ? 'today' : '' }, h('button', {
        className: on ? 'on' : '', textContent: on ? '✓' : '', 'aria-label': hb.name + ' ' + ds + (on ? ' done' : ' not done'), 'aria-pressed': String(on),
        onclick: () => { hb.days = on ? hb.days.filter((x) => x !== ds) : [...hb.days, ds]; persist(); render(); } }));
    }),
    h('td', { className: 'streak', textContent: '🔥 ' + streak(hb) }),
    h('td', {}, h('button', { className: 'x', textContent: '×', 'aria-label': 'Delete ' + hb.name, onclick: async () => {
      if (await sreeos.confirm('Delete habit?', hb.name)) { habits = habits.filter((x) => x !== hb); persist(); render(); } } }))));
  $('grid').replaceChildren(head, ...rows);
}
$('f').onsubmit = (e) => {
  e.preventDefault();
  const v = $('n').value.trim();
  if (!v) return;
  habits.push({ id: uid(), name: v, days: [] }); $('n').value = ''; persist(); render();
};
load('habits.json', []).then((d) => { habits = d; render(); });
