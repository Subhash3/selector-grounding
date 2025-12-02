import { groundingPrompt } from './grounding-prompt';
import { llm } from './llm';

export async function groundInChunk(description: string, chunk: any) {
    console.log('Grounding in chunk:', chunk.id);
    const prompt = groundingPrompt(description, chunk);

    const response = await llm.query(prompt);

    const parsed = response.replace('```json', '').replace('```', '').trim();

    return JSON.parse(parsed);
}
