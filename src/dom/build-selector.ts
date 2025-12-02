function makeSelectorFromNode(node: any) {
  // TEXT NODE (nodeType === 3)
  if (node.nodeType === 3) {
    const text = node.nodeValue?.trim();
    if (!text) return null;
    return `:text("${cssEscape(text)}")`;
  }

  const tag = node.nodeName?.toLowerCase() ?? "*";

  let id = "";
  let classes = [];

  if (node.attributes) {
    for (let i = 0; i < node.attributes.length; i += 2) {
      const name = node.attributes[i];
      const value = node.attributes[i + 1];

      if (name === "id") {
        id = `#${cssEscape(value)}`;
      } else if (name === "class") {
        const classList = value.trim().split(/\s+/);
        classes = classList.map((c: string) => `.${cssEscape(c)}`);
      }
    }
  }

  return tag + id + classes.join("");
}

// Escape CSS values
function cssEscape(text: string) {
  return text.replace(/["\\]/g, "\\$&");
}

function maybeAddTextSelector(node: any) {
  if (node.nodeType === 3) {
    const t = node.nodeValue?.trim();
    if (t) return `:has-text("${cssEscape(t)}")`;
    return "";
  }

  // ELEMENT: try to grab its direct text children
  const directText = (node.children || [])
    .filter((n: any) => n.nodeType === 3)
    .map((n: any) => n.nodeValue?.trim())
    .filter(Boolean)
    .join(" ");

  if (directText.length > 0 && directText.length < 60) {
    return `:has-text("${cssEscape(directText)}")`;
  }
  return "";
}

export function buildSelectorFromFlattened(nodes: any, backendNodeId: number) {
  const backendMap = new Map();
  const nodeIdMap = new Map();

  // Build lookup maps
  for (const n of nodes) {
    if (n.backendNodeId) backendMap.set(n.backendNodeId, n);
    if (n.nodeId) nodeIdMap.set(n.nodeId, n);
  }

  let current = backendMap.get(backendNodeId);
  if (!current) throw new Error("backendNodeId not in flattened document");

  const chain = [];
  let limit = 0;

  while (current && limit < 4) {
    const base = makeSelectorFromNode(current);
    if (base) chain.push(base);

    const textFilter = maybeAddTextSelector(current);
    if (textFilter) chain[chain.length - 1] += textFilter;

    if (!current.parentId) break;

    current = nodeIdMap.get(current.parentId);
    limit++;
  }

  return chain.reverse().join(" > ");
}
