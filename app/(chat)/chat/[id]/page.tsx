// 详情页
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';

import { Chat } from '@/components/chat/chat';
import { DataStreamHandler } from '@/components/chat/data-stream-handler';

import { getChatById,getMessagesByChatId } from '@/lib/db/queries';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import type { DBMessage } from '@/lib/db/schema';
import type { Attachment, UIMessage } from 'ai';

import { auth } from '@/app/(auth)/auth';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const chat = await getChatById({ id });
  if (!chat) {
    console.error('chat not found');
    notFound();
  }

  const session = await auth();
  if (chat.visibility === 'private') {
    if (!session || !session.user) {
    console.error('session.user not found');
      return notFound();
    }

    if (session.user.id !== chat.userId) {
      console.error('session.user is not equeal to chat.userId');
      return notFound();
    }
  }

  const messagesFromDb = await getMessagesByChatId({
    id,
  });


  function convertToUIMessages(messages: Array<DBMessage>): Array<UIMessage> {
    return messages.map((message) => ({
      id: message.id,
      parts: message.parts as UIMessage['parts'],
      role: message.role as UIMessage['role'],
      // Note: content will soon be deprecated in @ai-sdk/react
      content: '',
      createdAt: message.createdAt,
      experimental_attachments:
        (message.attachments as Array<Attachment>) ?? [],
    }));
  }

  const cookieStore = await cookies();
  const chatModelFromCookie = cookieStore.get('chat-model');
  

  if (!chatModelFromCookie) {
    return (
      <>
        <Chat
          id={chat.id}
          initialMessages={convertToUIMessages(messagesFromDb)}
          selectedChatModel={DEFAULT_CHAT_MODEL}
          // selectedVisibilityType={chat.visibility}
          isReadonly={session?.user?.id !== chat.userId}
        />
        <DataStreamHandler id={id} />
      </>
    );
  }
  

  return (
    <>
      <Chat
        id={chat.id}
        initialMessages={convertToUIMessages(messagesFromDb)}
        selectedChatModel={chatModelFromCookie.value}
        // selectedVisibilityType={chat.visibility}
        isReadonly={session?.user?.id !== chat.userId}
      />
      <DataStreamHandler id={id} />
    </>
  );
}
