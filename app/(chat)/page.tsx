import { cookies } from 'next/headers';

import { Chat } from '@/components/chat';

import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';

export default async function Page() {
  const id = generateUUID();
  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('chat-model');
  const model = modelIdFromCookie ? modelIdFromCookie.value : DEFAULT_CHAT_MODEL;
  return (
    <>
        <Chat
          key={id}
          id={id}
          initialMessages={[]}
          selectedChatModel={model}
          isReadonly={false}
        />
      </>
  )
}
