import { DomChunk } from '../dom/chunker';
import { rankChunk } from '../llm/chunk-ranking';
import { groundInChunk } from '../llm/grounding';

export async function groundSelector(description: string, chunks: DomChunk[]) {
    console.log('Grounding selector for description:', description);
    // Rank chunks to find top candidates
    const scores = await Promise.all(chunks.map((ch) => rankChunk(description, ch)));

    const top = scores
        .sort((a, b) => b.score - a.score)
        .slice(0, 2)
        .map((s) => s.id);

    // Ground in top chunks
    for (const id of top) {
        const chunk = chunks.find((c) => c.id === id);
        if (!chunk) continue;
        const result = await groundInChunk(description, chunk);
        if (result?.uid !== undefined) return result;
    }

    return null;
}
