const $ = (id) => document.getElementById(id);
const h = (t, p = {}, ...c) => { const e = document.createElement(t); for (const k in p) k.startsWith("aria-") ? e.setAttribute(k, p[k]) : (e[k] = p[k]); e.append(...c); return e; };
const load = (f, d) => sreeos.fs.readText(f).then(JSON.parse, () => d);
const save = (f, d) => sreeos.fs.write(f, JSON.stringify(d));
const today = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
// Leitner-style boxes: "good" moves a card up (reviewed less often), "again" resets it.
let decks = [], di = 0, shown = false, current = null;
const persist = () => save('flashcards.json', decks);
const GAP = [0, 1, 2, 4, 8, 16];
const due = (c) => !c.next || c.next <= today();
const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
function pick() {
  const d = decks[di];
  const ds = d ? d.cards.filter(due) : [];
  current = ds.length ? ds[Math.floor(Math.random() * ds.length)] : null; shown = false;
}
function render() {
  $('deck').replaceChildren(...decks.map((d, i) => h('option', { value: i, textContent: d.name, selected: i === di })));
  const d = decks[di], s = $('study');
  $('f').hidden = !d; $('deldeck').disabled = !d;
  if (!d) s.replaceChildren(h('span', { className: 'muted', textContent: 'Create a deck to start.' }));
  else if (!d.cards.length) s.replaceChildren(h('span', { className: 'muted', textContent: 'Add some cards below.' }));
  else if (!current) s.replaceChildren(h('span', { textContent: '🎉 All caught up for today!' }));
  else if (!shown) s.replaceChildren(h('button', { className: 'face', textContent: current.q, onclick: () => { shown = true; render(); }, 'aria-label': 'Question: ' + current.q + '. Show answer' }), h('span', { className: 'muted', textContent: 'Click to flip' }));
  else s.replaceChildren(h('div', { className: 'face', textContent: current.q }), h('div', { className: 'face back', textContent: current.a }),
    h('div', { className: 'row' },
      h('button', { textContent: 'Again', onclick: () => grade(false) }),
      h('button', { className: 'primary', textContent: 'Good', onclick: () => grade(true) })));
  $('info').textContent = d ? d.cards.filter(due).length + ' due, ' + d.cards.length + ' total' : '';
}
function grade(good) {
  current.box = good ? Math.min(5, (current.box || 0) + 1) : 0;
  current.next = good ? addDays(GAP[current.box]) : today();
  if (!good) current.next = undefined;
  persist(); pick(); render();
}
$('deck').onchange = (e) => { di = +e.target.value; pick(); render(); };
$('newdeck').onclick = async () => {
  const n = await sreeos.prompt('Deck name');
  if (n && n.trim()) { decks.push({ name: n.trim(), cards: [] }); di = decks.length - 1; persist(); pick(); render(); }
};
$('deldeck').onclick = async () => {
  if (await sreeos.confirm('Delete deck?', decks[di].name)) { decks.splice(di, 1); di = 0; persist(); pick(); render(); }
};
$('f').onsubmit = (e) => {
  e.preventDefault();
  if (!$('q').value.trim() || !$('a').value.trim()) return;
  decks[di].cards.push({ id: uid(), q: $('q').value.trim(), a: $('a').value.trim(), box: 0 });
  $('q').value = $('a').value = ''; $('q').focus(); persist();
  if (!current) pick();
  render();
};
load('flashcards.json', []).then((d) => { decks = d; pick(); render(); });
