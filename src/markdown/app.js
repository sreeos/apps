const $ = (id) => document.getElementById(id);
async function copy(text, btn) {
  try { await sreeos.clipboard.write(text); } catch { return; }
  if (btn) { const t = btn.dataset.t || (btn.dataset.t = btn.textContent); btn.textContent = 'Copied'; setTimeout(() => (btn.textContent = t), 900); }
}
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function inline(s) {
  const codes = [];
  s = s.replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return '\u0000' + (codes.length - 1) + '\u0000'; });
  s = esc(s);
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, u) => /^(https?:|data:image)/i.test(u) ? `<em>[image: ${alt}]</em>` : alt);
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, u) => /^(https?:|mailto:|#)/i.test(u) ? `<a href="${u}" target="_blank" rel="noopener noreferrer">${t}</a>` : t);
  s = s.replace(/\*\*([^*]+)\*\*|__([^_]+)__/g, (_, a, b) => `<strong>${a || b}</strong>`);
  s = s.replace(/\*([^*]+)\*|\b_([^_]+)_\b/g, (_, a, b) => `<em>${a || b}</em>`);
  s = s.replace(/~~([^~]+)~~/g, '<del>$1</del>');
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${esc(codes[i])}</code>`);
}
function render(md) {
  const lines = md.replace(/\r/g, '').split('\n'); const out = []; let i = 0;
  while (i < lines.length) {
    const ln = lines[i]; let m;
    if (/^```/.test(ln)) { const buf = []; i++; while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]); i++; out.push(`<pre><code>${esc(buf.join('\n'))}</code></pre>`); }
    else if (!ln.trim()) i++;
    else if ((m = /^(#{1,6})\s+(.*)$/.exec(ln))) { out.push(`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`); i++; }
    else if (/^(-{3,}|\*{3,})\s*$/.test(ln)) { out.push('<hr>'); i++; }
    else if (/^>/.test(ln)) { const buf = []; while (i < lines.length && /^>/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, '')); out.push(`<blockquote>${render(buf.join('\n'))}</blockquote>`); }
    else if (/^\s*([-*+]|\d+\.)\s+/.test(ln)) {
      const ord = /^\s*\d+\./.test(ln); const items = [];
      while (i < lines.length && (m = /^\s*(?:[-*+]|\d+\.)\s+(.*)$/.exec(lines[i]))) { items.push(`<li>${inline(m[1])}</li>`); i++; }
      out.push(`<${ord ? 'ol' : 'ul'}>${items.join('')}</${ord ? 'ol' : 'ul'}>`);
    } else {
      const buf = [];
      while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|```|>|\s*([-*+]|\d+\.)\s+)/.test(lines[i])) buf.push(lines[i++]);
      if (!buf.length) { buf.push(lines[i++]); }
      out.push(`<p>${buf.map(inline).join('<br>')}</p>`);
    }
  }
  return out.join('\n');
}
const src = $('src'), prev = $('prev');
let html = '', timer;
function update() { html = render(src.value); prev.innerHTML = html; }
src.oninput = () => { update(); clearTimeout(timer); timer = setTimeout(() => sreeos.fs.write('doc.md', src.value).catch(() => {}), 500); };
$('cp').onclick = (e) => copy(html, e.target);
sreeos.fs.readText('doc.md').catch(() => '# Hello\n\nWrite **Markdown** here. Your text is saved automatically.\n\n- Lists\n- `code`\n- [links](https://example.com)\n').then((t) => { src.value = t; update(); });
