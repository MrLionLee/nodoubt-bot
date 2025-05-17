"use client"

import { MultimodelInput } from '@/components/multimodal-input'
import { useChat } from '@ai-sdk/react'
import {  generateUUID  } from '@/lib/utils';
import type { UIMessage,Attachment } from 'ai'
import { useState } from 'react';


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
      console.error('error',e)
      // toast.error('An error occurred, please try again!');
    },
  });


  return (
    <div>
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
    </div>
  );
}