const $ = (s) => document.querySelector(s);
const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || '#888';
const rnd = (n) => Math.floor(Math.random() * n);
const fmtT = (ms) => { const s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
let SAVE = {}; // best scores, kept in the app's data folder
const save = async () => { try { await sreeos.fs.write('best.json', JSON.stringify(SAVE)); } catch {} };
const load = async () => { try { SAVE = JSON.parse(await sreeos.fs.readText('best.json')) || {}; } catch { SAVE = {}; } };

const EMO = ['🍎','🍌','🍇','🍒','🐶','🐱','🐸','🐵','🚗','🚀','⚽','🎸','🌙','⭐','🍕','🎈','🦊','🐙'];
let moves, first, lock, matched, pairs, t0, tick, btns, deck;
function start() {
  const [c, r] = $('#size').value.split('x').map(Number);
  pairs = c * r / 2; deck = EMO.slice(0, pairs).concat(EMO.slice(0, pairs)).sort(() => Math.random() - 0.5);
  if (c * r % 2) deck.push('');
  const st = $('#stage'); st.innerHTML = ''; st.style.gridTemplateColumns = `repeat(${c}, ${c > 5 ? 54 : 64}px)`; btns = [];
  deck.forEach((e, i) => {
    const b = document.createElement('button'); b.textContent = '?'; b.setAttribute('aria-label', 'Face-down card');
    if (c > 5) { b.style.width = b.style.height = '54px'; b.style.fontSize = '24px'; }
    b.onclick = () => flip(i); st.appendChild(b); btns.push(b);
  });
  moves = 0; first = -1; lock = false; matched = 0; t0 = 0; clearInterval(tick); info();
  $('#msg').textContent = 'Flip two cards at a time to find pairs.';
}
function info() {
  $('#info').textContent = `Moves: ${moves}  Time: ${t0 ? fmtT(Date.now() - t0) : '0:00'}`;
  const b = (SAVE.best || {})[$('#size').value]; $('#best').textContent = `Best: ${b ? b + ' moves' : '-'}`;
}
function show(i, on) { btns[i].textContent = on ? deck[i] : '?'; btns[i].className = on ? 'up' : ''; btns[i].setAttribute('aria-label', on ? 'Card ' + deck[i] : 'Face-down card'); }
function flip(i) {
  if (lock || i === first || btns[i].classList.contains('done')) return;
  if (!t0) { t0 = Date.now(); tick = setInterval(info, 1000); }
  show(i, true);
  if (first < 0) { first = i; return; }
  moves++; const a = first; first = -1; lock = true;
  if (deck[a] === deck[i]) {
    btns[a].className = btns[i].className = 'done'; matched++; lock = false;
    if (matched === pairs) win();
  } else setTimeout(() => { show(a, false); show(i, false); lock = false; }, 800);
  info();
}
function win() {
  clearInterval(tick); const k = $('#size').value; SAVE.best = SAVE.best || {};
  const nb = !SAVE.best[k] || moves < SAVE.best[k]; if (nb) { SAVE.best[k] = moves; save(); }
  $('#msg').textContent = `Done in ${moves} moves, ${fmtT(Date.now() - t0)}.` + (nb ? ' New best!' : ''); info();
}
function init() { $('#restart').onclick = start; $('#size').onchange = start; start(); }
load().then(init);
