'use server';

import { generateText, type Message } from 'ai';
import { myProvider } from '@/lib/ai/providers';
import { cookies } from 'next/headers';


// 调用 ai 生成 menu 的 title
export async function generateTitleFromUserMessage({
    message,
  }: {
    message: Message;
  }) {
    const { text: title } = await generateText({
      model: myProvider.languageModel('title-model'),
      system: `\n
      - you will generate a short title based on the first message a user begins a conversation with
      - ensure it is not more than 80 characters long
      - the title should be a summary of the user's message
      - do not use quotes or colons`,
      prompt: JSON.stringify(message),
    });
  
    return title;
  }

  export async function saveChatModelAsCookie(model: string) {
    const cookieStore = await cookies();
    cookieStore.set('chat-model', model);
  }