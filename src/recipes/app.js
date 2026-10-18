const $ = (id) => document.getElementById(id);
const h = (t, p = {}, ...c) => { const e = document.createElement(t); for (const k in p) k.startsWith("aria-") ? e.setAttribute(k, p[k]) : (e[k] = p[k]); e.append(...c); return e; };
const load = (f, d) => sreeos.fs.readText(f).then(JSON.parse, () => d);
const save = (f, d) => sreeos.fs.write(f, JSON.stringify(d));
const today = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
let recipes = [], cur = null, editing = false, scale = null;
const persist = () => save('recipes.json', recipes);
// Ingredient lines look like "200 g flour"; a leading number (or fraction) is scaled.
function scaleLine(line, f) {
  let m = line.match(/^\s*(\d+)\s+(\d+)\/(\d+)\s*(.*)$/), n, rest;
  if (m) { n = +m[1] + m[2] / m[3]; rest = m[4]; }
  else if ((m = line.match(/^\s*(\d+)\/(\d+)\s*(.*)$/))) { n = m[1] / m[2]; rest = m[3]; }
  else if ((m = line.match(/^\s*(\d+(?:\.\d+)?)\s*(.*)$/))) { n = +m[1]; rest = m[2]; }
  else return line;
  return Math.round(n * f * 100) / 100 + ' ' + rest;
}
function drawList() {
  const q = $('q').value.toLowerCase();
  $('list').replaceChildren(...recipes.filter((r) => (r.name + r.ingredients).toLowerCase().includes(q)).map((r) =>
    h('li', { className: r === cur ? 'on' : '', tabIndex: 0, textContent: r.name || 'Untitled', onclick: () => open(r), onkeydown: (e) => { if (e.key === 'Enter') open(r); } })));
}
function open(r) { cur = r; editing = false; scale = null; render(); }
function render() {
  drawList();
  const v = $('view');
  if (!cur) { v.replaceChildren(h('span', { className: 'muted', textContent: 'Select or add a recipe.' })); return; }
  if (editing) {
    const f = (k, l, t) => h('label', {}, l, h(t || 'input', { value: cur[k] || '', rows: 7, oninput: (e) => { cur[k] = e.target.value; } }));
    v.replaceChildren(f('name', 'Name'), f('servings', 'Servings (number)'), f('ingredients', 'Ingredients (one per line, e.g. "200 g flour")', 'textarea'), f('steps', 'Steps (one per line)', 'textarea'),
      h('div', { className: 'row' }, h('button', { className: 'primary', textContent: 'Save', onclick: () => { cur.servings = Math.max(1, parseInt(cur.servings) || 1); persist(); editing = false; render(); } }),
        h('button', { className: 'danger', textContent: 'Delete', onclick: async () => { if (await sreeos.confirm('Delete recipe?', cur.name)) { recipes = recipes.filter((x) => x !== cur); cur = null; persist(); render(); } } })));
    return;
  }
  const base = parseInt(cur.servings) || 1, f = (scale || base) / base;
  const lines = (s) => (s || '').split('\n').map((x) => x.trim()).filter(Boolean);
  v.replaceChildren(h('h1', { textContent: cur.name }),
    h('div', { className: 'row' }, h('label', {}, 'Servings', h('input', { type: 'number', min: 1, value: scale || base, onchange: (e) => { scale = Math.max(1, +e.target.value || 1); render(); } })),
      h('button', { textContent: 'Edit', onclick: () => { editing = true; render(); } })),
    h('h2', { textContent: 'Ingredients' }), h('ul', { className: 'ing' }, ...lines(cur.ingredients).map((l) => h('li', { textContent: scaleLine(l, f) }))),
    h('h2', { textContent: 'Steps' }), h('ol', { className: 'steps' }, ...lines(cur.steps).map((l) => h('li', { textContent: l }))));
}
$('q').oninput = drawList;
$('add').onclick = () => { cur = { id: uid(), name: 'New recipe', servings: 2, ingredients: '', steps: '' }; recipes.unshift(cur); editing = true; render(); };
load('recipes.json', []).then((d) => { recipes = d; render(); });
