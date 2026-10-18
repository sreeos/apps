const $ = (id) => document.getElementById(id);
const h = (t, p = {}, ...c) => { const e = document.createElement(t); for (const k in p) k.startsWith("aria-") ? e.setAttribute(k, p[k]) : (e[k] = p[k]); e.append(...c); return e; };
const load = (f, d) => sreeos.fs.readText(f).then(JSON.parse, () => d);
const save = (f, d) => sreeos.fs.write(f, JSON.stringify(d));
const today = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
let entries = [], cur = null, timer;
const persist = () => save('journal.json', entries);
function drawList() {
  entries.sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  $('list').replaceChildren(...entries.map((e) => h('li', { className: e === cur ? 'on' : '', tabIndex: 0, onclick: () => { cur = e; render(); }, onkeydown: (k) => { if (k.key === 'Enter') { cur = e; render(); } } },
    h('small', { textContent: e.date }), e.title || e.text.split('\n')[0].slice(0, 30) || 'Untitled')));
}
function render() {
  drawList();
  $('date').value = cur ? cur.date : ''; $('title').value = cur ? cur.title : ''; $('text').value = cur ? cur.text : '';
  for (const id of ['date', 'title', 'text']) $(id).disabled = !cur;
  $('status').textContent = cur ? cur.text.split(/\s+/).filter(Boolean).length + ' words' : 'No entry selected';
}
function edit(k) {
  return (ev) => {
    cur[k] = ev.target.value;
    $('status').textContent = cur.text.split(/\s+/).filter(Boolean).length + ' words';
    clearTimeout(timer); timer = setTimeout(() => { persist(); drawList(); }, 600);
  };
}
$('date').oninput = edit('date'); $('title').oninput = edit('title'); $('text').oninput = edit('text');
$('add').onclick = () => { cur = { id: uid(), date: today(), title: '', text: '' }; entries.push(cur); render(); $('text').focus(); };
load('journal.json', []).then((d) => { entries = d; cur = d[0] || null; render(); });
$('del').onclick = async () => {
  if (!cur || !(await sreeos.confirm('Delete entry?', cur.title || cur.date))) return;
  entries = entries.filter((e) => e !== cur); cur = entries[0] || null; persist(); render();
};
