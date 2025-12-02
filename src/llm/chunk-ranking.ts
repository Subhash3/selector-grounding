import { llm } from './llm';
import { rankChunkPrompt } from './prompt';

export async function rankChunk(description: string, chunk: any) {
    console.log('Ranking chunk:', chunk.id);
    const prompt = rankChunkPrompt(description, chunk);

    const response = await llm.query(prompt);

    const parsed = response.replace('```json', '').replace('```', '').trim();

    const score = JSON.parse(parsed).score;
    console.log(`Chunk ${chunk.id} scored ${score}`);

    return {
        id: chunk.id,
        score,
    };
}
