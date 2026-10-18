const $ = (id) => document.getElementById(id);
function update() {
  document.querySelectorAll('.grid output').forEach((o) => { o.textContent = o.previousElementSibling.value; });
  const h = $('c').value, rgb = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)).join(', ');
  const v = `${$('inset').checked ? 'inset ' : ''}${$('x').value}px ${$('y').value}px ${$('b').value}px ${$('s').value}px rgba(${rgb}, ${($('o').value / 100).toFixed(2)})`;
  $('box').style.boxShadow = v; $('box').style.background = $('bg').value; $('css').value = `box-shadow: ${v};`;
}
document.querySelectorAll('.grid input').forEach((i) => i.addEventListener('input', update));
$('copy').onclick = async () => {
  try { await sreeos.clipboard.write($('css').value); $('msg').textContent = 'Copied'; }
  catch { $('css').select(); $('msg').textContent = 'Selected - press Ctrl+C'; }
};
update();
