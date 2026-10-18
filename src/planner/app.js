const $ = (id) => document.getElementById(id);
const h = (t, p = {}, ...c) => { const e = document.createElement(t); for (const k in p) k.startsWith("aria-") ? e.setAttribute(k, p[k]) : (e[k] = p[k]); e.append(...c); return e; };
const load = (f, d) => sreeos.fs.readText(f).then(JSON.parse, () => d);
const save = (f, d) => sreeos.fs.write(f, JSON.stringify(d));
const today = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
let events = [], view = new Date(), sel = today();
view.setDate(1);
const persist = () => save('planner.json', events);
const ds = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
function render() {
  $('mt').textContent = view.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const start = new Date(view); start.setDate(1 - start.getDay());
  const cells = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => h('div', { className: 'dow', textContent: d }));
  for (let i = 0; i < 42; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i);
    const s = ds(d), ev = events.filter((e) => e.date === s);
    cells.push(h('button', { className: 'c' + (d.getMonth() !== view.getMonth() ? ' out' : '') + (s === today() ? ' today' : '') + (s === sel ? ' sel' : ''),
      'aria-label': s + (ev.length ? ', ' + ev.length + ' events' : ''), onclick: () => { sel = s; render(); } },
      String(d.getDate()), ...ev.slice(0, 2).map((e) => h('i', { textContent: e.text }))));
  }
  $('cal').replaceChildren(...cells);
  const inp = h('input', { 'aria-label': 'New event on ' + sel, placeholder: 'Add event…', autocomplete: 'off' });
  $('day').replaceChildren(h('h2', { textContent: new Date(sel + 'T00:00:00').toDateString() }),
    h('ul', {}, ...events.filter((e) => e.date === sel).map((e) => h('li', {}, h('span', { textContent: e.text }),
      h('button', { className: 'x', textContent: '×', 'aria-label': 'Delete ' + e.text, onclick: () => { events = events.filter((x) => x !== e); persist(); render(); } })))),
    h('form', { onsubmit: (ev) => { ev.preventDefault(); if (inp.value.trim()) { events.push({ id: uid(), date: sel, text: inp.value.trim() }); persist(); render(); } } }, inp));
}
$('prev').onclick = () => { view.setMonth(view.getMonth() - 1); render(); };
$('next').onclick = () => { view.setMonth(view.getMonth() + 1); render(); };
$('now').onclick = () => { view = new Date(); view.setDate(1); sel = today(); render(); };
load('planner.json', []).then((d) => { events = d; render(); });
