import { auth } from '@/app/(auth)/auth';
import {
  getDocumentsById,
} from '@/lib/db/queries';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
  
    if (!id) {
      return new Response('Missing id', { status: 400 });
    }
  
    const session = await auth();
  
    if (!session || !session.user) {
      return new Response('Unauthorized', { status: 401 });
    }
  
    const documents = await getDocumentsById({ id });
  
    const [document] = documents;
  
    if (!document) {
      return new Response('Not Found', { status: 404 });
    }
  
    if (document.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }
  
    return Response.json(documents, { status: 200 });
  }