"use client"
import type { UseChatHelpers } from '@ai-sdk/react';
import cx from 'classnames';
import type { Attachment, UIMessage } from 'ai';
import { useLocalStorage, useWindowSize } from 'usehooks-ts';
import {
  memo,
  useState,
  type ChangeEvent
} from 'react';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { PaperclipIcon, ArrowUpIcon, StopIcon } from '../icons';
import { PreviewAttachment } from './preview-attachment';

import {
  useRef,
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect
} from 'react';
import { toast } from 'sonner';
import equal from 'fast-deep-equal';




// 输入控制区
export function PureMultimodalInput({
  chatId,
  input,
  setInput,
  status,
  stop,
  attachments,
  setAttachments,
  // messages,
  setMessages,
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { width } = useWindowSize()

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, []);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
    }
  };

  const resetHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = '98px';
    }
  };

  const [localStorageInput, setLocalStorageInput] = useLocalStorage(
    'input',
    '',
  );

  useEffect(() => {
    if (textareaRef.current) {
      const domValue = textareaRef.current.value;
      // Prefer DOM value over localStorage to handle hydration
      const finalValue = domValue || localStorageInput || '';
      setInput(finalValue);
      adjustHeight();
    }
    // Only run once after hydration
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // 更新输入值
    setLocalStorageInput(input);
  }, [input, setLocalStorageInput]);

  const handleInput = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);

  const submitForm = useCallback(() => {
    // 跳转到详情页 
    window.history.replaceState({}, '', `/chat/${chatId}`);

    //  提交消息（携带附件）
    handleSubmit(undefined, {
      experimental_attachments: attachments,
    });

    // 重置状态
    setAttachments([]);
    setLocalStorageInput('');
    resetHeight();

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

  async function fileToBase64(file: File) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result); // 包含完整 Data URI
      reader.onerror = error => reject(error);
    });
  }

  

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    // 这里判断一下，如果允许读取 png，可以通过 blob 缓存图片，放置多次上传
    // 如果模型不允许直接调用 png 格式的缓存图片，则转换成 base64，直接传输；
    const disabledPngModel = true
    if (disabledPngModel) {
      // TODO attachments 限制
      if (file.size > 1024 * 1024)  {
        toast.error('图片大小不得超过 1M');
      }else {
        try {
          // 将 url 转成 base64，部分 kimi-vision 不支持直接读取 png，所以要转成 base64 再输入模型
          const base64Url = await fileToBase64(file)
          return {
            url: base64Url,
            name: file.name,
            contentType: file.type,
          };
        } catch (error) {
          console.error(error);
          toast.error('Failed to exchange the picture to base64, please try again!');
        }
      }
    }else {
      try {
        const response = await fetch('/api/files/upload', {
          method: 'POST',
          body: formData,
        });
  
        if (response.ok) {
          const data = await response.json();
          const { url, pathname, contentType } = data;
  
          return {
            url,
            name: pathname,
            contentType: contentType,
          };
        }
        const { error } = await response.json();
        toast.error(error);
      } catch (error) {
        console.error(error);
        toast.error('Failed to upload file, please try again!');
      }
    }
  };

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      setUploadQueue(files.map((file) => file.name));

      try {
        const uploadPromises = files.map((file) => uploadFile(file));
        const uploadedAttachments = await Promise.all(uploadPromises);
        const successfullyUploadedAttachments = uploadedAttachments.filter(
          (attachment) => attachment !== undefined,
        )
        setAttachments((currentAttachments) => [
          ...currentAttachments,
          ...successfullyUploadedAttachments,
        ]);
      } catch (error) {
        console.error('Error uploading files!', error);
      } finally {
        setUploadQueue([]);
      }
    },
    [setAttachments],
  );

  return (
    <div className="relative w-full flex flex-col gap-4" >

      {/* 实际上传文件的输入口，但是触发位置不在这里 */}
      <input
        type="file"
        className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
        ref={fileInputRef}
        multiple
        onChange={handleFileChange}
        tabIndex={-1}
      />

      {/* 附件预览 */}
      {(attachments.length > 0 || uploadQueue.length > 0) && (
        <div
          data-testid="attachments-preview"
          className="flex flex-row gap-2 overflow-x-scroll items-end"
        >
          {attachments.map((attachment) => (
            <PreviewAttachment key={attachment.url} attachment={attachment} />
          ))}

          {uploadQueue.map((filename) => (
            <PreviewAttachment
              key={filename}
              attachment={{
                url: '',
                name: filename,
                contentType: '',
              }}
              isUploading={true}
            />
          ))}
        </div>
      )}

      <Textarea
        data-testid="multimodal-input"
        ref={textareaRef}
        placeholder="Send a message..."
        value={input}
        onChange={handleInput}
        className={cx(
          'min-h-[24px] max-h-[calc(75dvh)] overflow-hidden resize-none rounded-2xl!text-base bg-muted pb-10 dark:border-zinc-700',
          className,
        )}
        rows={2}
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
      <div className="absolute bottom-0 p-2 w-fit flex flex-row justify-start">
        <AttachmentsButton fileInputRef={fileInputRef} status={status} />
      </div>

      <div className="absolute bottom-0 right-0 p-2 w-fit flex flex-row justify-end">
        {status === 'submitted' ? (
          <StopButton stop={stop} setMessages={setMessages} />
        ) : (
          <SendButton
            input={input}
            submitForm={submitForm}
            uploadQueue={uploadQueue}
          />
        )}
      </div>
    </div>
  );
}

export const MultimodalInput = memo(
  PureMultimodalInput,
  (prevProps, nextProps) => {
    if (prevProps.input !== nextProps.input) return false;
    if (prevProps.status !== nextProps.status) return false;
    if (!equal(prevProps.attachments, nextProps.attachments)) return false;

    return true;
  },
);

const AttachmentsButton = memo(PureAttachmentsButton)


function PureAttachmentsButton({
  fileInputRef,
  status,
}: {
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
  status: UseChatHelpers['status'];
}) {
  return (
    <Button
      data-testid="attachments-button"
      className="rounded-md rounded-bl-lg p-[7px] h-fit dark:border-zinc-700 hover:dark:bg-zinc-900 hover:bg-zinc-200"
      onClick={(event) => {
        event.preventDefault();
        fileInputRef.current?.click();
      }}
      disabled={status !== 'ready'}
      variant="ghost"
    >
      <PaperclipIcon size={14} />
    </Button>
  );
}

function PureStopButton({
  stop,
  setMessages,
}: {
  stop: () => void;
  setMessages: UseChatHelpers['setMessages'];
}) {
  return (
    <Button
      data-testid="stop-button"
      className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
      onClick={(event) => {
        event.preventDefault();
        stop();
        setMessages((messages) => messages);
      }}
    >
      <StopIcon size={14} />
    </Button>
  );
}


const StopButton = memo(PureStopButton);

function PureSendButton({
  submitForm,
  input,
  uploadQueue,
}: {
  submitForm: () => void;
  input: string;
  uploadQueue: Array<string>;
}) {
  return (
    <Button
      data-testid="send-button"
      className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
      onClick={(event) => {
        event.preventDefault();
        submitForm();
      }}
      disabled={input.length === 0 || uploadQueue.length > 0}
    >
      <ArrowUpIcon size={14} />
    </Button>
  );
}

const SendButton = memo(PureSendButton, (prevProps, nextProps) => {
  // uploadQueue 不会使用深拷贝的方式，而是根据数量进行判断
  if (prevProps.uploadQueue.length !== nextProps.uploadQueue.length)
    return false;
  if (prevProps.input !== nextProps.input) return false;
  return true;
});