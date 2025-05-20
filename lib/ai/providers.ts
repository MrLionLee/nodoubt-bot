// import {createDeepSeek} from '@ai-sdk/deepseek'
// import {open} from '@ai-sdk/deepseek'
import { customProvider } from 'ai'
import { createOpenAI } from '@ai-sdk/openai';




export const myProvider = customProvider({
    languageModels: {
        'chat-model': createOpenAI({
            // todo：发布前需要进行处理,使用合规的 api 或真正免费的 LLM
            baseURL: "https://xiaoai.plus/v1",
            apiKey: process.env.OPENAI_API_KEY
        })('gpt-3.5-turbo'),
        // 'chat-model-reasoning': createOpenAI({
        //     baseURL: "https://xiaoai.plus/v1",
        //     apiKey: process.env.OPENAI_API_KEY
        // }),

        // 后面这个用 deepseek 模型
        'title-model': createOpenAI({
            baseURL: "https://xiaoai.plus/v1",
            apiKey: process.env.OPENAI_API_KEY
        })('gpt-3.5-turbo'), 
        // 'artifact-model': createOpenAI({
        //     baseURL: "https://xiaoai.plus/v1",
        //     apiKey: process.env.OPENAI_API_KEY
        // }),
    },
    imageModels: {
        // 'small-model': createOpenAI({
        //     baseURL: "https://xiaoai.plus/v1",
        //     apiKey: process.env.OPENAI_API_KEY
        // }),
    },
})