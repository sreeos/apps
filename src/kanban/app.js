const $ = (id) => document.getElementById(id);
const h = (t, p = {}, ...c) => { const e = document.createElement(t); for (const k in p) k.startsWith("aria-") ? e.setAttribute(k, p[k]) : (e[k] = p[k]); e.append(...c); return e; };
const load = (f, d) => sreeos.fs.readText(f).then(JSON.parse, () => d);
const save = (f, d) => sreeos.fs.write(f, JSON.stringify(d));
const today = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const COLS = ['To do', 'Doing', 'Done'];
let cards = [];
const persist = () => save('kanban.json', cards);
function render() {
  $('board').replaceChildren(...COLS.map((name, ci) => {
    const list = h('div', { className: 'cards' }, ...cards.filter((c) => c.col === ci).map((c) =>
      h('div', { className: 'k', draggable: true, ondragstart: (e) => e.dataTransfer.setData('text/plain', c.id) },
        h('span', { textContent: c.text }),
        h('button', { className: 'x', textContent: '×', 'aria-label': 'Delete ' + c.text, onclick: () => { cards = cards.filter((x) => x !== c); persist(); render(); } }))));
    const inp = h('input', { 'aria-label': 'New card in ' + name, placeholder: 'Add card…', autocomplete: 'off' });
    const form = h('form', { onsubmit: (e) => {
      e.preventDefault();
      if (!inp.value.trim()) return;
      cards.push({ id: uid(), text: inp.value.trim(), col: ci }); persist(); render();
    } }, inp);
    const col = h('div', { className: 'col',
      ondragover: (e) => { e.preventDefault(); col.classList.add('over'); },
      ondragleave: () => col.classList.remove('over'),
      ondrop: (e) => {
        e.preventDefault();
        const c = cards.find((x) => x.id === e.dataTransfer.getData('text/plain'));
        if (c) { c.col = ci; cards = [...cards.filter((x) => x !== c), c]; persist(); }
        render();
      } },
      h('h2', {}, name, h('span', { className: 'muted', textContent: String(cards.filter((c) => c.col === ci).length) })), list, form);
    return col;
  }));
}
load('kanban.json', []).then((d) => { cards = d; render(); });
