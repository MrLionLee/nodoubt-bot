
import type { UIMessage } from 'ai';
import type { UseChatHelpers } from '@ai-sdk/react';
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PencilEditIcon, SparklesIcon } from '../icons';
import ReactMarkdown from 'react-markdown';

import { Button, Tooltip } from 'antd';
import {cn} from'@/lib/utils';

export  const Message = ({
    // chatId,
    message,
    // vote,
    // isLoading,
    // setMessages,
    // reload,
    isReadonly,
  }: {
    chatId: string;
    message: UIMessage;
    // vote: Vote | undefined;
    isLoading: boolean;
    setMessages: UseChatHelpers['setMessages'];
    reload: UseChatHelpers['reload'];
    isReadonly: boolean;
  }) => {
    const [mode, setMode] = useState<'view' | 'edit'>('view');
  
    return (
      <AnimatePresence>
        <motion.div
          data-testid={`message-${message.role}`}
          className="w-full mx-auto max-w-3xl px-4 group/message"
          // 组件卸载时，退出动画。
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          data-role={message.role}
        >
          <div
            className={cn(
              'flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl',
              {
                'w-full': mode === 'edit',
                'group-data-[role=user]/message:w-fit': mode !== 'edit',
              },
            )}
          >
            {/* 左侧图标区 */}
            {message.role === 'assistant' && (
              <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
                <div className="translate-y-px">
                  <SparklesIcon size={14} />
                </div>
              </div>
            )}
  
            {/* 右侧内容区 */}
            <div className="flex flex-col gap-4 w-full">
              {/* {message.experimental_attachments && (
                <div
                  data-testid={`message-attachments`}
                  className="flex flex-row justify-end gap-2"
                >
                  {message.experimental_attachments.map((attachment) => (
                    <PreviewAttachment
                      key={attachment.url}
                      attachment={attachment}
                    />
                  ))}
                </div>
              )} */}
  
              {message.parts?.map((part, index) => {
                const { type } = part;
                const key = `message-${message.id}-part-${index}`;
  
                // if (type === 'reasoning') {
                //   return (
                //     <MessageReasoning
                //       key={key}
                //       isLoading={isLoading}
                //       reasoning={part.reasoning}
                //     />
                //   );
                // }
  
                if (type === 'text') {
                  if (mode === 'view') {
                    return (
                      <div key={key} className="flex flex-row gap-2 items-start">
                        {message.role === 'user' && !isReadonly && (
                          <Tooltip 
                            title="Edit message"
                          >
                              <Button
                                ghost
                                data-testid="message-edit-button"
                                className="px-2 h-fit rounded-full text-muted-foreground opacity-0 group-hover/message:opacity-100"
                                onClick={() => {
                                  setMode('edit');
                                }}
                              >
                                <PencilEditIcon />
                              </Button>
                          </Tooltip>
                        )}
  
                        <div
                          data-testid="message-content"
                          className={cn('flex flex-col gap-4', {
                            'bg-primary text-primary-foreground px-3 py-2 rounded-xl':
                              message.role === 'user',
                          })}
                        >
                          <ReactMarkdown>{part.text}</ReactMarkdown>
                        </div>
                      </div>
                    );
                  }
  
                  // if (mode === 'edit') {
                  //   return (
                  //     <div key={key} className="flex flex-row gap-2 items-start">
                  //       <div className="size-8" />
  
                  //       <MessageEditor
                  //         key={message.id}
                  //         message={message}
                  //         setMode={setMode}
                  //         setMessages={setMessages}
                  //         reload={reload}
                  //       />
                  //     </div>
                  //   );
                  // }
                }
  
                // if (type === 'tool-invocation') {
                //   const { toolInvocation } = part;
                //   const { toolName, toolCallId, state } = toolInvocation;
  
                //   if (state === 'call') {
                //     const { args } = toolInvocation;
  
                //     return (
                //       <div
                //         key={toolCallId}
                //         className={cx({
                //           skeleton: ['getWeather'].includes(toolName),
                //         })}
                //       >
                //         {toolName === 'getWeather' ? (
                //           <Weather />
                //         ) : toolName === 'createDocument' ? (
                //           <DocumentPreview isReadonly={isReadonly} args={args} />
                //         ) : toolName === 'updateDocument' ? (
                //           <DocumentToolCall
                //             type="update"
                //             args={args}
                //             isReadonly={isReadonly}
                //           />
                //         ) : toolName === 'requestSuggestions' ? (
                //           <DocumentToolCall
                //             type="request-suggestions"
                //             args={args}
                //             isReadonly={isReadonly}
                //           />
                //         ) : null}
                //       </div>
                //     );
                //   }
  
                //   if (state === 'result') {
                //     const { result } = toolInvocation;
  
                //     return (
                //       <div key={toolCallId}>
                //         {toolName === 'getWeather' ? (
                //           <Weather weatherAtLocation={result} />
                //         ) : toolName === 'createDocument' ? (
                //           <DocumentPreview
                //             isReadonly={isReadonly}
                //             result={result}
                //           />
                //         ) : toolName === 'updateDocument' ? (
                //           <DocumentToolResult
                //             type="update"
                //             result={result}
                //             isReadonly={isReadonly}
                //           />
                //         ) : toolName === 'requestSuggestions' ? (
                //           <DocumentToolResult
                //             type="request-suggestions"
                //             result={result}
                //             isReadonly={isReadonly}
                //           />
                //         ) : (
                //           <pre>{JSON.stringify(result, null, 2)}</pre>
                //         )}
                //       </div>
                //     );
                //   }
                // }
              })}
  
              {/* {!isReadonly && (
                <MessageActions
                  key={`action-${message.id}`}
                  chatId={chatId}
                  message={message}
                  vote={vote}
                  isLoading={isLoading}
                />
              )} */}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  };