const $ = (id) => document.getElementById(id);
const h = (t, p = {}, ...c) => { const e = document.createElement(t); for (const k in p) k.startsWith("aria-") ? e.setAttribute(k, p[k]) : (e[k] = p[k]); e.append(...c); return e; };
const load = (f, d) => sreeos.fs.readText(f).then(JSON.parse, () => d);
const save = (f, d) => sreeos.fs.write(f, JSON.stringify(d));
const today = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
let tx = [], month = today().slice(0, 7);
const persist = () => save('budget.json', tx);
const fmt = (n) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
function render() {
  const m = tx.filter((t) => t.date.startsWith(month)).sort((a, b) => b.date.localeCompare(a.date));
  const inc = m.filter((t) => t.type === 'income').reduce((s, t) => s + t.amt, 0);
  const exp = m.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amt, 0);
  const card = (l, v, c) => h('div', { className: 'card' }, l, h('b', { className: c, textContent: fmt(v) }));
  $('sum').replaceChildren(card('Income', inc, 'inc'), card('Expenses', exp, 'exp'), card('Balance', inc - exp, inc - exp >= 0 ? 'inc' : 'exp'));
  $('cats').replaceChildren(...[...new Set(tx.map((t) => t.cat))].map((c) => h('option', { value: c })));
  const cats = {};
  m.filter((t) => t.type === 'expense').forEach((t) => { cats[t.cat] = (cats[t.cat] || 0) + t.amt; });
  const max = Math.max(1, ...Object.values(cats));
  $('bycat').replaceChildren(...Object.entries(cats).sort((a, b) => b[1] - a[1]).map(([c, v]) =>
    h('div', { className: 'bar' }, h('span', { textContent: c }), h('i', { style: 'width:' + (v / max * 60) + '%' }), h('span', { textContent: fmt(v) }))));
  $('list').replaceChildren(...m.map((t) => h('li', {},
    h('span', { className: 'd', textContent: t.date }), h('span', { className: 't', textContent: t.cat + (t.note ? ' — ' + t.note : '') }),
    h('b', { className: t.type === 'income' ? 'inc' : 'exp', textContent: (t.type === 'income' ? '+' : '-') + fmt(t.amt) }),
    h('button', { className: 'x', textContent: '×', 'aria-label': 'Delete transaction', onclick: () => { tx = tx.filter((x) => x !== t); persist(); render(); } }))));
}
$('month').value = month; $('date').value = today();
$('month').onchange = (e) => { month = e.target.value || month; render(); };
$('f').onsubmit = (e) => {
  e.preventDefault();
  const amt = parseFloat($('amt').value);
  if (!(amt > 0)) return;
  tx.push({ id: uid(), type: $('type').value, amt, cat: $('cat').value.trim() || 'General', note: $('note').value.trim(), date: $('date').value || today() });
  $('amt').value = $('note').value = ''; persist(); render();
};
load('budget.json', []).then((d) => { tx = d; render(); });
