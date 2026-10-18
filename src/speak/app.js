const $ = (id) => document.getElementById(id);
const ss = window.speechSynthesis;
let voices = [];
function outs() { document.querySelectorAll('output').forEach((o) => { o.textContent = o.previousElementSibling.value; }); }
function loadVoices() {
  if (!ss) return;
  voices = ss.getVoices(); const cur = $('v').value;
  $('v').replaceChildren(...voices.map((v, i) => { const o = new Option(`${v.name} (${v.lang})`, i); return o; }));
  if (cur) $('v').value = cur; else { const d = voices.findIndex((v) => v.default); if (d >= 0) $('v').value = d; }
  if (!voices.length) $('msg').textContent = 'No voices available';
}
if (!ss) { $('msg').textContent = 'Speech synthesis is not available here'; $('go').disabled = true; }
else { loadVoices(); ss.onvoiceschanged = loadVoices; }
$('go').onclick = () => {
  ss.cancel();
  const u = new SpeechSynthesisUtterance($('t').value);
  if (voices[$('v').value]) u.voice = voices[$('v').value];
  u.rate = +$('rate').value; u.pitch = +$('pitch').value; u.volume = +$('vol').value;
  u.onstart = () => { $('msg').textContent = 'Speaking…'; };
  u.onend = () => { $('msg').textContent = ''; $('pause').textContent = 'Pause'; };
  u.onerror = (e) => { if (e.error !== 'canceled' && e.error !== 'interrupted') $('msg').textContent = 'Error: ' + e.error; };
  ss.speak(u);
};
$('pause').onclick = () => { if (ss.paused) { ss.resume(); $('pause').textContent = 'Pause'; } else { ss.pause(); $('pause').textContent = 'Resume'; } };
$('stop').onclick = () => { ss.cancel(); $('msg').textContent = ''; $('pause').textContent = 'Pause'; };
document.querySelectorAll('input').forEach((i) => i.addEventListener('input', outs));
outs();
