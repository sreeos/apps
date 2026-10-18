const $ = (s) => document.querySelector(s);
const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || '#888';
const rnd = (n) => Math.floor(Math.random() * n);
const fmtT = (ms) => { const s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
let SAVE = {}; // best scores, kept in the app's data folder
const save = async () => { try { await sreeos.fs.write('best.json', JSON.stringify(SAVE)); } catch {} };
const load = async () => { try { SAVE = JSON.parse(await sreeos.fs.readText('best.json')) || {}; } catch { SAVE = {}; } };

let sol, puz, val, notes, sel = 0, notesOn = false, t0, tick, done, cellEls = [], checked = false;
function cands(g, i) {
  const x = i % 9, y = (i / 9) | 0, used = new Set();
  for (let k = 0; k < 9; k++) { used.add(g[y * 9 + k]); used.add(g[k * 9 + x]); }
  const bx = x - x % 3, by = y - y % 3;
  for (let dy = 0; dy < 3; dy++) for (let dx = 0; dx < 3; dx++) used.add(g[(by + dy) * 9 + bx + dx]);
  const r = []; for (let n = 1; n <= 9; n++) if (!used.has(n)) r.push(n); return r;
}
function solve(g, limit, shuffle) { // count solutions up to limit; fills g with first found when shuffle
  let bi = -1, bc = null;
  for (let i = 0; i < 81; i++) if (!g[i]) { const c = cands(g, i); if (!bc || c.length < bc.length) { bi = i; bc = c; if (c.length < 2) break; } }
  if (bi < 0) return 1;
  if (shuffle) bc.sort(() => Math.random() - 0.5);
  let n = 0;
  for (const v of bc) { g[bi] = v; n += solve(g, limit - n, shuffle); if (n >= limit) return n; g[bi] = 0; }
  return n;
}
function generate(clues) {
  const full = Array(81).fill(0); solve(full, 1, true);
  const p = full.slice(), order = [...Array(81).keys()].sort(() => Math.random() - 0.5);
  let left = 81;
  for (const i of order) {
    if (left <= clues) break;
    const keep = p[i]; p[i] = 0;
    if (solve(p.slice(), 2, false) !== 1) p[i] = keep; else left--;
  }
  return { full, p };
}
function start() {
  const lv = $('#level').value, r = generate({ Easy: 40, Medium: 32, Hard: 26 }[lv]);
  sol = r.full; puz = r.p; val = puz.slice(); notes = Array.from({ length: 81 }, () => new Set());
  done = false; checked = false; t0 = Date.now(); clearInterval(tick); tick = setInterval(info, 1000);
  $('#msg').textContent = 'Select a cell, type 1-9. N toggles notes, Backspace erases.'; render(); info();
}
function info() {
  $('#info').textContent = `Time: ${fmtT(done ? done : Date.now() - t0)}`;
  const b = (SAVE.best || {})[$('#level').value]; $('#best').textContent = `Best: ${b ? fmtT(b) : '-'}`;
}
function render() {
  const sx = sel % 9, sy = (sel / 9) | 0;
  cellEls.forEach((c, i) => {
    const x = i % 9, y = (i / 9) | 0;
    let cls = 'c' + (puz[i] ? ' given' : val[i] ? ' user' : '');
    if (i === sel) cls += ' sel'; else if (x === sx || y === sy || (x / 3 | 0) === (sx / 3 | 0) && (y / 3 | 0) === (sy / 3 | 0)) cls += ' peer';
    if (val[sel] && val[i] === val[sel] && i !== sel) cls += ' same';
    if (checked && val[i] && val[i] !== sol[i]) cls += ' bad';
    c.className = cls;
    if (val[i]) c.textContent = val[i];
    else if (notes[i].size) c.innerHTML = '<div class="nt">' + [1,2,3,4,5,6,7,8,9].map((n) => `<span>${notes[i].has(n) ? n : ''}</span>`).join('') + '</div>';
    else c.textContent = '';
    c.setAttribute('aria-label', `Row ${y + 1} column ${x + 1}: ${val[i] || 'empty'}`);
  });
}
function put(n) {
  if (done || puz[sel]) return;
  checked = false;
  if (n === 0) { val[sel] = 0; notes[sel].clear(); }
  else if (notesOn) { if (val[sel]) return; notes[sel].has(n) ? notes[sel].delete(n) : notes[sel].add(n); }
  else {
    val[sel] = n; notes[sel].clear();
    const x = sel % 9, y = (sel / 9) | 0; // clear peer notes
    notes.forEach((s, i) => { if ((i % 9 === x || ((i / 9) | 0) === y || ((i % 9 / 3 | 0) === (x / 3 | 0) && ((i / 9 | 0) / 3 | 0) === (y / 3 | 0)))) s.delete(n); });
  }
  render();
  if (val.every((v, i) => v === sol[i])) {
    done = Date.now() - t0; clearInterval(tick);
    const lv = $('#level').value; SAVE.best = SAVE.best || {};
    const nb = !SAVE.best[lv] || done < SAVE.best[lv]; if (nb) { SAVE.best[lv] = done; save(); }
    $('#msg').textContent = 'Solved! ' + fmtT(done) + (nb ? ' - new best!' : ''); info();
  }
}
function init() {
  const st = $('#stage');
  for (let i = 0; i < 81; i++) { const c = document.createElement('div'); c.onclick = () => { sel = i; st.focus(); render(); }; st.appendChild(c); cellEls.push(c); }
  const pad = $('#pad');
  for (let n = 1; n <= 9; n++) { const b = document.createElement('button'); b.textContent = n; b.onclick = () => put(n); pad.appendChild(b); }
  const er = document.createElement('button'); er.textContent = 'Erase'; er.style.width = 'auto'; er.onclick = () => put(0); pad.appendChild(er);
  st.addEventListener('keydown', (e) => {
    const k = e.key;
    if (/^[1-9]$/.test(k)) put(+k);
    else if (k === 'Backspace' || k === 'Delete' || k === '0') put(0);
    else if (k === 'n' || k === 'N') $('#notes').click();
    else if (k.startsWith('Arrow')) {
      e.preventDefault(); const x = sel % 9, y = (sel / 9) | 0;
      if (k === 'ArrowLeft' && x > 0) sel--; if (k === 'ArrowRight' && x < 8) sel++; if (k === 'ArrowUp' && y > 0) sel -= 9; if (k === 'ArrowDown' && y < 8) sel += 9;
      render();
    }
  });
  $('#notes').onclick = () => { notesOn = !notesOn; $('#notes').textContent = 'Notes: ' + (notesOn ? 'on' : 'off'); st.focus(); };
  $('#check').onclick = () => {
    checked = true; render();
    const bad = val.some((v, i) => v && v !== sol[i]);
    $('#msg').textContent = bad ? 'Red cells are wrong.' : 'No mistakes so far.';
  };
  $('#restart').onclick = () => { $('#msg').textContent = 'Generating...'; setTimeout(start, 30); };
  $('#level').onchange = $('#restart').onclick;
  start(); st.focus();
}
load().then(init);
