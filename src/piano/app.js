const $ = (id) => document.getElementById(id);
const NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const KEYS = 'awsedftgyhujkolp;'.split(''); // semitones 0..16 from the base C
let ctx, held = {};
const WHITE = 14, W = 100 / WHITE;
const base = () => 12 * (+$('oct').value + 1); // MIDI of C
const freq = (m) => 440 * Math.pow(2, (m - 69) / 12);

// 2 octaves + top C = 15 white keys; draw 24 semitones + C
const kb = $('kb'); let wi = 0; const els = [];
for (let s = 0; s <= 24; s++) {
  const black = NAMES[s % 12].includes('#');
  const b = document.createElement('button');
  b.className = 'k ' + (black ? 'b' : 'w'); b.dataset.s = s;
  b.setAttribute('aria-label', NAMES[s % 12] + (Math.floor(s / 12) + 1));
  if (black) { b.style.left = `calc(${wi * 100 / 15}% - 2.2%)`; b.style.width = '4.4%'; }
  else { b.style.left = `${wi * 100 / 15}%`; b.style.width = `${100 / 15}%`; wi++; if (s % 12 === 0) b.textContent = 'C' + (Math.floor(s / 12) + 1); }
  els.push(b); kb.append(b);
}
function on(s) {
  if (held[s]) return;
  ctx = ctx || new AudioContext(); ctx.resume();
  const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime, v = +$('vol').value * 0.5;
  o.type = $('wave').value; o.frequency.value = freq(base() + s);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.01); g.gain.exponentialRampToValueAtTime(Math.max(v * 0.4, 0.001), t + 0.4);
  o.connect(g); g.connect(ctx.destination); o.start();
  held[s] = { o, g }; els[s].classList.add('down');
}
function off(s) {
  const h = held[s]; if (!h) return; delete held[s];
  const t = ctx.currentTime; h.g.gain.cancelScheduledValues(t); h.g.gain.setValueAtTime(Math.max(h.g.gain.value, 0.001), t);
  h.g.gain.exponentialRampToValueAtTime(0.001, t + 0.25); h.o.stop(t + 0.3);
  els[s].classList.remove('down');
}
const MAP = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]; // key index -> semitone
kb.onpointerdown = (e) => { const b = e.target.closest('.k'); if (b) { b.setPointerCapture?.(e.pointerId); on(+b.dataset.s); } };
kb.onpointerup = kb.onpointercancel = (e) => { const b = e.target.closest('.k'); if (b) off(+b.dataset.s); };
document.addEventListener('keydown', (e) => { if (e.repeat || e.ctrlKey || e.metaKey || e.target.tagName === 'SELECT') return; const i = KEYS.indexOf(e.key.toLowerCase()); if (i >= 0) on(MAP[i]); });
document.addEventListener('keyup', (e) => { const i = KEYS.indexOf(e.key.toLowerCase()); if (i >= 0) off(MAP[i]); });
