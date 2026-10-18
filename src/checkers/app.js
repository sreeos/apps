const $ = (s) => document.querySelector(s);
const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || '#888';
const rnd = (n) => Math.floor(Math.random() * n);
const fmtT = (ms) => { const s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
let SAVE = {}; // best scores, kept in the app's data folder
const save = async () => { try { await sreeos.fs.write('best.json', JSON.stringify(SAVE)); } catch {} };
const load = async () => { try { SAVE = JSON.parse(await sreeos.fs.readText('best.json')) || {}; } catch { SAVE = {}; } };

let bd, turn, over, sel = -1, legal = [], sqs = [], last = [], quiet = 0;
const V = { r: 1, b: 1, R: 1.7, B: 1.7 };
const dirs = (p) => (p === 'r' ? [[-1, -1], [-1, 1]] : p === 'b' ? [[1, -1], [1, 1]] : [[-1, -1], [-1, 1], [1, -1], [1, 1]]);
const side = (p) => p.toLowerCase();
function initBoard() {
  const b = Array.from({ length: 8 }, () => Array(8).fill(''));
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if ((r + c) % 2) { if (r < 3) b[r][c] = 'b'; else if (r > 4) b[r][c] = 'r'; }
  return b;
}
function jumps(b, r, c, p, caps, path, out) {
  let found = false;
  for (const [dr, dc] of dirs(p)) {
    const mr = r + dr, mc = c + dc, tr = r + 2 * dr, tc = c + 2 * dc;
    if (tr < 0 || tr > 7 || tc < 0 || tc > 7) continue;
    const m = b[mr][mc];
    if (!m || side(m) === side(p) || caps.includes(mr * 8 + mc) || b[tr][tc]) continue;
    found = true;
    const crowned = (p === 'r' && tr === 0) || (p === 'b' && tr === 7), np = crowned ? p.toUpperCase() : p;
    const nc = [...caps, mr * 8 + mc], npath = [...path, tr * 8 + tc];
    if (crowned) out.push({ path: npath, caps: nc }); else jumps(b, tr, tc, np, nc, npath, out);
  }
  if (!found && caps.length) out.push({ path, caps });
}
function movesFor(b, s) {
  const caps = [], steps = [];
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    const p = b[r][c]; if (!p || side(p) !== s) continue;
    const tmp = b.map((row) => row.slice()); tmp[r][c] = '';
    const out = []; jumps(tmp, r, c, p, [], [], out);
    out.forEach((m) => caps.push({ from: r * 8 + c, ...m }));
    for (const [dr, dc] of dirs(p)) { const tr = r + dr, tc = c + dc; if (tr >= 0 && tr < 8 && tc >= 0 && tc < 8 && !b[tr][tc]) steps.push({ from: r * 8 + c, path: [tr * 8 + tc], caps: [] }); }
  }
  return caps.length ? caps : steps;
}
function apply(b, m) {
  const n = b.map((row) => row.slice()); let p = n[m.from >> 3][m.from & 7];
  n[m.from >> 3][m.from & 7] = ''; m.caps.forEach((k) => { n[k >> 3][k & 7] = ''; });
  const d = m.path[m.path.length - 1];
  if (p === 'r' && d >> 3 === 0) p = 'R'; if (p === 'b' && d >> 3 === 7) p = 'B';
  n[d >> 3][d & 7] = p; return n;
}
function evalB(b) { let s = 0; for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) { const p = b[r][c]; if (p) s += (side(p) === 'b' ? 1 : -1) * (V[p] + (p === 'b' ? r : p === 'r' ? 7 - r : 0) * 0.03); } return s; }
function search(b, s, d, a, bt) {
  const mv = movesFor(b, s);
  if (!mv.length) return s === 'b' ? -100 - d : 100 + d;
  if (!d) return evalB(b);
  let best = s === 'b' ? -1e9 : 1e9;
  for (const m of mv) {
    const v = search(apply(b, m), s === 'b' ? 'r' : 'b', d - 1, a, bt);
    if (s === 'b') { best = Math.max(best, v); a = Math.max(a, v); } else { best = Math.min(best, v); bt = Math.min(bt, v); }
    if (a >= bt) break;
  }
  return best;
}
function aiMove() {
  const mv = movesFor(bd, 'b'); let best = -1e9, pick = [];
  for (const m of mv) { const v = search(apply(bd, m), 'r', 4, -1e9, 1e9); if (v > best + 1e-9) { best = v; pick = [m]; } else if (Math.abs(v - best) < 1e-9) pick.push(m); }
  commit(pick[rnd(pick.length)]);
}
function render() {
  sqs.forEach((s, i) => {
    const r = i >> 3, c = i & 7, p = bd[r][c];
    s.className = 'sq' + ((r + c) % 2 ? ' dark' : '') + (i === sel ? ' sel' : '') + (last.includes(i) ? ' last' : '') + (sel >= 0 && legal.some((m) => m.from === sel && m.path[m.path.length - 1] === i) ? ' tgt' : '');
    s.innerHTML = p ? `<div class="pc ${side(p)}">${p === p.toUpperCase() ? '♛' : ''}</div>` : '';
    s.setAttribute('aria-label', `Row ${r + 1} column ${c + 1}: ${p ? (side(p) === 'r' ? 'red' : 'black') + (p === p.toUpperCase() ? ' king' : ' piece') : 'empty'}`);
  });
  const s = SAVE.rec || { w: 0, l: 0, d: 0 }; $('#best').textContent = `${s.w}W ${s.d}D ${s.l}L`;
}
function endGame(res) {
  over = true; const s = SAVE.rec = SAVE.rec || { w: 0, l: 0, d: 0 };
  s[res]++; save(); $('#info').textContent = res === 'w' ? 'You win!' : res === 'l' ? 'AI wins.' : 'Draw.'; render();
}
function commit(m) {
  const piece = bd[m.from >> 3][m.from & 7];
  quiet = m.caps.length || piece === piece.toLowerCase() ? 0 : quiet + 1; // draw after 40 quiet king moves
  bd = apply(bd, m); last = [m.from, m.path[m.path.length - 1]]; sel = -1;
  turn = turn === 'r' ? 'b' : 'r'; legal = movesFor(bd, turn);
  if (!legal.length) return endGame(turn === 'r' ? 'l' : 'w');
  if (quiet >= 40) return endGame('d');
  $('#info').textContent = turn === 'r' ? 'Your turn (red)' + (legal[0].caps.length ? ' - capture required' : '') : 'AI thinking...';
  render();
  if (turn === 'b') setTimeout(aiMove, 300);
}
function click(i) {
  if (over || turn !== 'r') return;
  const m = legal.find((x) => x.from === sel && x.path[x.path.length - 1] === i);
  if (m) return commit(m);
  sel = legal.some((x) => x.from === i) ? i : -1; render();
}
function start() { bd = initBoard(); turn = 'r'; over = false; sel = -1; last = []; quiet = 0; legal = movesFor(bd, 'r'); $('#info').textContent = 'Your turn (red)'; $('#msg').textContent = 'Click a piece, then a highlighted square. Captures are mandatory.'; render(); }
function init() {
  const st = $('#stage');
  for (let i = 0; i < 64; i++) { const b = document.createElement('button'); b.className = 'sq'; b.onclick = () => click(i); st.appendChild(b); sqs.push(b); }
  $('#restart').onclick = start; start();
}
load().then(init);
