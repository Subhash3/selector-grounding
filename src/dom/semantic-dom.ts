import { CaptureSnapshotResponse } from '../third-party/types';

export interface SemanticNode {
    uid: number;
    tag: string;
    backendNodeId?: number;
    id?: string;
    classes?: string[];
    text?: string;
    role?: string;
    ariaLabel?: string;
    box?: { x: number; y: number; width: number; height: number };
    parent?: number;
    children?: number[];
}

export function buildSemanticDom(snapshot: CaptureSnapshotResponse): SemanticNode[] {
    console.log('Building semantic DOM from snapshot');
    const docs = (snapshot as any).documents || [];
    if (docs.length === 0) return [];

    const doc = docs[0] as any;
    const nodes = doc.nodes || {};
    const strings: string[] = doc.strings || (snapshot as any).strings || [];

    const getString = (v: any) => {
        if (v === undefined || v === null) return undefined;
        if (typeof v === 'string') return v;
        if (typeof v === 'number') return strings[v] ?? String(v);
        return undefined;
    };

    const nodeCount = (() => {
        const candidates = [nodes.nodeName, nodes.nodeType, nodes.backendNodeId, nodes.nodeValue, nodes.textValue];
        for (const c of candidates) {
            if (Array.isArray(c)) return c.length;
        }
        return 0;
    })();

    const parseAttributes = (attrArr: any) => {
        const out: Record<string, string> = {};
        if (!attrArr) return out;

        // If attributes is a flat array of strings: [name, value, name, value...]
        if (Array.isArray(attrArr) && attrArr.length > 0 && typeof attrArr[0] === 'string') {
            for (let i = 0; i < attrArr.length; i += 2) {
                const name = attrArr[i];
                const value = attrArr[i + 1] ?? '';
                out[name] = value;
            }
            return out;
        }

        // If attributes is a flat array of indices into strings: [nameIdx, valueIdx, ...]
        if (Array.isArray(attrArr) && attrArr.length > 0 && typeof attrArr[0] === 'number') {
            for (let i = 0; i < attrArr.length; i += 2) {
                const name = strings[attrArr[i]] ?? String(attrArr[i]);
                const value = strings[attrArr[i + 1]] ?? '';
                out[name] = value;
            }
            return out;
        }

        // Some snapshots expose attributes as nested arrays per node
        if (Array.isArray(attrArr) && attrArr.length === nodeCount && Array.isArray(attrArr[0])) {
            // caller should pass attrArr[i] in this case
            return parseAttributes(attrArr as any);
        }

        return out;
    };

    const layout = doc.layout || {};
    const boundingBoxes: number[] | undefined = layout.boundingBoxes;

    const result: SemanticNode[] = new Array(nodeCount).fill(null).map((_, i) => {
        const rawName = nodes.nodeName && nodes.nodeName[i];
        const tag = (getString(rawName) || '').toLowerCase();

        // Attributes can be per-node (array of arrays) or a single flat array per document.
        let attrs: Record<string, string> = {};
        if (nodes.attributes) {
            // If attributes is an array-of-arrays, pick element i
            if (
                Array.isArray(nodes.attributes) &&
                nodes.attributes.length === nodeCount &&
                Array.isArray(nodes.attributes[i])
            ) {
                attrs = parseAttributes(nodes.attributes[i]);
            } else if (Array.isArray(nodes.attributes) && typeof nodes.attributes[0] === 'string') {
                // Single flat attributes array for whole doc? unlikely per-node; ignore
                attrs = {};
            } else if (Array.isArray(nodes.attributes) && typeof nodes.attributes[0] === 'number') {
                // In some snapshots attributes is one flat array per node as pairs; there may be a parallel map of attributeOffsets but we can't rely on it.
                attrs = {};
            }
        }

        // Some snapshots provide attributes as parallel arrays 'attributeName' and 'attributeValue' - unsupported here.

        const id = attrs['id'] || undefined;
        const classStr = attrs['class'] || attrs['className'] || undefined;
        const classes = classStr ? classStr.split(/\s+/).filter(Boolean) : undefined;

        const ariaLabel = attrs['aria-label'] ?? attrs['ariaLabel'] ?? undefined;
        const role = attrs['role'] ?? undefined;

        // Text value fallback: nodes.textValue, nodes.nodeValue
        let text: string | undefined;
        if (nodes.textValue && Array.isArray(nodes.textValue)) text = getString(nodes.textValue[i]);
        if (!text && nodes.nodeValue && Array.isArray(nodes.nodeValue)) text = getString(nodes.nodeValue[i]);

        // Bounding box: layout.boundingBoxes is usually flat [x,y,width,height,...]
        let box: { x: number; y: number; width: number; height: number } | undefined;
        if (Array.isArray(boundingBoxes) && boundingBoxes.length >= (i + 1) * 4) {
            const base = i * 4;
            const x = Number(boundingBoxes[base]);
            const y = Number(boundingBoxes[base + 1]);
            const width = Number(boundingBoxes[base + 2]);
            const height = Number(boundingBoxes[base + 3]);
            if ([x, y, width, height].every((v) => !Number.isNaN(v))) {
                box = { x, y, width, height };
            }
        }

        return {
            uid: i,
            backendNodeId: nodes.backendNodeId ? nodes.backendNodeId[i] : undefined,
            tag,
            id,
            classes,
            text,
            role,
            ariaLabel,
            box,
            // parent/children filled later
        } as SemanticNode;
    });

    // Wire up parent/children when parentIndex is available
    const parentIndex: number[] | undefined = nodes.parentIndex;
    if (Array.isArray(parentIndex) && parentIndex.length === result.length) {
        for (let i = 0; i < result.length; i++) {
            const p = parentIndex[i];
            if (typeof p === 'number' && p >= 0 && p < result.length) {
                result[i]!.parent = p;
                const parentNode = result[p]!;
                if (!parentNode.children) parentNode.children = [];
                parentNode.children.push(i);
            }
        }
    }

    return result;
}
