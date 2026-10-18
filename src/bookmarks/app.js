const $ = (id) => document.getElementById(id);
const h = (t, p = {}, ...c) => { const e = document.createElement(t); for (const k in p) k.startsWith("aria-") ? e.setAttribute(k, p[k]) : (e[k] = p[k]); e.append(...c); return e; };
const load = (f, d) => sreeos.fs.readText(f).then(JSON.parse, () => d);
const save = (f, d) => sreeos.fs.write(f, JSON.stringify(d));
const today = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
let items = [], tag = '';
const persist = () => save('bookmarks.json', items);
function render() {
  const all = [...new Set(items.flatMap((i) => i.tags))].sort();
  if (tag && !all.includes(tag)) tag = '';
  $('tagbar').replaceChildren(...all.map((t) => h('button', { textContent: '#' + t, className: t === tag ? 'on' : '', onclick: () => { tag = t === tag ? '' : t; render(); } })));
  const q = $('q').value.toLowerCase();
  const shown = items.filter((i) => (!tag || i.tags.includes(tag)) && (i.title + ' ' + i.url + ' ' + i.tags.join(' ')).toLowerCase().includes(q));
  $('list').replaceChildren(...shown.map((i) => h('li', {},
    h('div', { className: 'm' }, h('div', { textContent: i.title }), h('div', { className: 'u', textContent: i.url }), h('div', {}, ...i.tags.map((t) => h('span', { className: 'tag', textContent: t })))),
    h('button', { textContent: 'Copy', 'aria-label': 'Copy link ' + i.title, onclick: () => sreeos.clipboard.write(i.url).catch(() => {}) }),
    h('button', { className: 'x', textContent: '×', 'aria-label': 'Delete ' + i.title, onclick: () => { items = items.filter((x) => x !== i); persist(); render(); } }))));
}
$('q').oninput = render;
$('f').onsubmit = (e) => {
  e.preventDefault();
  items.unshift({ id: uid(), title: $('title').value.trim(), url: $('url').value.trim(), tags: $('tags').value.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean) });
  $('title').value = $('url').value = $('tags').value = ''; persist(); render();
};
load('bookmarks.json', []).then((d) => { items = d; render(); });
