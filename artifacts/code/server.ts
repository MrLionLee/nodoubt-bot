import { z } from 'zod';
import { streamObject } from 'ai';
import { myProvider } from '@/lib/ai/providers';
import { codePrompt, updateDocumentPrompt } from '@/lib/ai/prompts';
import { createDocumentHandler } from '@/lib/artifacts/server';

export const codeDocumentHandler = createDocumentHandler<'code'>({
    kind: 'code',
    onCreateDocument: async ({
        title,
        dataStream
    }) => {
        let draftContent = ''
        const {  fullStream } = streamObject({
            model: myProvider.languageModel('artifact-model'),
            system: codePrompt,
            prompt: title,
            schema: z.object({
                code: z.string(),
            }),
        });

        for await (const delta of fullStream) {
            const { type } = delta;
            // TODO：目前使用 deepseek 生成的代码，无法获直接活到 json 对象，所以返回的 content 都是空，后续进行增强优化
            console.info('delta～～～～', delta);
            if (type === 'object') {
                const { object } = delta;
                const { code } = object;

                if (code) {
                    dataStream.writeData({
                        type: 'code-delta',
                        content: code ?? '',
                    });

                    draftContent = code;
                }
            }
        }

        return draftContent
    },
    onUpdateDocument: async ({ document, description, dataStream }) => {
        let draftContent = '';

        const { fullStream } = streamObject({
            model: myProvider.languageModel('artifact-model'),
            system: updateDocumentPrompt(document.content, 'code'),
            prompt: description,
            schema: z.object({
                code: z.string(),
            }),
        });

        for await (const delta of fullStream) {
            const { type } = delta;

            if (type === 'object') {
                const { object } = delta;
                const { code } = object;

                if (code) {
                    dataStream.writeData({
                        type: 'code-delta',
                        content: code ?? '',
                    });

                    draftContent = code;
                }
            }
        }

        return draftContent;
    },
})

