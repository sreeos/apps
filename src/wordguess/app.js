const $ = (s) => document.querySelector(s);
const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || '#888';
const rnd = (n) => Math.floor(Math.random() * n);
const fmtT = (ms) => { const s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
let SAVE = {}; // best scores, kept in the app's data folder
const save = async () => { try { await sreeos.fs.write('best.json', JSON.stringify(SAVE)); } catch {} };
const load = async () => { try { SAVE = JSON.parse(await sreeos.fs.readText('best.json')) || {}; } catch { SAVE = {}; } };

const WORDS = 'about above abuse actor acute admit adopt adult after again agent agree ahead alarm album alert alike alive allow alone along alter among anger angle angry apart apple apply arena argue arise armor array arrow aside asset avoid awake award aware badly baker bases basic basin basis beach began begin being below bench berry birth black blade blame blank blast blaze blend bless blind block blood bloom board boast bonus boost booth bound brain brand brave bread break breed brick bride brief bring broad broke brown brush build built bunch burst buyer cabin cable candy carry carve catch cause chain chair chalk charm chart chase cheap check cheek cheer chess chest chief child chill china chunk civil claim clash class clean clear clerk click cliff climb clock close cloth cloud coach coast color couch could count court cover crack craft crane crash crazy cream crime crisp cross crowd crown crush curve cycle daily dairy dance death debut delay delta dense depth diary dirty doubt dozen draft drain drama drank dream dress dried drift drill drink drive drove eager early earth eight elder elect elite empty enemy enjoy enter entry equal error essay event every exact exist extra fable faith false fancy fault feast fence fever fewer fiber field fifth fifty fight final first flame flash fleet flesh float flock flood floor flour fluid flush focus force forge forth forty forum found frame frank fraud fresh front frost fruit fully funny ghost giant given glass globe glory glove grace grade grain grand grant grape graph grasp grass grave great green greet grief grill grind gross group grown guard guess guest guide habit happy harsh heart heavy hello hence honey honor horse hotel house human humor hurry ideal image imply index inner input irony issue ivory jelly jewel joint judge juice knife knock known label labor large laser later laugh layer learn lease least leave legal lemon level light limit linen liver lobby local logic loose lover lower loyal lucky lunch magic major maker march match maybe mayor meant medal media melon mercy merge merit metal meter might minor minus mixed model money month moral motor mount mouse mouth movie music naive naval nerve never newly night noble noise north novel nurse ocean offer often olive onion opera orbit order other ought outer owner paint panel panic paper party pasta patch pause peace pearl phase phone photo piano piece pilot pitch pizza place plain plane plant plate plaza point polar pound power press price pride prime print prior prize proof proud prove pulse punch pupil queen query quest quick quiet quite quote radar radio raise rally ranch range rapid ratio reach react ready realm rebel refer reign relax reply rider ridge rifle right rigid rival river roast robot rocky roman rough round route royal rural salad sauce scale scare scene scope score scout screw sense serve seven shade shake shall shape share shark sharp sheep sheet shelf shell shift shine shirt shock shoot shore short shown sight silly since sixth sixty skill skirt sleep slice slide small smart smile smoke snake solar solid solve sorry sound south space spare spark speak speed spell spend spice spike spine split spoke sport staff stage stair stake stamp stand stare start state steam steel steep steer stick still stock stone stood store storm story stove strip stuck study stuff style sugar suite sunny super sweet swept swift swing sword table taste teach tenth thank theme there thick thing think third those three threw throw thumb tiger tight timer tired title toast today tooth topic total touch tough tower trace track trade trail train trait trash treat trend trial tribe trick tried troop truck truly trust truth twice uncle under union unity until upper upset urban usage usual valid value valve vapor vault verse video vigor virus visit vital vivid vocal voice waste watch water weary weave weigh weird whale wheat wheel where which while white whole whose widow width woman world worry worth would wound wrist write wrong yacht young youth zebra'.split(' ');
const ROWS = 6;
let target, row, cur, over, tiles = [], keyEls = {};
function start() {
  target = WORDS[rnd(WORDS.length)]; row = 0; cur = ''; over = false;
  tiles.forEach((t) => { t.className = 'tile'; t.textContent = ''; });
  Object.values(keyEls).forEach((k) => { k.classList.remove('ok', 'near', 'no'); });
  $('#msg').textContent = 'Type a 5-letter word and press Enter.'; info();
}
function info() {
  const s = SAVE.stats || { played: 0, won: 0, streak: 0, max: 0 };
  $('#info').textContent = `Try ${Math.min(row + 1, ROWS)}/${ROWS}`;
  $('#best').textContent = `Won ${s.won}/${s.played}  Streak ${s.streak} (best ${s.max})`;
}
function show() { for (let i = 0; i < 5; i++) { const t = tiles[row * 5 + i]; t.textContent = cur[i] || ''; t.className = 'tile' + (cur[i] ? ' fill' : ''); } }
function score(g) {
  const res = Array(5).fill('no'), left = {};
  for (let i = 0; i < 5; i++) { if (g[i] === target[i]) res[i] = 'ok'; else left[target[i]] = (left[target[i]] || 0) + 1; }
  for (let i = 0; i < 5; i++) if (res[i] !== 'ok' && left[g[i]] > 0) { res[i] = 'near'; left[g[i]]--; }
  return res;
}
function submit() {
  if (over) return;
  if (cur.length < 5) { $('#msg').textContent = 'Not enough letters.'; return; }
  if (!WORDS.includes(cur)) { $('#msg').textContent = 'Not in the word list.'; return; }
  const res = score(cur), rank = { no: 0, near: 1, ok: 2 };
  res.forEach((r, i) => {
    tiles[row * 5 + i].className = 'tile ' + r;
    const k = keyEls[cur[i]];
    const old = ['no', 'near', 'ok'].find((c) => k.classList.contains(c));
    if (!old || rank[r] > rank[old]) { k.classList.remove('ok', 'near', 'no'); k.classList.add(r); }
  });
  const won = cur === target; row++; $('#msg').textContent = '';
  if (won || row >= ROWS) {
    over = true; const s = SAVE.stats = SAVE.stats || { played: 0, won: 0, streak: 0, max: 0 };
    s.played++; if (won) { s.won++; s.streak++; s.max = Math.max(s.max, s.streak); } else s.streak = 0;
    save(); $('#msg').textContent = won ? `Solved in ${row}!` : `The word was ${target.toUpperCase()}.`;
  }
  cur = ''; info();
}
function key(k) {
  if (over) return;
  if (k === 'Enter') submit();
  else if (k === 'Backspace') { cur = cur.slice(0, -1); show(); }
  else if (/^[a-z]$/.test(k) && cur.length < 5) { cur += k; show(); }
}
function init() {
  const st = $('#stage');
  st.innerHTML = '<div id="board"></div><div id="kb"></div>';
  for (let i = 0; i < ROWS * 5; i++) { const t = document.createElement('div'); t.className = 'tile'; $('#board').appendChild(t); tiles.push(t); }
  ['qwertyuiop', 'asdfghjkl', '>zxcvbnm<'].forEach((r) => {
    const d = document.createElement('div');
    for (const c of r) {
      const b = document.createElement('button'), enter = c === '>', back = c === '<';
      b.textContent = enter ? 'Enter' : back ? 'Del' : c; if (enter || back) b.className = 'wide';
      b.onclick = () => { key(enter ? 'Enter' : back ? 'Backspace' : c); st.focus(); };
      if (!enter && !back) keyEls[c] = b; d.appendChild(b);
    }
    $('#kb').appendChild(d);
  });
  st.addEventListener('keydown', (e) => { if (e.ctrlKey || e.metaKey) return; const k = e.key.length === 1 ? e.key.toLowerCase() : e.key; if (k === 'Enter' || k === 'Backspace' || /^[a-z]$/.test(k)) { e.preventDefault(); key(k); } });
  $('#restart').onclick = () => { start(); st.focus(); };
  start(); st.focus();
}
load().then(init);
