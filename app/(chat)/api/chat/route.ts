import {
  type UIMessage,
  appendResponseMessages,
  smoothStream,
  streamText,
  createDataStream
} from 'ai';
import {
  generateUUID,
  getMostRecentUserMessage,
  getTrailingMessageId,
} from '@/lib/utils';
import { systemPrompt } from '@/lib/ai/prompts';
import { myProvider } from '@/lib/ai/providers';
import { isProductionEnvironment } from '@/lib/constants'
import { getChatById, saveChat, saveMessages, deleteChatById } from '@/lib/db/queries'
import { generateTitleFromUserMessage } from '../../actions'
import { auth } from '@/app/(auth)/auth';
import { createDocument } from '@/lib/ai/tools/create-document';
import { updateDocument } from '@/lib/ai/tools/update-document';
import { getWeather } from '@/lib/ai/tools/get-weather';

export async function POST(request: Request) {
  try {
    const {
      id,
      messages,
      selectedChatModel,
    }: {
      id: string;
      messages: Array<UIMessage>;
      selectedChatModel: string;
    } = await request.json();
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return new Response('Unauthorized, session is empty', { status: 401 });
    }

    // update chat history
    const chat = await getChatById({ id });

    const userMessage = getMostRecentUserMessage(messages);

    if (!userMessage) {
      return new Response('No user message found', { status: 400 });
    }

    if (!chat) {
      const title = await generateTitleFromUserMessage({
        message: userMessage,
      });

      await saveChat({ id, title, userId: session.user.id, });
    }

    // 保存 user 发出的  messages
    await saveMessages({
      messages: [
        {
          id: userMessage.id,
          chatId: id,
          role: 'user',
          parts: userMessage.parts,
          attachments: userMessage.experimental_attachments ?? [],
          createdAt: new Date(),
        },
      ],
    });



    // 调用 AI 模型进行对话
    const stream = createDataStream({
      execute: (dataStream) => {
        // https://sdk.vercel.ai/docs/reference/ai-sdk-core/stream-text
        const result = streamText({
          model: myProvider.languageModel(selectedChatModel),
          system: systemPrompt({ selectedChatModel }),
          messages,
          maxSteps: 5,
          experimental_activeTools:
            selectedChatModel === 'chat-model-reasoning'
              ? []
              : [
                'getWeather',
                'createDocument',
                'updateDocument',
              ],
          experimental_transform: smoothStream({ chunking: 'word' }),
          experimental_generateMessageId: generateUUID,
          // 这里的 tools 需要和对应的 modal 匹配
          tools: {
            getWeather,
            createDocument: createDocument({ dataStream, session }),
            updateDocument: updateDocument({ session, dataStream }),
          },
          onFinish: async ({ response }) => {
            if (session.user?.id) {
              try {
                const assistantId = getTrailingMessageId({
                  messages: response.messages.filter(
                    (message) => message.role === 'assistant',
                  ),
                });

                if (!assistantId) {
                  throw new Error('No assistant message found!');
                }

                const [, assistantMessage] = appendResponseMessages({
                  messages: [userMessage],
                  responseMessages: response.messages,
                });

                //  这里保留的是机器返回的信息
                await saveMessages({
                  messages: [
                    {
                      id: assistantId,
                      chatId: id,
                      role: assistantMessage.role,
                      parts: assistantMessage.parts,
                      attachments:
                        assistantMessage.experimental_attachments ?? [],
                      createdAt: new Date(),
                    },
                  ],
                });
              } catch (e) {
                console.error('Failed to save chat', e);
              }
            }
          },
          experimental_telemetry: {
            isEnabled: isProductionEnvironment, //  todo
            functionId: 'stream-text',
          },
        }); // AI 流文本生成
        // 消费数据流，当触发错误的时候，中止流
        result.consumeStream();

        result.mergeIntoDataStream(dataStream, {
          sendReasoning: true,  // 包含推理过程
        }); // 合并数据流
      },
      onError: (e) => {
        console.error('Error streaming response:', e);
        return 'Oops, an error occurred!';
      },
    });
    return new Response(stream)
  } catch (error) {
    return new Response(`An error occurred while processing your request!${error}`, {
      status: 404,
    });
  }
}


export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized ', { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    // chat 所属 userId 和当前用户不一致，则没有权限移除
    if (chat.userId !== session.user.id) {
      return new Response('Unauthorized, current chat is not belong to user', { status: 401 });
    }

    await deleteChatById({ id });

    return new Response('Chat deleted', { status: 200 });
  } catch (error) {
    console.error('error', error)
    return new Response('An error occurred while processing your request!', {
      status: 500,
    });
  }
}