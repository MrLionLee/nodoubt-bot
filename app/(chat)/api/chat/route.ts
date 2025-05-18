import {
    UIMessage,
    createDataStreamResponse,
    smoothStream,
    streamText,
} from 'ai';
import {   
    generateUUID,
    // getMostRecentUserMessage,
    // getTrailingMessageId,
  } from '@/lib/utils';
  import { systemPrompt } from '@/lib/ai/prompts';
  import { myProvider } from '@/lib/ai/providers';
  import {isProductionEnvironment} from '@/lib/constants'



export async function POST(request: Request) {
    try {
        const {
            messages,
            selectedChatModel,
        }: {
            id: string;
            messages: Array<UIMessage>;
            selectedChatModel: string;
        } = await request.json();


        // 调用 AI 模型进行对话
        return createDataStreamResponse({
            execute: (dataStream) => {
                // https://sdk.vercel.ai/docs/reference/ai-sdk-core/stream-text
                const result = streamText({
                    model: myProvider.languageModel(selectedChatModel),
                    system: systemPrompt({ selectedChatModel }),
                    messages,
                    maxSteps: 5,
                    experimental_activeTools:[],
                        // selectedChatModel === 'chat-model-reasoning'
                        //     ? []
                        //     : [
                        //         'getWeather',
                        //         // 'createDocument',
                        //         // 'updateDocument',
                        //         // 'requestSuggestions',
                        //     ],
                    experimental_transform: smoothStream({ chunking: 'word' }),
                    experimental_generateMessageId: generateUUID,
                    // 这里的 tools 需要和对应的 modal 匹配
                    tools: {
                        getWeather: {
                            description: "Get current weather",
                            parameters: {
                                type: "object",
                                properties: {
                                    location: {
                                        type: "string",
                                        description: "City name"
                                    }
                                },
                                required: ["location"]
                            },
                            execute: async (args: { location: string }) => {
                                console.log('Weather args:', args);
                                try {
                                    // return await getWeather(args.location);
                                    return {
                                        location,
                                        temperature: 25,
                                        unit: '°C'
                                    }
                                } catch (error) {
                                    console.error('Weather error:', error);
                                    return { error: 'Weather service unavailable' };
                                }
                            }
                        },
                        // createDocument: createDocument({ dataStream }),
                        // updateDocument: updateDocument({ session, dataStream }),
                        // requestSuggestions: requestSuggestions({
                        //   session,
                        //   dataStream,
                        // }),
                    },
                    onStepFinish: (step) => {
                        console.info('step  is -----', JSON.stringify(step, null, 2))
                    },
                    onFinish: async ({ response }) => {
                        //   if (session.user?.id) {
                        //     try {
                        //       const assistantId = getTrailingMessageId({
                        //         messages: response.messages.filter(
                        //           (message) => message.role === 'assistant',
                        //         ),
                        //       });

                        //       if (!assistantId) {
                        //         throw new Error('No assistant message found!');
                        //       }

                        //       const [, assistantMessage] = appendResponseMessages({
                        //         messages: [userMessage],
                        //         responseMessages: response.messages,
                        //       });

                        //       await saveMessages({
                        //         messages: [
                        //           {
                        //             id: assistantId,
                        //             chatId: id,
                        //             role: assistantMessage.role,
                        //             parts: assistantMessage.parts,
                        //             attachments:
                        //               assistantMessage.experimental_attachments ?? [],
                        //             createdAt: new Date(),
                        //           },
                        //         ],
                        //       });
                        //     } catch (_) {
                        //       console.error('Failed to save chat');
                        //     }
                        //   }
                        console.info('response is', response);
                    },
                    onError: (e) => {
                        console.info('error is', e)
                    },
                    experimental_telemetry: {
                        isEnabled: isProductionEnvironment, //  todo
                        functionId: 'stream-text',
                    },
                }); // AI 流文本生成

                console.info('result', result)
                result.consumeStream();

                result.mergeIntoDataStream(dataStream, {
                    sendReasoning: true,
                }); // 合并数据流
            },
            onError: () => {
                return 'Oops, an error occurred!';
            },
        });
    } catch (error) {
        return new Response('An error occurred while processing your request!' + error, {
            status: 404,
        });
    }
} 