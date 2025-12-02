import { DomChunk } from '../dom/chunker';

export const rankChunkPrompt = (description: string, chunk: DomChunk) => `
    You are ranking DOM chunks.

    User description:
    "${description}"

    This is a list of DOM elements (semantic nodes):
    ${JSON.stringify(chunk.nodes, null, 2)}

    Return a JSON:
    { "score": <0-1> }

    Score 1.0 if the chunk very likely contains the target element.
    Score 0.0 if unlikely.

    ONLY RETURN THE JSON. DO NOT RETURN ANY OTHER TEXT.
`;

export const groundingPrompt = (description: string, chunk: DomChunk) => `
    You are grounding an element.

    User description:
    "${description}"

    DOM chunk nodes (with uid):
    ${JSON.stringify(chunk.nodes, null, 2)}

    Return exactly this JSON:
    { "uid": <number>, backendNodeId: <number> }

    Return the uid and backendNodeId of the element that best matches the user description.
    Try your best that the element you return doesn't match duplicates.
    Prioritize #text nodes if possible
`;
