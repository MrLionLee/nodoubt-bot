import { Artifact } from '@/components/artifact/create-artifact'
import { Editor } from '@/components/text-editor';
import {DocumentSkeleton} from '@/components/document-skeleton'

export const textArtifact = new Artifact<'text'>({
    kind: 'text',
    description: 'Useful for text content, like drafting essays and emails.',
    content: ({
        content,
        status,
        isLoading,
        onSaveContent
    }) => {
        if (isLoading) {
            return <DocumentSkeleton artifactKind="text" />;
        }

        return (
            <>
                <div className="flex flex-row py-8 md:p-20 px-4">
                    <Editor
                        content={content}
                        // isCurrentVersion={isCurrentVersion}
                        // currentVersionIndex={currentVersionIndex}
                        status={status}
                        onSaveContent={onSaveContent}
                    />
                </div>
            </>
        );
    },
    onStreamPart: ({ streamPart, setArtifact }) => {
        if (streamPart.type === 'text-delta') {
            setArtifact((currentArtifact) => ({
                ...currentArtifact,
                content: currentArtifact.content + streamPart.content,
                isVisible:
                    currentArtifact.status === 'streaming' &&
                        currentArtifact.content.length > 400 &&
                        currentArtifact.content.length < 450
                        ? true :
                        currentArtifact.isVisible,
                status: 'streaming',
            }))
        }
    },
   
})
