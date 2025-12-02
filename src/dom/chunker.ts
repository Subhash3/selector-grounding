import { SemanticNode } from './semantic-dom';

export interface DomChunk {
    id: string;
    nodes: SemanticNode[];
}

export function chunkDomTree(nodes: SemanticNode[], maxNodes = 500): DomChunk[] {
    console.log('Chunking dom tree');
    const chunks: DomChunk[] = [];

    let current: SemanticNode[] = [];
    let chunkIndex = 0;

    for (const node of nodes) {
        current.push(node);

        if (current.length >= maxNodes) {
            chunks.push({ id: `chunk-${chunkIndex++}`, nodes: current });
            current = [];
        }
    }

    if (current.length > 0) {
        chunks.push({ id: `chunk-${chunkIndex++}`, nodes: current });
    }

    return chunks;
}
