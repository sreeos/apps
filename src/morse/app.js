const $ = (id) => document.getElementById(id);
const CODE = { A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..',
  0:'-----',1:'.----',2:'..---',3:'...--',4:'....-',5:'.....',6:'-....',7:'--...',8:'---..',9:'----.','.':'.-.-.-',',':'--..--','?':'..--..','!':'-.-.--','/':'-..-.','@':'.--.-.','-':'-....-',':':'---...',"'":'.----.' };
const REV = Object.fromEntries(Object.entries(CODE).map(([k, v]) => [v, k]));
const enc = (t) => t.toUpperCase().split(/\s+/).filter(Boolean).map((w) => [...w].map((c) => CODE[c] || '').filter(Boolean).join(' ')).join(' / ');
const dec = (m) => m.trim().split(/\s*\/\s*|\s{3,}/).map((w) => w.split(/\s+/).map((s) => REV[s] ?? (s ? '?' : '')).join('')).join(' ');
$('toM').onclick = () => { $('morse').value = enc($('text').value); };
$('toT').onclick = () => { $('text').value = dec($('morse').value); };
$('text').oninput = () => { $('morse').value = enc($('text').value); };
$('wpm').oninput = (e) => { $('wpmo').textContent = e.target.value + ' WPM'; };

let ctx, timers = [], osc;
function stop() { timers.forEach(clearTimeout); timers = []; if (osc) { try { osc.stop(); } catch {} osc = null; } $('lamp').classList.remove('on'); }
$('stop').onclick = stop;
$('play').onclick = () => {
  stop(); ctx = ctx || new AudioContext(); ctx.resume();
  const m = $('morse').value || enc($('text').value), unit = 1.2 / +$('wpm').value, t0 = ctx.currentTime + 0.1;
  const g = ctx.createGain(); g.gain.value = 0; osc = ctx.createOscillator(); osc.frequency.value = +$('hz').value; osc.connect(g); g.connect(ctx.destination); osc.start(t0);
  let t = 0;
  const beep = (len) => {
    g.gain.setTargetAtTime(0.4, t0 + t, 0.004); g.gain.setTargetAtTime(0, t0 + t + len * unit, 0.004);
    timers.push(setTimeout(() => $('lamp').classList.add('on'), (0.1 + t) * 1000), setTimeout(() => $('lamp').classList.remove('on'), (0.1 + t + len * unit) * 1000));
    t += len * unit;
  };
  for (const ch of m) {
    if (ch === '.') { beep(1); t += unit; } else if (ch === '-') { beep(3); t += unit; }
    else if (ch === ' ') t += 2 * unit; else if (ch === '/') t += 4 * unit;
  }
  timers.push(setTimeout(stop, (0.2 + t) * 1000));
};
$('morse').value = enc($('text').value);
