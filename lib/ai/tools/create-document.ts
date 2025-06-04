import { generateUUID } from '@/lib/utils';
import { type DataStreamWriter, tool } from 'ai';
import { z } from 'zod';
import type { Session } from 'next-auth';
import {
  artifactKinds,
  documentHandlersByArtifactKind,
} from '@/lib/artifacts/server';

interface CreateDocumentProps {
  session: Session;
  dataStream: DataStreamWriter;
}

export const createDocument = ({ session, dataStream }: CreateDocumentProps) =>
  tool({
    description:
      'Create a document for a writing or content creation activities. This tool will call other functions that will generate the contents of the document based on the title and kind.',
    parameters: z.object({
      title: z.string(),
      kind: z.enum(artifactKinds),
    }),
    execute: async ({ title, kind }) => {
      const id = generateUUID();
      // 配置 kind
      dataStream.writeData({
        type: 'kind',
        content: kind,
      });

      // 配置 id
      dataStream.writeData({
        type: 'id',
        content: id,
      });

      // 配置 title
      dataStream.writeData({
        type: 'title',
        content: title,
      });

      // 清楚之前的内容
      dataStream.writeData({
        type: 'clear',
        content: '',
      });

      console.info('Creating document', title, kind);
      const documentHandler = documentHandlersByArtifactKind.find(
        (documentHandlerByArtifactKind) =>
          documentHandlerByArtifactKind.kind === kind,
      );

      if (!documentHandler) {
        throw new Error(`No document handler found for kind: ${kind}`);
      }
      await documentHandler.onCreateDocument({
        id,
        title,
        dataStream,
        session,
      });
      dataStream.writeData({ type: 'finish', content: '' });
      return {
        id,
        title,
        kind,
        content: 'A document was created and is now visible to the user.',
      };
    },
  });


