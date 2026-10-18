const $ = (s) => document.querySelector(s);
const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || '#888';
const rnd = (n) => Math.floor(Math.random() * n);
const fmtT = (ms) => { const s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
let SAVE = {}; // best scores, kept in the app's data folder
const save = async () => { try { await sreeos.fs.write('best.json', JSON.stringify(SAVE)); } catch {} };
const load = async () => { try { SAVE = JSON.parse(await sreeos.fs.readText('best.json')) || {}; } catch { SAVE = {}; } };

const FREQ = [262, 330, 392, 523], KEYS = ['1', '2', '3', '4'];
let seq, pos, state, pads = [], actx;
function tone(i, ms) {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator(), g = actx.createGain(); o.frequency.value = FREQ[i]; o.type = 'sine';
    g.gain.value = 0.15; o.connect(g); g.connect(actx.destination); o.start(); o.stop(actx.currentTime + ms / 1000);
  } catch {}
}
function flash(i, ms = 350) { pads[i].classList.add('lit'); tone(i, ms); return new Promise((r) => setTimeout(() => { pads[i].classList.remove('lit'); setTimeout(r, 120); }, ms)); }
function info() { $('#info').textContent = `Level: ${seq.length}`; $('#best').textContent = `Best: ${SAVE.best || 0}`; }
async function playSeq() {
  const my = seq; state = 'show'; $('#msg').textContent = 'Watch...'; pos = 0;
  await new Promise((r) => setTimeout(r, 500));
  for (const i of seq) { if (state !== 'show' || seq !== my) return; await flash(i, Math.max(150, 380 - seq.length * 12)); }
  state = 'input'; $('#msg').textContent = 'Your turn!';
}
function next() { seq.push(rnd(4)); info(); playSeq(); }
function start() { seq = []; state = 'idle'; const id = ++start.id; setTimeout(() => { if (id === start.id) next(); }, 100); }
start.id = 0;
async function press(i) {
  if (state !== 'input') return;
  const ok = seq[pos] === i; state = 'busy';
  await flash(i, 200);
  if (!ok) {
    state = 'over'; const sc = seq.length - 1;
    if (sc > (SAVE.best || 0)) { SAVE.best = sc; save(); }
    $('#msg').textContent = `Wrong! You reached level ${sc}. Press New game.`; info(); return;
  }
  pos++; state = 'input';
  if (pos === seq.length) { state = 'busy'; $('#msg').textContent = 'Good!'; setTimeout(next, 500); }
}
function init() {
  const st = $('#stage');
  ['Green', 'Red', 'Yellow', 'Blue'].forEach((n, i) => { const b = document.createElement('button'); b.textContent = KEYS[i]; b.setAttribute('aria-label', n + ' pad'); b.onclick = () => press(i); st.appendChild(b); pads.push(b); });
  st.addEventListener('keydown', (e) => { const i = KEYS.indexOf(e.key); if (i >= 0) press(i); });
  $('#restart').onclick = () => { start(); st.focus(); };
  $('#msg').textContent = 'Press 1-4 or click the pads.'; seq = []; info(); start();
}
load().then(init);
