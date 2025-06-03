
import type { ArtifactKind } from "@/components/artifact/artifact";
import type { DataStreamWriter } from "ai";
import type { Session } from "next-auth";
import { saveDocument } from '../db/queries';
import type { Document } from '../db/schema';
import { textDocumentHandler } from "@/artifacts/text/server";

export interface DocumentCallbackProps {
    session: Session;
    dataStream: DataStreamWriter,
}

export interface CreateDocumentCallbackProps extends DocumentCallbackProps{
    id:  string;
    title: string;
}

export interface UpdateDocumentCallbackProps extends DocumentCallbackProps{
    document: Document;
    description: string;
}

export interface DocumentHandler<T=ArtifactKind, U=void>{
    kind: T,
    onCreateDocument: (props:CreateDocumentCallbackProps) => Promise<U>
    onUpdateDocument: (props:UpdateDocumentCallbackProps) => Promise<U>
}

export function createDocumentHandler<T extends ArtifactKind>(
    config: DocumentHandler<T,string>
): DocumentHandler<T,void> {
    return {
        kind: config.kind,
        onCreateDocument: async (args: CreateDocumentCallbackProps)  => {
            const draftContent = await config.onCreateDocument(args);
            if(args?.session?.user?.id){
                await saveDocument({
                    id: args.id,
                    title: args.title,
                    kind: config.kind,
                    content: draftContent,
                    userId: args.session.user.id,
                })
            }
            return;
        },
        onUpdateDocument: async(args: UpdateDocumentCallbackProps) => {
            const draftContent = await config.onUpdateDocument(args);
            if(args?.session?.user?.id){
                await saveDocument({
                    id: args.document.id,
                    title: args.document.title,
                    kind: config.kind,
                    content: draftContent,
                    userId: args.session.user.id,
                })
            }
            return;
        }
    }
}




export const documentHandlersByArtifactKind: Array<DocumentHandler> = [
    textDocumentHandler
]
export const artifactKinds = ['text', 'code', 'image', 'sheet'] as const