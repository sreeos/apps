const $ = (id) => document.getElementById(id);
const h = (t, p = {}, ...c) => { const e = document.createElement(t); for (const k in p) k.startsWith("aria-") ? e.setAttribute(k, p[k]) : (e[k] = p[k]); e.append(...c); return e; };
const load = (f, d) => sreeos.fs.readText(f).then(JSON.parse, () => d);
const save = (f, d) => sreeos.fs.write(f, JSON.stringify(d));
const today = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
let tasks = [], filter = 'all';
const persist = () => save('todo.json', tasks);
function render() {
  $('filters').replaceChildren(...['all', 'active', 'done'].map((f) =>
    h('button', { textContent: f, className: f === filter ? 'on' : '', onclick: () => { filter = f; render(); } })));
  const shown = tasks.filter((t) => filter === 'all' || (filter === 'done') === t.done);
  $('list').replaceChildren(...shown.map((t) => h('li', { className: t.done ? 'done' : '' },
    h('input', { type: 'checkbox', checked: t.done, 'aria-label': 'Done: ' + t.text, onchange: (e) => { t.done = e.target.checked; persist(); render(); } }),
    h('span', { textContent: t.text }),
    h('button', { className: 'x', textContent: '×', 'aria-label': 'Delete ' + t.text, onclick: () => { tasks = tasks.filter((x) => x !== t); persist(); render(); } }))));
  const left = tasks.filter((t) => !t.done).length;
  $('count').textContent = left + ' left';
  sreeos.setTitle('To-Do (' + left + ')');
}
$('f').onsubmit = (e) => {
  e.preventDefault();
  const v = $('t').value.trim();
  if (!v) return;
  tasks.unshift({ id: uid(), text: v, done: false });
  $('t').value = ''; persist(); render();
};
$('clear').onclick = () => { tasks = tasks.filter((t) => !t.done); persist(); render(); };
load('todo.json', []).then((d) => { tasks = d; render(); });
