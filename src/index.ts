import 'dotenv/config';
import { connectCDP } from './cdp/client';
import { captureDOMSnapshot } from './cdp/dom-snapshot';
import { buildSemanticDom } from './dom/semantic-dom';
import { chunkDomTree } from './dom/chunker';
import { groundSelector } from './orchestrator/selector-grounder';
import { buildSelectorFromFlattened } from './dom/build-selector';

async function main() {
    const elements = ['Experience with cards where title is "Software Engineer"'];

    const { client, DOM, DOMSnapshot } = await connectCDP();
    console.log('Connected to CDP');

    for (const step of elements) {
        // Take a snapshot
        const snapshot = await captureDOMSnapshot(DOMSnapshot);

        // Build semantic DOM
        const semantic = buildSemanticDom(snapshot);

        // Chunk the DOM
        const chunks = chunkDomTree(semantic);

        // Ground the selector using the chunks
        const result = await groundSelector(step, chunks);
        console.log('Grounded UID:', result);

        if (!result.backendNodeId) {
            console.log('Could not find backendNodeId for step:', step);
            continue;
        }

        // Resolve selector
        const n = await DOM.resolveNode({
            backendNodeId: result.backendNodeId,
        });
        console.log('Resolved:', n);

        const nodeInfo = await DOM.describeNode({
            backendNodeId: result.backendNodeId!,
            depth: -1,
            pierce: true,
        });
        console.log('Node info:', nodeInfo);

        for (const c of nodeInfo.node.children || []) {
            console.log(c);
        }

        const { nodes } = await client.send('DOM.getFlattenedDocument', {
            depth: -1,
            pierce: true,
        });

        const selector = buildSelectorFromFlattened(nodes, result.backendNodeId);
        console.log('selector:', selector);
    }
    client.close();
}

main();
