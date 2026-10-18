const $ = (id) => document.getElementById(id);
const h = (t, p = {}, ...c) => { const e = document.createElement(t); for (const k in p) k.startsWith("aria-") ? e.setAttribute(k, p[k]) : (e[k] = p[k]); e.append(...c); return e; };
const load = (f, d) => sreeos.fs.readText(f).then(JSON.parse, () => d);
const save = (f, d) => sreeos.fs.write(f, JSON.stringify(d));
const today = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
let people = [], cur = null, timer;
const persist = () => save('contacts.json', people);
const FIELDS = [['name', 'Name'], ['phone', 'Phone'], ['email', 'Email'], ['address', 'Address']];
function drawList() {
  people.sort((a, b) => a.name.localeCompare(b.name));
  const q = $('q').value.toLowerCase();
  $('list').replaceChildren(...people.filter((p) => JSON.stringify(p).toLowerCase().includes(q)).map((p) =>
    h('li', { className: p === cur ? 'on' : '', tabIndex: 0, textContent: p.name || 'Unnamed', onclick: () => { cur = p; render(); }, onkeydown: (e) => { if (e.key === 'Enter') { cur = p; render(); } } })));
}
function render() {
  drawList();
  if (!cur) { $('form').replaceChildren(h('span', { className: 'muted', textContent: 'Select or add a contact.' })); return; }
  $('form').replaceChildren(
    ...FIELDS.map(([k, l]) => h('label', {}, l, h('input', { value: cur[k] || '', oninput: (e) => { cur[k] = e.target.value; clearTimeout(timer); timer = setTimeout(() => { persist(); drawList(); }, 500); } }))),
    h('label', {}, 'Notes', h('textarea', { rows: 4, value: cur.notes || '', oninput: (e) => { cur.notes = e.target.value; clearTimeout(timer); timer = setTimeout(persist, 500); } })),
    h('button', { className: 'danger', textContent: 'Delete contact', onclick: async () => {
      if (await sreeos.confirm('Delete contact?', cur.name)) { people = people.filter((x) => x !== cur); cur = null; persist(); render(); } } }));
}
$('q').oninput = drawList;
$('add').onclick = () => { cur = { id: uid(), name: 'New contact' }; people.push(cur); persist(); render(); $('form').querySelector('input').select(); };
load('contacts.json', []).then((d) => { people = d; render(); });
