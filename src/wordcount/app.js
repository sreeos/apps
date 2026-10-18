const $ = (id) => document.getElementById(id);
async function copy(text, btn) {
  try { await sreeos.clipboard.write(text); } catch { return; }
  if (btn) { const t = btn.dataset.t || (btn.dataset.t = btn.textContent); btn.textContent = 'Copied'; setTimeout(() => (btn.textContent = t), 900); }
}
const defs = ['Words', 'Characters', 'No spaces', 'Sentences', 'Paragraphs', 'Reading time', 'Speaking time'];
const cells = {};
for (const d of defs) {
  const c = document.createElement('div'); c.className = 'stat';
  const b = document.createElement('b'); const s = document.createElement('span'); s.textContent = d;
  c.append(b, s); $('stats').append(c); cells[d] = b;
}
const mins = (w) => (w === 0 ? '0 min' : w < 200 ? '< 1 min' : Math.round(w / 200) + ' min');
function update() {
  const t = $('in').value, w = (t.match(/\S+/g) || []).length;
  cells.Words.textContent = w;
  cells.Characters.textContent = [...t].length;
  cells['No spaces'].textContent = [...t.replace(/\s/g, '')].length;
  cells.Sentences.textContent = (t.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || []).filter((s) => /\w/.test(s)).length;
  cells.Paragraphs.textContent = t.split(/\n\s*\n/).filter((p) => p.trim()).length;
  cells['Reading time'].textContent = mins(w);
  cells['Speaking time'].textContent = w === 0 ? '0 min' : w < 130 ? '< 1 min' : Math.round(w / 130) + ' min';
}
$('in').oninput = update;
$('clr').onclick = () => { $('in').value = ''; update(); $('in').focus(); };
$('cp').onclick = (e) => copy($('in').value, e.target);
update();
