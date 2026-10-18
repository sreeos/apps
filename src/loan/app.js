const $ = (id) => document.getElementById(id);
const h = (t, p = {}, ...c) => { const e = document.createElement(t); for (const k in p) k.startsWith("aria-") ? e.setAttribute(k, p[k]) : (e[k] = p[k]); e.append(...c); return e; };
const load = (f, d) => sreeos.fs.readText(f).then(JSON.parse, () => d);
const save = (f, d) => sreeos.fs.write(f, JSON.stringify(d));
const today = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const fmt = (n) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
function calc() {
  const P = +$('p').value, rate = +$('r').value, n = Math.round(+$('y').value * 12);
  if (!(P > 0) || !(n > 0) || rate < 0) { $('sum').replaceChildren(h('span', { className: 'muted', textContent: 'Enter valid values.' })); $('tb').replaceChildren(); return; }
  const i = rate / 1200;
  const emi = i === 0 ? P / n : P * i * Math.pow(1 + i, n) / (Math.pow(1 + i, n) - 1);
  const rows = [];
  let bal = P;
  for (let k = 1; k <= n; k++) {
    const int = bal * i, pr = emi - int;
    bal = Math.max(0, bal - pr);
    rows.push(h('tr', {}, ...[k, pr, int, bal].map((v, j) => h('td', { textContent: j ? fmt(v) : String(v) }))));
  }
  const card = (l, v) => h('div', { className: 'card' }, l, h('b', { textContent: fmt(v) }));
  $('sum').replaceChildren(card('Monthly EMI', emi), card('Total interest', emi * n - P), card('Total payment', emi * n));
  $('tb').replaceChildren(h('thead', {}, h('tr', {}, ...['Month', 'Principal', 'Interest', 'Balance'].map((t) => h('th', { textContent: t })))), h('tbody', {}, ...rows));
}
$('f').oninput = calc;
$('f').onsubmit = (e) => e.preventDefault();
calc();
