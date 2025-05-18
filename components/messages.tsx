import type { UIMessage } from 'ai';
import type { UseChatHelpers } from '@ai-sdk/react';
import { Message } from './message';
import { Greeting } from './greeting';


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

export function Messages({
    chatId,
    status,
    // votes,
    messages,
    setMessages,
    reload,
    isReadonly,
}: MessagesProps) {
    return (
        <div
            className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4"
        >

            {/* 初始化时，展示的默认信息 */}
            {messages.length === 0 && <Greeting />}

            {
                messages.map((message, index) => (
                    <Message
                        key={message.id}
                        chatId={chatId}
                        message={message}
                        isLoading={status === 'streaming' && messages.length - 1 === index}
                        // vote={
                        //     votes
                        //         ? votes.find((vote) => vote.messageId === message.id)
                        //         : undefined
                        // }

                        setMessages={setMessages}
                        reload={reload}
                        isReadonly={isReadonly}
                    />
                ))
            }
        </div>
    )
}