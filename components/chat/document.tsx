
import type { ArtifactKind } from '@/components/artifact/artifact';
import { useArtifact } from '@/hooks/use-artifact';
import { FileIcon, PencilEditIcon, MessageIcon } from '@/components/icons';
import {memo} from 'react';

interface DocumentToolResultProps {
    type: 'create' | 'update' | 'request-suggestions';
    result: { id: string; title: string; kind: ArtifactKind };
}

const getActionText = (
    type: 'create' | 'update' | 'request-suggestions',
    tense: 'past' | 'present'
) => {
    switch (type) {
        case 'create':
            return tense === 'present' ? 'Creating' : 'Created';
        case 'update':
            return tense === 'present' ? 'Updating' : 'Updated';
        case 'request-suggestions':
            return tense === 'present'
                ? 'Adding suggestions'
                : 'Added suggestions to';
        default:
            return null;
    }
}

function PureDocumentToolResult({
    type,
    result,
}: DocumentToolResultProps) {
    const { setArtifact } = useArtifact();

    return (
        <button
            type="button"
            className="bg-background cursor-pointer border py-2 px-3 rounded-xl w-fit flex flex-row gap-3 items-start"
            onClick={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                const boundingBox = {
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height,
                };

                setArtifact({
                    documentId: result.id,
                    kind: result.kind,
                    content: '',
                    title: result.title,
                    isVisible: true,
                    status: 'idle',
                    boundingBox,
                });
            }}
        >
            <div className="text-muted-foreground mt-1">
                {type === 'create' ? (
                    <FileIcon />
                ) : type === 'update' ? (
                    <PencilEditIcon />
                ) : type === 'request-suggestions' ? (
                    <MessageIcon />
                ) : null}
            </div>
            <div className="text-left">
                {`${getActionText(type, 'past')} "${result.title}"`}
            </div>
        </button>
    );
}

export const DocumentToolResult = memo(PureDocumentToolResult, () => true);