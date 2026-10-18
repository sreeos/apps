const $ = (s) => document.querySelector(s);
const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || '#888';
const rnd = (n) => Math.floor(Math.random() * n);
const fmtT = (ms) => { const s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
let SAVE = {}; // best scores, kept in the app's data folder
const save = async () => { try { await sreeos.fs.write('best.json', JSON.stringify(SAVE)); } catch {} };
const load = async () => { try { SAVE = JSON.parse(await sreeos.fs.readText('best.json')) || {}; } catch { SAVE = {}; } };

const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
let board, turn, over, cells = [];

const winner = (b) => { for (const l of LINES) if (b[l[0]] && b[l[0]] === b[l[1]] && b[l[0]] === b[l[2]]) return { p: b[l[0]], l }; return b.includes('') ? null : { p: 'draw', l: [] }; };
function minimax(b, p, depth) { // O maximises, X minimises
  const w = winner(b);
  if (w) return w.p === 'O' ? 10 - depth : w.p === 'X' ? depth - 10 : 0;
  let best = p === 'O' ? -99 : 99;
  for (let i = 0; i < 9; i++) if (!b[i]) {
    b[i] = p; const v = minimax(b, p === 'O' ? 'X' : 'O', depth + 1); b[i] = '';
    best = p === 'O' ? Math.max(best, v) : Math.min(best, v);
  }
  return best;
}
function aiMove() {
  let bestV = -99, moves = [];
  for (let i = 0; i < 9; i++) if (!board[i]) {
    board[i] = 'O'; const v = minimax(board, 'X', 1); board[i] = '';
    if (v > bestV) { bestV = v; moves = [i]; } else if (v === bestV) moves.push(i);
  }
  play(moves[rnd(moves.length)]);
}
function render() {
  cells.forEach((c, i) => { c.textContent = board[i]; c.className = board[i].toLowerCase(); c.setAttribute('aria-label', `Cell ${i + 1}: ${board[i] || 'empty'}`); });
  const s = SAVE.rec || { w: 0, d: 0, l: 0 };
  $('#best').textContent = `vs AI: ${s.w}W ${s.d}D ${s.l}L`;
}
function play(i) {
  if (over || board[i]) return;
  board[i] = turn;
  const w = winner(board);
  if (w) {
    over = true; render();
    if (w.p === 'draw') $('#info').textContent = 'Draw!'; else { w.l.forEach((k) => cells[k].classList.add('win')); $('#info').textContent = `${w.p} wins!`; }
    if ($('#mode').value === 'vs AI') {
      const s = SAVE.rec = SAVE.rec || { w: 0, d: 0, l: 0 };
      if (w.p === 'X') s.w++; else if (w.p === 'O') s.l++; else s.d++;
      save(); render();
    }
    return;
  }
  turn = turn === 'X' ? 'O' : 'X';
  $('#info').textContent = `${turn}'s turn`;
  render();
  if ($('#mode').value === 'vs AI' && turn === 'O') setTimeout(aiMove, 250);
}
function start() {
  board = Array(9).fill(''); turn = 'X'; over = false;
  $('#info').textContent = "X's turn"; render();
}
function init() {
  for (let i = 0; i < 9; i++) {
    const b = document.createElement('button'); b.onclick = () => { if (!($('#mode').value === 'vs AI' && turn === 'O')) play(i); };
    $('#stage').appendChild(b); cells.push(b);
  }
  $('#restart').onclick = start; $('#mode').onchange = start;
  $('#msg').textContent = 'Click a square. You are X.';
  start();
}
load().then(init);
