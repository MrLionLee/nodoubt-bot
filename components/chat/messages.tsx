import type { UIMessage } from 'ai';
import type { UseChatHelpers } from '@ai-sdk/react';
import { PreviewMessage , ThinkingMessage} from '@/components/chat/message';
import { Greeting } from '@/components/greeting';
import equal from 'fast-deep-equal';
import { useScrollToBottom } from '@/components/use-scroll-to-bottom';


import { memo } from 'react';


interface MessagesProps {
    chatId: string;
    status: UseChatHelpers['status'];
    // votes: Array<Vote> | undefined;
    messages: UIMessage[];
    setMessages: UseChatHelpers['setMessages'];
    reload: UseChatHelpers['reload'];
    isReadonly: boolean;
    // isArtifactVisible: boolean;
}

export function PureMessages({
    chatId,
    status,
    // votes,
    messages,
    setMessages,
    reload,
    isReadonly,
}: MessagesProps) {

    const [messagesContainerRef, messagesEndRef] =
        useScrollToBottom<HTMLDivElement>();
    return (
        <div
            ref={messagesContainerRef}
            className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4"
        >

            {/* 初始化时，展示的默认信息 */}
            {messages.length === 0 && <Greeting />}

            {
                messages.map((message, index) => (
                    <PreviewMessage
                        key={message.id}
                        message={message}
                        isLoading={status === 'streaming' && messages.length - 1 === index}
                    />
                ))
            }

            {/* 真正数据没处理的时候，展示给用户看的 loading */}
            {status === 'submitted' &&
                messages.length > 0 &&
                messages[messages.length - 1].role === 'user' && <ThinkingMessage />}

            <div
                ref={messagesEndRef}
                className="shrink-0 min-w-[24px] min-h-[24px]"
            />
        </div>
    )
}


export const Messages = memo(PureMessages, (prevProps, nextProps) => {
    if (prevProps.status !== nextProps.status) return false;
    if (prevProps.status && nextProps.status) return false;
    if (prevProps.messages.length !== nextProps.messages.length) return false;
    if (!equal(prevProps.messages, nextProps.messages)) return false;
    return true;
});
