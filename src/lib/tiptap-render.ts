// Lightweight server/client-safe Tiptap JSON → HTML renderer.
// Handles all node types produced by our TiptapEditor.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TNode = Record<string, any>;

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function renderText(node: TNode): string {
  let text = esc(node.text ?? "");
  for (const mark of node.marks ?? []) {
    switch (mark.type) {
      case "bold":   text = `<strong>${text}</strong>`; break;
      case "italic": text = `<em>${text}</em>`; break;
      case "strike": text = `<s>${text}</s>`; break;
      case "code":   text = `<code>${text}</code>`; break;
      case "link":   text = `<a href="${esc(mark.attrs?.href ?? "")}" target="_blank" rel="noopener noreferrer">${text}</a>`; break;
    }
  }
  return text;
}

function renderChildren(node: TNode): string {
  return (node.content ?? []).map(renderNode).join("");
}

function renderNode(node: TNode): string {
  switch (node.type) {
    case "doc":          return renderChildren(node);
    case "paragraph":    return `<p>${renderChildren(node) || "<br>"}</p>`;
    case "heading":      return `<h${node.attrs?.level ?? 2}>${renderChildren(node)}</h${node.attrs?.level ?? 2}>`;
    case "text":         return renderText(node);
    case "hardBreak":    return "<br>";
    case "horizontalRule": return "<hr>";
    case "blockquote":   return `<blockquote>${renderChildren(node)}</blockquote>`;
    case "bulletList":   return `<ul>${renderChildren(node)}</ul>`;
    case "orderedList":  return `<ol>${renderChildren(node)}</ol>`;
    case "listItem":     return `<li>${renderChildren(node)}</li>`;
    case "image": {
      const src = node.attrs?.src ?? "";
      if (!src) return ""; // skip empty placeholder images
      const styleAttr = node.attrs?.width ? ` style="max-width:${esc(node.attrs.width)};width:100%"` : "";
      return `<img src="${esc(src)}" alt="${esc(node.attrs?.alt ?? "")}"${styleAttr} />`;
    }
    case "codeBlock":    return `<pre><code>${renderChildren(node)}</code></pre>`;
    default:             return renderChildren(node);
  }
}

export function tiptapToHtml(json: object | null | undefined): string {
  if (!json) return "";
  try {
    return renderNode(json as TNode);
  } catch {
    return "";
  }
}
