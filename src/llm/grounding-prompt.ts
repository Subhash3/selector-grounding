export const groundingPrompt = (description: string, chunk: any) => `
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
