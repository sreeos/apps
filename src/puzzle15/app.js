const $ = (s) => document.querySelector(s);
const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || '#888';
const rnd = (n) => Math.floor(Math.random() * n);
const fmtT = (ms) => { const s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
let SAVE = {}; // best scores, kept in the app's data folder
const save = async () => { try { await sreeos.fs.write('best.json', JSON.stringify(SAVE)); } catch {} };
const load = async () => { try { SAVE = JSON.parse(await sreeos.fs.readText('best.json')) || {}; } catch { SAVE = {}; } };

let n, tiles, moves, t0, tick, done, btns = [];
function solvable(a) {
  let inv = 0; const v = a.filter(Boolean);
  for (let i = 0; i < v.length; i++) for (let j = i + 1; j < v.length; j++) if (v[i] > v[j]) inv++;
  if (n % 2) return inv % 2 === 0;
  const rowFromBottom = n - Math.floor(a.indexOf(0) / n);
  return (inv + rowFromBottom) % 2 === 1;
}
function start() {
  n = +$('#size').value[0];
  do { tiles = [...Array(n * n).keys()].sort(() => Math.random() - 0.5); } while (!solvable(tiles) || solved());
  const st = $('#stage'); st.innerHTML = ''; btns = [];
  st.style.gridTemplateColumns = `repeat(${n}, ${n > 4 ? 64 : 76}px)`;
  for (let i = 0; i < n * n; i++) { const b = document.createElement('button'); if (n > 4) { b.style.width = b.style.height = '64px'; } b.onclick = () => tap(i); st.appendChild(b); btns.push(b); }
  moves = 0; t0 = 0; done = false; clearInterval(tick); $('#msg').textContent = 'Click a tile or use arrow keys to slide.'; render(); info();
}
function solved() { return tiles.every((v, i) => v === (i + 1) % (n * n)); }
function info() {
  $('#info').textContent = `Moves: ${moves}  Time: ${t0 ? fmtT((done || Date.now()) - t0) : '0:00'}`;
  const b = (SAVE.best || {})[n + 'x' + n]; $('#best').textContent = `Best: ${b ? b + ' moves' : '-'}`;
}
function render() { tiles.forEach((v, i) => { const b = btns[i]; b.textContent = v || ''; b.className = v ? (v === i + 1 ? 'ok' : '') : 'blank'; b.setAttribute('aria-label', v ? 'Tile ' + v : 'Empty'); }); }
function swapBlank(j) {
  const z = tiles.indexOf(0); [tiles[z], tiles[j]] = [tiles[j], tiles[z]];
}
function tap(i) {
  if (done) return;
  const z = tiles.indexOf(0), x = i % n, y = (i / n) | 0, zx = z % n, zy = (z / n) | 0;
  if (x !== zx && y !== zy) return;
  if (!t0) { t0 = Date.now(); tick = setInterval(info, 1000); }
  // slide a whole row/column toward the blank
  const step = x === zx ? Math.sign(y - zy) * n : Math.sign(x - zx);
  let p = z; while (p !== i) { tiles[p] = tiles[p + step]; p += step; } tiles[i] = 0;
  moves++; render(); finish(); info();
}
function key(dx, dy) { // arrow moves the tile in that direction into the blank, i.e. blank moves opposite
  const z = tiles.indexOf(0), x = z % n - dx, y = ((z / n) | 0) - dy;
  if (x < 0 || y < 0 || x >= n || y >= n) return; tap(y * n + x);
}
function finish() {
  if (!solved()) return;
  done = Date.now(); clearInterval(tick); const k = n + 'x' + n; SAVE.best = SAVE.best || {};
  const nb = !SAVE.best[k] || moves < SAVE.best[k]; if (nb) { SAVE.best[k] = moves; save(); }
  $('#msg').textContent = `Solved in ${moves} moves!` + (nb ? ' New best!' : '');
}
function init() {
  const st = $('#stage');
  st.addEventListener('keydown', (e) => {
    const m = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (m) { e.preventDefault(); key(...m); }
  });
  $('#restart').onclick = () => { start(); st.focus(); }; $('#size').onchange = start; $('#size').value = '4x4';
  start(); st.focus();
}
load().then(init);
