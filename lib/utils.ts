import { twMerge } from 'tailwind-merge';
import { type ClassValue, clsx } from 'clsx';

import type {
    UIMessage,
    CoreAssistantMessage,
    CoreToolMessage,
} from 'ai';

type ResponseMessageWithoutId = CoreToolMessage | CoreAssistantMessage;
type ResponseMessage = ResponseMessageWithoutId & { id: string };


interface ApplicationError extends Error {
    info: string;
    status: number;
}


export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

export const fetcher = async (url: string) => {
    const res = await fetch(url);

    if (!res.ok) {
        const error = new Error(
            'An error occurred while fetching the data.',
        ) as ApplicationError;

        error.info = await res.json();
        error.status = res.status;

        throw error;
    }

    return res.json();
};

// 筛选出那些 user 发出的 message，然后取最后一个
export function getMostRecentUserMessage(messages: Array<UIMessage>) {
    const userMessages = messages.filter((message) => message.role === 'user');
    return userMessages.at(-1);
}

export function getTrailingMessageId({
    messages,
}: {
    messages: Array<ResponseMessage>;
}): string | null {
    const trailingMessage = messages.at(-1);

    if (!trailingMessage) return null;

    return trailingMessage.id;
}



export function sanitizeResponseMessages({
    messages,
    reasoning,
  }: {
    messages: Array<ResponseMessage>;
    reasoning: string | undefined;
  }) {
    const toolResultIds: Array<string> = [];
  
    for (const message of messages) {
      if (message.role === 'tool') {
        for (const content of message.content) {
          if (content.type === 'tool-result') {
            // 工具的最终产物需要展示， tool-call 不需要展示
            toolResultIds.push(content.toolCallId);
          }
        }
      }
    }
  
    const messagesBySanitizedContent = messages.map((message) => {
        // user message 不需要 sanitize
      if (message.role !== 'assistant') return message;
  
      if (typeof message.content === 'string') return message;
  
      const sanitizedContent = message.content.filter((content) =>
        content.type === 'tool-call'
          ? toolResultIds.includes(content.toolCallId)
          : content.type === 'text'
            ? content.text.length > 0
            : true,
      );
  
      if (reasoning) {
        // @ts-expect-error: reasoning message parts in sdk is wip
        sanitizedContent.push({ type: 'reasoning', reasoning });
      }
  
      return {
        ...message,
        content: sanitizedContent,
      };
    });
  
    return messagesBySanitizedContent.filter(
      (message) => message.content.length > 0,
    );
  }