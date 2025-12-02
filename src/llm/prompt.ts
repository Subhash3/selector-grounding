export const rankChunkPrompt = (description: string, chunk: any) => `
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
