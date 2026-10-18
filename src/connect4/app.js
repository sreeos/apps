const $ = (s) => document.querySelector(s);
const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || '#888';
const rnd = (n) => Math.floor(Math.random() * n);
const fmtT = (ms) => { const s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
let SAVE = {}; // best scores, kept in the app's data folder
const save = async () => { try { await sreeos.fs.write('best.json', JSON.stringify(SAVE)); } catch {} };
const load = async () => { try { SAVE = JSON.parse(await sreeos.fs.readText('best.json')) || {}; } catch { SAVE = {}; } };

const R = 6, C = 7;
let b, over, busy, cells = [], turn;
const DEPTH = { Easy: 1, Normal: 4, Hard: 6 };
const emptyBoard = () => Array.from({ length: C }, () => Array(R).fill(0)); // b[col][row], row 0 bottom
function drop(bd, c, p) { const r = bd[c].indexOf(0); if (r < 0) return -1; bd[c][r] = p; return r; }
function winLine(bd) {
  for (let c = 0; c < C; c++) for (let r = 0; r < R; r++) {
    const p = bd[c][r]; if (!p) continue;
    for (const [dc, dr] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
      const l = [[c, r]]; for (let k = 1; k < 4; k++) { const x = c + dc * k, y = r + dr * k; if (x < 0 || x >= C || y < 0 || y >= R || bd[x][y] !== p) break; l.push([x, y]); }
      if (l.length === 4) return l;
    }
  }
  return null;
}
function evalB(bd) { // heuristic for player 2 (AI)
  let s = 0;
  for (let r = 0; r < R; r++) s += bd[3][r] === 2 ? 3 : bd[3][r] === 1 ? -3 : 0;
  const win = (cs) => { const a = cs.filter((v) => v === 2).length, h = cs.filter((v) => v === 1).length, e = 4 - a - h; if (a && h) return 0; if (a === 3 && e) return 5; if (a === 2 && e === 2) return 2; if (h === 3 && e) return -6; if (h === 2 && e === 2) return -2; return 0; };
  for (let c = 0; c < C; c++) for (let r = 0; r < R; r++) for (const [dc, dr] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
    const cs = []; for (let k = 0; k < 4; k++) { const x = c + dc * k, y = r + dr * k; if (x < 0 || x >= C || y < 0 || y >= R) break; cs.push(bd[x][y]); }
    if (cs.length === 4) s += win(cs);
  }
  return s;
}
function search(bd, d, a, bt, p) {
  const w = winLine(bd); if (w) return bd[w[0][0]][w[0][1]] === 2 ? 1000 + d : -1000 - d;
  const mv = [3, 2, 4, 1, 5, 0, 6].filter((c) => bd[c][R - 1] === 0);
  if (!mv.length) return 0; if (!d) return evalB(bd);
  let best = p === 2 ? -1e9 : 1e9;
  for (const c of mv) {
    const r = drop(bd, c, p), v = search(bd, d - 1, a, bt, 3 - p); bd[c][r] = 0;
    if (p === 2) { best = Math.max(best, v); a = Math.max(a, v); } else { best = Math.min(best, v); bt = Math.min(bt, v); }
    if (a >= bt) break;
  }
  return best;
}
function aiMove() {
  const d = DEPTH[$('#level').value], mv = [3, 2, 4, 1, 5, 0, 6].filter((c) => b[c][R - 1] === 0);
  let best = -1e9, pick = mv[0];
  for (const c of mv) {
    const r = drop(b, c, 2), v = search(b, d - 1, -1e9, 1e9, 1) + (d === 1 ? rnd(3) : 0); b[c][r] = 0;
    if (v > best) { best = v; pick = c; }
  }
  play(pick);
}
function render(line) {
  for (let c = 0; c < C; c++) for (let r = 0; r < R; r++) cells[c + (R - 1 - r) * C].className = 'cell' + (b[c][r] ? ' p' + b[c][r] : '');
  if (line) line.forEach(([c, r]) => cells[c + (R - 1 - r) * C].classList.add('win'));
  const s = SAVE.rec || { w: 0, d: 0, l: 0 }; $('#best').textContent = `${s.w}W ${s.d}D ${s.l}L`;
}
function play(c) {
  if (over || b[c][R - 1]) return;
  drop(b, c, turn);
  const w = winLine(b), full = b.every((col) => col[R - 1]);
  render(w);
  if (w || full) {
    over = true; const s = SAVE.rec = SAVE.rec || { w: 0, d: 0, l: 0 };
    if (!w) { s.d++; $('#info').textContent = 'Draw!'; } else if (turn === 1) { s.w++; $('#info').textContent = 'You win!'; } else { s.l++; $('#info').textContent = 'AI wins!'; }
    save(); render(w); return;
  }
  turn = 3 - turn;
  $('#info').textContent = turn === 1 ? 'Your turn (red)' : 'AI thinking...';
  if (turn === 2) { busy = true; setTimeout(() => { aiMove(); busy = false; }, 200); }
}
function start() { b = emptyBoard(); over = false; busy = false; turn = 1; $('#info').textContent = 'Your turn (red)'; render(); $('#msg').textContent = 'Click a column, or use 1-7 keys.'; }
function init() {
  const st = $('#stage');
  st.innerHTML = '<div id="cols"></div><div id="board"></div>';
  for (let c = 0; c < C; c++) { const bt = document.createElement('button'); bt.textContent = '▼'; bt.setAttribute('aria-label', 'Drop in column ' + (c + 1)); bt.onclick = () => { if (!busy) play(c); }; $('#cols').appendChild(bt); }
  for (let i = 0; i < R * C; i++) { const d = document.createElement('div'); d.className = 'cell'; $('#board').appendChild(d); cells.push(d); }
  st.addEventListener('keydown', (e) => { if (/^[1-7]$/.test(e.key) && !busy) play(+e.key - 1); });
  $('#restart').onclick = () => { start(); st.focus(); }; $('#level').onchange = start;
  start(); st.focus();
}
load().then(init);
