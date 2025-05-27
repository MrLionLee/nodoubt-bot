import { createDeepSeek } from '@ai-sdk/deepseek'
// import {open} from '@ai-sdk/deepseek'
import { customProvider, extractReasoningMiddleware, wrapLanguageModel } from 'ai'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';


const deepseek = createDeepSeek({
    baseURL: 'https://api.chataiapi.com/v1',
    apiKey: process.env.DEEPSEEK_API_KEY ,
})

//   const openAI = createOpenAI({
//     // todo：发布前需要进行处理,使用合规的 api 或真正免费的 LLM
//     baseURL: "https://xiaoai.plus/v1",
//     apiKey: process.env.OPENAI_API_KEY
// })('gpt-3.5-turbo')

const kimiAI = createOpenAICompatible({
    name:'moonshot',
    baseURL: "https://api.moonshot.cn/v1",
    apiKey: process.env.OPENAI_KIMI_API_KEY
})('moonshot-v1-8k')

export const myProvider = customProvider({
    languageModels: {
        'chat-model':kimiAI,
        'chat-model-reasoning': deepseek('deepseek-reasoner'),
        // 'chat-model-reasoning': wrapLanguageModel({
        //     model:deepseek('deepseek-reasoner'),
        //     middleware: extractReasoningMiddleware({
        //         tagName:'think'
        //     })
        // }),
        'title-model': deepseek('deepseek-chat'),
    },
    imageModels: {
        // 'small-model': createOpenAI({
        //     baseURL: "https://xiaoai.plus/v1",
        //     apiKey: process.env.OPENAI_API_KEY
        // }),
    },
})