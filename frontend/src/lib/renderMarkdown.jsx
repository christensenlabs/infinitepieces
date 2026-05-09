/**
 * Safe React-based markdown renderer for AI-generated content.
 * Handles bold, italic, and bullet points without dangerouslySetInnerHTML.
 */
export function renderMarkdown(text) {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    const bullet = line.match(/^[*-]\s*(.*)/);
    const content = bullet ? `\u2022 ${bullet[1]}` : line;
    const parts = content.split(/(\*\*.*?\*\*|\*.*?\*)/g).map((seg, j) => {
      if (seg.startsWith('**') && seg.endsWith('**')) return <strong key={j}>{seg.slice(2, -2)}</strong>;
      if (seg.startsWith('*') && seg.endsWith('*')) return <em key={j}>{seg.slice(1, -1)}</em>;
      return seg;
    });
    return <p key={i}>{parts}</p>;
  });
}
