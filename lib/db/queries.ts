

import { and, asc, desc, eq, gt, lt, type SQL } from 'drizzle-orm';
import { genSaltSync, hashSync } from 'bcrypt-ts';

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import type { ArtifactKind } from '@/components/artifact/artifact';


import {
    chat,
    type Chat,
    type DBMessage,
    message,
    user,
    type User,
    document
} from './schema';

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

export async function getUser(email: string): Promise<Array<User>> {
    try {
        return await db.select().from(user).where(eq(user.email, email));
    } catch (error) {
        console.error('Failed to get user from database');
        throw error;
    }
}

export async function createUser(email: string, password: string) {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);

    try {
        return await db.insert(user).values({ email, password: hash });
    } catch (error) {
        console.error('Failed to create user in database');
        throw error;
    }
}



// === chat

export async function saveChat({
    id,
    userId,
    title,
}: {
    id: string;
    userId: string; // 鉴权之前，先使用固定的值
    title: string;
}) {
    try {
        return await db.insert(chat).values({
            id,
            createdAt: new Date(),
            userId,
            title,
        });
    } catch (error) {
        console.error('Failed to save chat in database', error);
        throw error;
    }
}


export async function getChatById({ id }: { id: string }) {
    try {
        const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
        return selectedChat;
    } catch (error) {
        console.error('Failed to get chat by id from database', error);
        throw error;
    }
}

export async function deleteChatById({ id }: { id: string }) {
    try {
        // 移除 chatId 对应的 message
        await db.delete(message).where(eq(message.chatId, id));
        // 移除 chat
        return await db.delete(chat).where(eq(chat.id, id));
    } catch (error) {
        console.error('Failed to delete chat by id from database');
        throw error;
    }
}




export async function getChatsByUserId({
    id,
    limit,
    startingAfter,
    endingBefore,
}: {
    id: string;
    limit: number;
    startingAfter: string | null;
    endingBefore: string | null;
}) {
    try {
        const extendedLimit = limit + 1;

        const query = (whereCondition?: SQL) =>
            db
                .select()
                .from(chat)
                .where(
                    whereCondition
                        ? and(whereCondition, eq(chat.userId, id))
                        : eq(chat.userId, id),
                )
                .orderBy(desc(chat.createdAt))
                .limit(extendedLimit);

        let filteredChats: Array<Chat> = [];

        if (startingAfter) {
            const [selectedChat] = await db
                .select()
                .from(chat)
                .where(eq(chat.id, startingAfter))
                .limit(1);

            if (!selectedChat) {
                throw new Error(`Chat with id ${startingAfter} not found`);
            }

            filteredChats = await query(gt(chat.createdAt, selectedChat.createdAt));
        } else if (endingBefore) {
            const [selectedChat] = await db
                .select()
                .from(chat)
                .where(eq(chat.id, endingBefore))
                .limit(1);

            if (!selectedChat) {
                throw new Error(`Chat with id ${endingBefore} not found`);
            }

            filteredChats = await query(lt(chat.createdAt, selectedChat.createdAt));
        } else {
            filteredChats = await query();
        }

        const hasMore = filteredChats.length > limit;

        return {
            chats: hasMore ? filteredChats.slice(0, limit) : filteredChats,
            hasMore,
        };
    } catch (error) {
        console.error('Failed to get chats by user from database~~~', error);
        throw error;
    }
}



// ---------  message

export async function saveMessages({
    messages,
}: {
    messages: Array<DBMessage>;
}) {
    try {
        return await db.insert(message).values(messages);
    } catch (error) {
        console.error('Failed to save messages in database', error);
        throw error;
    }
}

export async function getMessagesByChatId({ id }: { id: string }) {
    try {
        return await db
            .select()
            .from(message)
            .where(eq(message.chatId, id))
            .orderBy(asc(message.createdAt));
    } catch (error) {
        console.error('Failed to get messages by chat id from database', error);
        throw error;
    }
}

// --- document
export async function saveDocument({
    id,
    title,
    kind,
    content,
    userId,
  }: {
    id: string;
    title: string;
    kind: ArtifactKind;
    content: string;
    userId: string;
  }) {
    try {
        return await db.insert(document).values({
            id,
            title,
            kind,
            content,
            userId,
            createdAt: new Date(),
          });
    } catch (error) {
      console.error('Failed to save document in database');
      throw error;
    }
  }

export async function getDocumentsById({ id }: { id: string }) {
    try {
      const documents = await db
        .select()
        .from(document)
        .where(eq(document.id, id))
        .orderBy(asc(document.createdAt));
  
      return documents;
    } catch (error) {
      console.error('Failed to get document by id from database');
      throw error;
    }
  }

  export async function getDocumentById({id} : {id:string}){
    try {
        const [selectedDocument] = await db
           .select()
           .from(document)
           .where(eq(document.id, id))
           .orderBy(desc(document.createdAt));

        return selectedDocument;
    } catch (error) {
        console.error('Failed to get document by id from database');
        throw error;
    }
  }