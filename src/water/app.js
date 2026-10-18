const $ = (id) => document.getElementById(id);
const h = (t, p = {}, ...c) => { const e = document.createElement(t); for (const k in p) k.startsWith("aria-") ? e.setAttribute(k, p[k]) : (e[k] = p[k]); e.append(...c); return e; };
const load = (f, d) => sreeos.fs.readText(f).then(JSON.parse, () => d);
const save = (f, d) => sreeos.fs.write(f, JSON.stringify(d));
const today = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
let data = { goal: 2000, days: {} };
const persist = () => save('water.json', data);
const day = (d) => data.days[d] || [];
const total = (d) => day(d).reduce((a, b) => a + b, 0);
function add(ml) {
  if (!(ml > 0)) return;
  const t = today();
  const before = total(t);
  (data.days[t] = day(t)).push(ml);
  persist(); render();
  if (before < data.goal && total(t) >= data.goal) sreeos.notify('Daily water goal reached! 💧').catch(() => {});
}
function render() {
  const t = total(today());
  $('pct').textContent = Math.round(t / data.goal * 100) + '%';
  $('amt').textContent = t + ' / ' + data.goal + ' ml';
  $('goal').value = data.goal;
  $('quick').replaceChildren(...[150, 250, 500].map((ml) => h('button', { className: 'primary', textContent: '+' + ml + ' ml', onclick: () => add(ml) })));
  $('hist').replaceChildren(...[6, 5, 4, 3, 2, 1, 0].map((b) => {
    const d = new Date(); d.setDate(d.getDate() - b);
    const s = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    return h('div', { className: 'bar' }, h('span', { textContent: d.toLocaleDateString(undefined, { weekday: 'short' }) }), h('i', { style: 'width:' + Math.min(100, total(s) / data.goal * 70) + '%' }), h('span', { textContent: total(s) + ' ml' }));
  }));
  sreeos.setTitle('Water — ' + t + ' ml');
}
$('f').onsubmit = (e) => { e.preventDefault(); add(parseInt($('custom').value)); $('custom').value = ''; };
$('goal').onchange = (e) => { data.goal = Math.max(100, parseInt(e.target.value) || 2000); persist(); render(); };
$('gf').onsubmit = (e) => e.preventDefault();
$('undo').onclick = () => { day(today()).pop(); persist(); render(); };
load('water.json', data).then((d) => { data = d; render(); });
