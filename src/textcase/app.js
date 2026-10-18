const $ = (id) => document.getElementById(id);
async function copy(text, btn) {
  try { await sreeos.clipboard.write(text); } catch { return; }
  if (btn) { const t = btn.dataset.t || (btn.dataset.t = btn.textContent); btn.textContent = 'Copied'; setTimeout(() => (btn.textContent = t), 900); }
}
const words = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1 $2').split(/[^A-Za-z0-9À-ɏ]+/).filter(Boolean);
const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
const perLine = (f) => (s) => s.split('\n').map(f).join('\n');
const MODES = {
  UPPERCASE: (s) => s.toUpperCase(),
  lowercase: (s) => s.toLowerCase(),
  'Title Case': (s) => s.toLowerCase().replace(/(^|[\s\-(])(\p{L})/gu, (_, a, b) => a + b.toUpperCase()),
  'Sentence case': (s) => s.toLowerCase().replace(/(^\s*|[.!?]\s+)(\p{L})/gu, (_, a, b) => a + b.toUpperCase()),
  camelCase: perLine((s) => words(s).map((w, i) => (i ? cap(w) : w.toLowerCase())).join('')),
  PascalCase: perLine((s) => words(s).map(cap).join('')),
  snake_case: perLine((s) => words(s).map((w) => w.toLowerCase()).join('_')),
  'CONSTANT_CASE': perLine((s) => words(s).map((w) => w.toUpperCase()).join('_')),
  'kebab-case': perLine((s) => words(s).map((w) => w.toLowerCase()).join('-')),
  'aLtErNaTiNg': (s) => [...s].map((c, i) => (i % 2 ? c.toUpperCase() : c.toLowerCase())).join(''),
};
for (const [name, fn] of Object.entries(MODES)) {
  const b = document.createElement('button'); b.textContent = name;
  b.onclick = () => { $('in').value = fn($('in').value); };
  $('btns').append(b);
}
$('cp').onclick = (e) => copy($('in').value, e.target);
$('clr').onclick = () => { $('in').value = ''; $('in').focus(); };
