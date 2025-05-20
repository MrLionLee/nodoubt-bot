"use client"
import type { UseChatHelpers } from '@ai-sdk/react';
import cx from 'classnames';
import type { Attachment, UIMessage } from 'ai';
import { useLocalStorageState,useSize } from 'ahooks';

import { Input } from 'antd';
const TextArea = Input.TextArea;
import {
  useRef, 
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect
} from 'react';
import { toast } from 'sonner';



// 输入控制区
export function MultimodelInput({
  chatId,
  input,
  setInput,
  status,
  // stop,
  attachments,
  setAttachments,
  // messages,
  // setMessages,
  // append,
  handleSubmit,
  className,
}: {
  chatId: string;
  input: UseChatHelpers['input'];
  setInput: UseChatHelpers['setInput'];
  status: UseChatHelpers['status'];
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<UIMessage>;
  setMessages: UseChatHelpers['setMessages'];
  append: UseChatHelpers['append'];
  handleSubmit: UseChatHelpers['handleSubmit'];
  className?: string;
}) {
  const winRef = useRef(null);
  const size = useSize(winRef);
  const width = size?.width
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // 替换原有textareaRef逻辑
  // const [autoSize, setAutoSize] = useState<boolean | { minRows: number, maxRows: number }>({
  //   minRows: 2,
  //   maxRows: 8
  // });

  const autoSize = {
    minRows: 2,
    maxRows: 8
  }
  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    // adjustHeight();
  };
  const [localStorageInput, setLocalStorageInput] = useLocalStorageState(
    'input',
    {
      defaultValue: ''
    }
  );

  useEffect(() => {
    if (textareaRef.current) {
      const domValue = textareaRef.current.value;
      // Prefer DOM value over localStorage to handle hydration
      const finalValue = domValue || localStorageInput || '';
      setInput(finalValue);
      // todo, 确定一下是否需要更新 textarea 的高度
    }
    // Only run once after hydration
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const submitForm = useCallback(() => {
    // 更新浏览器 url 
    window.history.replaceState({}, '', `/chat/${chatId}`);

    //  提交消息（携带附件）
    handleSubmit(undefined, {
      experimental_attachments: attachments,
    });

    // 重置状态
    setAttachments([]);
    setLocalStorageInput('');

    // todo：桌面端自动聚焦输入框
    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  }, [
    attachments,
    handleSubmit,
    setAttachments,
    setLocalStorageInput,
    width,
    chatId,
  ]);

  return (
    <div className="relative w-full flex flex-col gap-4" ref={winRef}>
      <TextArea
        autoSize={autoSize} //
        styles={{}}
        data-testid="multimodal-input"
        ref={textareaRef}
        placeholder="Send a message..."
        value={input}
        onChange={handleInput}
        className={cx(
          'min-h-[24px] max-h-[calc(75dvh)] overflow-hidden resize-none rounded-2xl !text-base bg-muted pb-10 dark:border-zinc-700',
          className,
        )}
        rows={4}
        autoFocus
        onKeyDown={(event) => {
          if (
            event.key === 'Enter' &&
            !event.shiftKey &&
            !event.nativeEvent.isComposing
          ) {
            event.preventDefault();

            if (status !== 'ready') {
              toast.error('Please wait for the model to finish its response!');
            } else {
              submitForm();
            }
          }
        }}
      />
    </div>
  );
}