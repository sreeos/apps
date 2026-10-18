const $ = (id) => document.getElementById(id);
const h = (t, p = {}, ...c) => { const e = document.createElement(t); for (const k in p) k.startsWith("aria-") ? e.setAttribute(k, p[k]) : (e[k] = p[k]); e.append(...c); return e; };
const load = (f, d) => sreeos.fs.readText(f).then(JSON.parse, () => d);
const save = (f, d) => sreeos.fs.write(f, JSON.stringify(d));
const today = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const COLS = [['want', 'To read'], ['reading', 'Reading'], ['done', 'Done']];
let books = [];
const persist = () => save('readinglist.json', books);
function render() {
  $('board').replaceChildren(...COLS.map(([k, name], ci) => h('section', { className: 'col' },
    h('h2', { textContent: name + ' (' + books.filter((b) => b.status === k).length + ')' }),
    ...books.filter((b) => b.status === k).map((b) => h('div', { className: 'b' }, b.title, h('small', { textContent: b.author || '' }),
      h('div', { className: 'row' },
        ci > 0 ? h('button', { textContent: '← ' + COLS[ci - 1][1], onclick: () => { b.status = COLS[ci - 1][0]; persist(); render(); } }) : '',
        ci < 2 ? h('button', { textContent: COLS[ci + 1][1] + ' →', onclick: () => { b.status = COLS[ci + 1][0]; persist(); render(); } }) : '',
        h('button', { className: 'x', textContent: '×', 'aria-label': 'Delete ' + b.title, onclick: () => { books = books.filter((x) => x !== b); persist(); render(); } })))))));
}
$('f').onsubmit = (e) => {
  e.preventDefault();
  books.push({ id: uid(), title: $('t').value.trim(), author: $('a').value.trim(), status: 'want' });
  $('t').value = $('a').value = ''; persist(); render();
};
load('readinglist.json', []).then((d) => { books = d; render(); });
