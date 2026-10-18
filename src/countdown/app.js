const $ = (id) => document.getElementById(id);
const h = (t, p = {}, ...c) => { const e = document.createElement(t); for (const k in p) k.startsWith("aria-") ? e.setAttribute(k, p[k]) : (e[k] = p[k]); e.append(...c); return e; };
const load = (f, d) => sreeos.fs.readText(f).then(JSON.parse, () => d);
const save = (f, d) => sreeos.fs.write(f, JSON.stringify(d));
const today = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
let items = [];
const persist = () => save('countdown.json', items);
const days = (d) => Math.round((new Date(d + 'T00:00:00') - new Date(today() + 'T00:00:00')) / 864e5);
function render() {
  items.sort((a, b) => a.date.localeCompare(b.date));
  $('list').replaceChildren(...items.map((it) => {
    const n = days(it.date);
    return h('li', { className: 'card' + (n < 0 ? ' past' : '') },
      h('div', { className: 'n' }, it.name, h('small', { textContent: new Date(it.date + 'T00:00:00').toDateString() })),
      h('div', { className: 'big' }, n === 0 ? 'Today!' : String(Math.abs(n)), n === 0 ? '' : h('small', { textContent: (Math.abs(n) === 1 ? 'day' : 'days') + (n < 0 ? ' ago' : ' left') })),
      h('button', { className: 'x', textContent: '×', 'aria-label': 'Delete ' + it.name, onclick: () => { items = items.filter((x) => x !== it); persist(); render(); } }));
  }));
  const next = items.find((i) => days(i.date) >= 0);
  sreeos.setTitle(next ? 'Countdown — ' + next.name + ' in ' + days(next.date) + 'd' : 'Countdown');
}
$('f').onsubmit = (e) => {
  e.preventDefault();
  items.push({ id: uid(), name: $('n').value.trim(), date: $('d').value });
  $('n').value = ''; persist(); render();
};
load('countdown.json', []).then((d) => { items = d; render(); });
setInterval(render, 60 * 60 * 1000);
