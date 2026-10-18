const $ = (id) => document.getElementById(id);
const h = (t, p = {}, ...c) => { const e = document.createElement(t); for (const k in p) k.startsWith("aria-") ? e.setAttribute(k, p[k]) : (e[k] = p[k]); e.append(...c); return e; };
const load = (f, d) => sreeos.fs.readText(f).then(JSON.parse, () => d);
const save = (f, d) => sreeos.fs.write(f, JSON.stringify(d));
const today = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const fmt = (n) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
function calc() {
  const bill = Math.max(0, +$('bill').value), pct = +$('pct').value, n = Math.max(1, Math.floor(+$('n').value) || 1);
  $('pv').textContent = pct;
  const tip = bill * pct / 100, total = bill + tip;
  const line = (l, v, c) => h('div', { className: 'line ' + (c || '') }, h('span', { textContent: l }), h('span', { textContent: fmt(v) }));
  $('out').replaceChildren(line('Tip', tip), line('Total', total), line('Tip per person', tip / n), line('Each pays', total / n, 'big'));
}
$('presets').replaceChildren(...[10, 15, 18, 20, 25].map((p) => h('button', { textContent: p + '%', onclick: () => { $('pct').value = p; calc(); } })));
$('f').oninput = calc;
$('f').onsubmit = (e) => e.preventDefault();
calc();
