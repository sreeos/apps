const $ = (id) => document.getElementById(id);
const NOTES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B','C'];
const KEYS = 'awsedftgyhuj' + 'k';
let ctx, master, filter, analyser, held = {}, oct = 4;
const val = (id) => +$(id).value;
function show() { [['cut','cuto',' Hz'],['res','reso',''],['a','ao',' s'],['d','do',' s'],['s','so',''],['r','ro',' s']].forEach(([i, o, u]) => { $(o).textContent = val(i) + u; }); }
function init() {
  if (ctx) return ctx.resume();
  ctx = new AudioContext(); filter = ctx.createBiquadFilter(); master = ctx.createGain(); master.gain.value = 0.25;
  analyser = ctx.createAnalyser(); filter.connect(master); master.connect(analyser); analyser.connect(ctx.destination); params(); scope();
}
function params() { if (!ctx) return; filter.type = $('ftype').value; filter.frequency.value = val('cut'); filter.Q.value = val('res'); }
function on(i) {
  if (held[i]) return; init();
  const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime, a = val('a'), d = val('d'), s = Math.max(val('s'), 0.001);
  o.type = $('wave').value; o.frequency.value = 440 * Math.pow(2, (12 * (oct + 1) + i - 69) / 12);
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(1, t + a); g.gain.linearRampToValueAtTime(s, t + a + d);
  o.connect(g); g.connect(filter); o.start(); held[i] = { o, g }; $('kb').children[i].classList.add('down');
}
function off(i) {
  const h = held[i]; if (!h) return; delete held[i]; const t = ctx.currentTime, r = val('r');
  h.g.gain.cancelScheduledValues(t); h.g.gain.setValueAtTime(Math.max(h.g.gain.value, 0.0001), t); h.g.gain.linearRampToValueAtTime(0, t + r); h.o.stop(t + r + 0.05);
  $('kb').children[i].classList.remove('down');
}
NOTES.forEach((n, i) => {
  const b = document.createElement('button'); b.textContent = n; b.onpointerdown = () => on(i); b.onpointerup = b.onpointerleave = () => off(i); $('kb').append(b);
});
document.addEventListener('keydown', (e) => {
  if (e.repeat || e.ctrlKey || e.metaKey || e.target.tagName === 'SELECT') return;
  const k = e.key.toLowerCase();
  if (k === 'z') oct = Math.max(1, oct - 1); else if (k === 'x') oct = Math.min(7, oct + 1);
  const i = KEYS.indexOf(k); if (i >= 0) on(i);
});
document.addEventListener('keyup', (e) => { const i = KEYS.indexOf(e.key.toLowerCase()); if (i >= 0) off(i); });
document.querySelectorAll('input,select').forEach((el) => el.addEventListener('input', () => { show(); params(); }));
function scope() {
  const c = $('scope'), g = c.getContext('2d'), buf = new Uint8Array(analyser.fftSize);
  (function draw() {
    analyser.getByteTimeDomainData(buf); g.fillStyle = '#111'; g.fillRect(0, 0, c.width, c.height);
    g.strokeStyle = '#4fe38a'; g.beginPath();
    buf.forEach((v, i) => { const x = i / buf.length * c.width, y = v / 255 * c.height; i ? g.lineTo(x, y) : g.moveTo(x, y); });
    g.stroke(); requestAnimationFrame(draw);
  })();
}
show();
