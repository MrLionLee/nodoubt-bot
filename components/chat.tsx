"use client"

import { MultimodelInput } from '@/components/multimodal-input'
import { useChat } from '@ai-sdk/react'
import { generateUUID } from '@/lib/utils';
import type { UIMessage, Attachment } from 'ai'
import { useState } from 'react';
import { Messages } from './messages';


export function Chat({ id,
  initialMessages,
  selectedChatModel,
  isReadonly }: {
    id: string
    initialMessages: UIMessage[]
    selectedChatModel: string
    isReadonly: boolean
  }) {

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);


  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    status,
    stop,
    reload,
  } = useChat({
    api: '/api/chat', // 默认的 api 路径，可自定义， 当执行
    id,
    body: { id, selectedChatModel: selectedChatModel },
    initialMessages,
    experimental_throttle: 100,
    sendExtraMessageFields: true,
    generateId: generateUUID,
    onFinish: () => {
      console.info('onFinish')
      // mutate(unstable_serialize(getChatHistoryPaginationKey)); // 正在
    },
    onError: (e) => {
      console.error('error', e)
      // toast.error('An error occurred, please try again!');
    },
  });


  return (
    <div className="flex flex-col min-w-0 h-dvh bg-background">
      <Messages
        chatId={id}
        status={status}
        // votes={votes}
        messages={messages}
        setMessages={setMessages}
        reload={reload}
        isReadonly={isReadonly}
      // isArtifactVisible={isArtifactVisible}
      />

      <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
        <MultimodelInput
          chatId={id}
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          status={status}
          stop={stop}
          attachments={attachments}
          setAttachments={setAttachments}
          messages={messages}
          setMessages={setMessages}
          append={append}
        />
      </form>

    </div>
  );
}