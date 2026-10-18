// All notes live in one file in the app's data folder (no permission needed).
let notes = [], cur = 0, timer;
const $ = (id) => document.getElementById(id);
const save = () => sreeos.fs.write('notes.json', JSON.stringify(notes));
const title = (n) => n.text.split('\n')[0].trim() || 'New note';

function render() {
  $('list').replaceChildren(...notes.map((n, i) => {
    const li = document.createElement('li');
    li.className = i === cur ? 'on' : '';
    li.innerHTML = '<span></span><button aria-label="Delete">×</button>';
    li.firstChild.textContent = title(n);
    li.onclick = () => { cur = i; render(); };
    li.lastChild.onclick = async (e) => {
      e.stopPropagation();
      if (!(await sreeos.confirm('Delete note?', title(n)))) return;
      notes.splice(i, 1);
      if (!notes.length) notes.push({ text: '' });
      cur = Math.min(cur, notes.length - 1);
      await save(); render();
    };
    return li;
  }));
  $('text').value = notes[cur].text;
  sreeos.setTitle(`${title(notes[cur])} — Notes`);
}

$('add').onclick = () => { notes.unshift({ text: '' }); cur = 0; render(); $('text').focus(); };
$('text').oninput = (e) => {
  notes[cur].text = e.target.value;
  clearTimeout(timer);
  timer = setTimeout(() => { save(); render(); }, 400);
};

sreeos.fs.readText('notes.json').then(JSON.parse, () => [{ text: '' }]).then((n) => { notes = n.length ? n : [{ text: '' }]; render(); });
