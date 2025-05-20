import { NextRequest } from 'next/server';
import { getChatsByUserId } from '@/lib/db/queries';

const mock = {
    "chats": [
        {
            "id": "e5c3ed94-72d8-469f-9e72-d200d0f2fe5e",
            "createdAt": "2025-05-18T07:49:37.683Z",
            "title": "为什么天是蓝色的",
            "userId": "4b28dece-18c2-418c-ad7c-05e0c0b9954a",
            "visibility": "private"
        },
        {
            "id": "1c64a025-1103-4ae1-bf56-bd3e2e6e1d8d",
            "createdAt": "2025-05-17T10:06:15.448Z",
            "title": "Greeting",
            "userId": "4b28dece-18c2-418c-ad7c-05e0c0b9954a",
            "visibility": "private"
        },
        {
            "id": "81e329bb-767f-4bb3-b35b-29fd5ea3a147",
            "createdAt": "2025-05-17T08:47:40.312Z",
            "title": "Greeting a loved one",
            "userId": "4b28dece-18c2-418c-ad7c-05e0c0b9954a",
            "visibility": "private"
        }
    ],
    "hasMore": false
}

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;

    const limit = parseInt(searchParams.get('limit') || '10');
    const startingAfter = searchParams.get('starting_after');
    const endingBefore = searchParams.get('ending_before');

    if (startingAfter && endingBefore) {
        return Response.json(
            'Only one of starting_after or ending_before can be provided!',
            { status: 400 },
        );
    }

    //   const session = await auth();

    //   if (!session?.user?.id) {
    //     return Response.json('Unauthorized!', { status: 401 });
    //   }



    return Response.json(mock)

    try {
        const chats = await getChatsByUserId({
            //   id: session.user.id,
            id: 'test_chat_id',
            limit,
            startingAfter,
            endingBefore,
        });

        return Response.json(chats);
    } catch (_) {
        return Response.json('Failed to fetch chats!', { status: 500 });
    }
}
