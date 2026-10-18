const $ = (id) => document.getElementById(id);
const h = (t, p = {}, ...c) => { const e = document.createElement(t); for (const k in p) k.startsWith("aria-") ? e.setAttribute(k, p[k]) : (e[k] = p[k]); e.append(...c); return e; };
const load = (f, d) => sreeos.fs.readText(f).then(JSON.parse, () => d);
const save = (f, d) => sreeos.fs.write(f, JSON.stringify(d));
const today = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
function calc() {
  const imp = $('u').value === 'i';
  $('hl').textContent = imp ? 'Height (in)' : 'Height (cm)';
  $('wl').textContent = imp ? 'Weight (lb)' : 'Weight (kg)';
  const ht = +$('h').value, wt = +$('w').value;
  if (!(ht > 0) || !(wt > 0)) { $('out').replaceChildren(h('span', { className: 'muted', textContent: 'Enter height and weight.' })); return; }
  const bmi = imp ? 703 * wt / (ht * ht) : wt / ((ht / 100) ** 2);
  const idx = bmi < 18.5 ? 0 : bmi < 25 ? 1 : bmi < 30 ? 2 : 3;
  const cat = ['Underweight', 'Healthy weight', 'Overweight', 'Obese'][idx];
  const mh = imp ? ht : ht / 100;
  const lo = 18.5 * mh * mh / (imp ? 703 : 1), hi = 24.9 * mh * mh / (imp ? 703 : 1);
  $('out').replaceChildren(h('b', { textContent: bmi.toFixed(1) }), cat,
    h('div', { className: 'scale' }, h('i'), h('i'), h('i'), h('i')),
    h('div', { className: 'muted', textContent: 'Healthy range for this height: ' + lo.toFixed(1) + '–' + hi.toFixed(1) + (imp ? ' lb' : ' kg') }));
}
$('f').oninput = calc;
$('f').onsubmit = (e) => e.preventDefault();
calc();
