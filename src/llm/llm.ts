import { generateText, LanguageModel } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

export class LLM {
    private model: LanguageModel;

    constructor() {
        const google = createGoogleGenerativeAI();
        this.model = google('gemini-2.5-flash');
    }

    async query(prompt: string): Promise<string> {
        const { text } = await generateText({
            model: this.model,
            prompt: prompt,
        });

        return text;
    }
}

export const llm = new LLM();
