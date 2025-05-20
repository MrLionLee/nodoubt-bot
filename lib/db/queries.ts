

import { and, asc, desc, eq, gt, gte, inArray, lt, SQL } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import {
    chat,
    Chat,
    DBMessage,
    message
} from './schema';
import { mockUser } from '../constants';
import { todo } from 'node:test';

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);


export async function saveChat({
    id,
    userId = mockUser.id, // 鉴权之前，先使用固定的值,
    title,
}: {
    id: string;
    userId?: string; // 鉴权之前，先使用固定的值
    title: string;
}) {
    console.info('saveChat', id, userId, title)
    try {
        return await db.insert(chat).values({
            id,
            createdAt: new Date(),
            userId,
            title,
        });
    } catch (error) {
        console.error('Failed to save chat in database',error);
        throw error;
    }
}


export async function getChatById({ id }: { id: string }) {
    try {
        const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
        return selectedChat;
    } catch (error) {
        console.error('Failed to get chat by id from database',error);
        throw error;
    }
}




export async function getChatsByUserId({
    id,
    limit,
    startingAfter,
    endingBefore,
}: {
    id: string; // userId
    limit: number;
    startingAfter: string | null;
    endingBefore: string | null;
}) {
    try {
        const extendedLimit = limit + 1;

        const query = (whereCondition?: SQL<any>) =>
            db
                .select()
                .from(chat)
                // todo: 等 user db 配置好了，再补充
                // .where(
                //     whereCondition
                //         ? and(whereCondition, eq(chat.userId, id))
                //         : eq(chat.userId, id),
                // )
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

        console.info('filteredChats', filteredChats)
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
