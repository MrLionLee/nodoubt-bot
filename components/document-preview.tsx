"use client"

import { useArtifact } from "@/hooks/use-artifact"
import useSWR from 'swr';
import { cn, fetcher } from '@/lib/utils';
import { useMemo, memo, useCallback, useRef, useEffect } from "react";
import type { UIArtifact } from "@/components/artifact/artifact";
import { LoaderIcon, FileIcon } from '@/components/icons'
import { Editor } from '@/components/text-editor';
import type { Document } from '@/lib/db/schema'
import equal from 'fast-deep-equal';
import type { RefObject, MouseEvent } from 'react'
import { FullscreenIcon } from '@/components/icons'
import { DocumentToolResult, DocumentToolCall } from '@/components/document'

interface DocumentPreviewProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    args?: any;
}
export function DocumentPreview({
    result,
    args,
}: DocumentPreviewProps) {
    const { artifact, setArtifact } = useArtifact();
    // 根据 result.id 获取对应的 document 列表，获取第一个 document 作为 previewDocument 的 value
    const { data: documents } = useSWR<
        Array<Document>
    >(result ? `/api/document?id=${result.id}` : null, fetcher);
    const previewDocument = useMemo(() => documents?.[0], [documents]);
    console.info('previewDocument', previewDocument)
    const hitboxRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const boundingBox = hitboxRef.current?.getBoundingClientRect();
        if (artifact.documentId && boundingBox) {
            setArtifact((preview) => (
                {
                    ...preview,
                    boundingBox: {
                        left: boundingBox.x,
                        top: boundingBox.y,
                        width: boundingBox.width,
                        height: boundingBox.height,
                    },
                }
            ))
        }
    }, [artifact.documentId, setArtifact])

    if (artifact.isVisible) {
        // 展开 artifact 后，message 中的展示需要变更
        if (result) {
            return (
                <DocumentToolResult
                    type="create"
                    result={{ id: result.id, title: result.title, kind: result.kind }}
                />
            )
        }

        // 正在调用的时候，展示 loading 状态
        if (args) {
            return (
                <DocumentToolCall
                    type="create"
                    args={{ title: args.title }}
                />
            );
        }
    }

    const document: Document | null = previewDocument
        ? previewDocument
        : artifact.status === 'streaming'
            ? {
                title: artifact.title,
                kind: artifact.kind,
                content: artifact.content,
                id: artifact.documentId,
                createdAt: new Date(),
                userId: 'noop',
            }
            : null;

    if (!document) return <div>Loading...</div>
    return (
        <div className="relative w-full cursor-pointer">
            <HitboxLayer
                hitboxRef={hitboxRef}
                result={result}
                setArtifact={setArtifact}
            />
            <DocumentHeader
                title={document.title}
                // kind={document.kind}
                isStreaming={artifact.status === 'streaming'}
            />
            <DocumentContent document={document} />
        </div>
    )
}


const PureDocumentHeader = ({
    title,
    // kind,
    isStreaming,
}: {
    title: string;
    // kind: ArtifactKind;
    isStreaming: boolean;
}) => (
    <div className="p-4 border rounded-t-2xl flex flex-row gap-2 items-start sm:items-center justify-between dark:bg-muted border-b-0 dark:border-zinc-700">
        <div className="flex flex-row items-start sm:items-center gap-3">
            <div className="text-muted-foreground">
                {isStreaming ? (
                    <div className="animate-spin">
                        <LoaderIcon />
                    </div>
                ) :
                    // kind === 'image' ? (
                    //     <ImageIcon />
                    // ) : 
                    (
                        <FileIcon />
                    )}
            </div>
            <div className="-translate-y-1 sm:translate-y-0 font-medium">{title}</div>
        </div>
        <div className="w-8" />
    </div>
);

const DocumentHeader = memo(PureDocumentHeader, (prevProps, nextProps) => {
    if (prevProps.title !== nextProps.title) return false;
    if (prevProps.isStreaming !== nextProps.isStreaming) return false;

    return true;
});


const DocumentContent = ({ document }: { document: Document }) => {
    const { artifact } = useArtifact();

    const containerClassName = cn(
        'h-[257px] overflow-y-scroll border rounded-b-2xl dark:bg-muted border-t-0 dark:border-zinc-700',
        {
            'p-4 sm:px-14 sm:py-16': document.kind === 'text',
            // 'p-0': document.kind === 'code',
        },
    );

    const commonProps = {
        content: document.content ?? '',
        isCurrentVersion: true,
        currentVersionIndex: 0,
        status: artifact.status,
        saveContent: () => { },
    };

    const onSaveContent = useCallback(() => {
        return () => { }
    }, [])

    return (
        <div className={containerClassName}>
            {document.kind === 'text' ? (
                // onSaveContent 不配置回调，因此在 chat 中是无法 save 的
                <Editor {...commonProps} onSaveContent={onSaveContent} />
            )
                // : document.kind === 'code' ? (
                //   <div className="flex flex-1 relative w-full">
                //     <div className="absolute inset-0">
                //       <CodeEditor {...commonProps} onSaveContent={() => {}} />
                //     </div>
                //   </div>
                // ) : document.kind === 'sheet' ? (
                //   <div className="flex flex-1 relative size-full p-4">
                //     <div className="absolute inset-0">
                //       <SpreadsheetEditor {...commonProps} />
                //     </div>
                //   </div>
                // ) : document.kind === 'image' ? (
                //   <ImageEditor
                //     title={document.title}
                //     content={document.content ?? ''}
                //     isCurrentVersion={true}
                //     currentVersionIndex={0}
                //     status={artifact.status}
                //     isInline={true}
                //   />
                // )
                : null}
        </div>
    );
};


const PureHitboxLayer = ({
    hitboxRef,
    result,
    setArtifact,
}: {
    hitboxRef: RefObject<HTMLDivElement | null>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result: any;
    setArtifact: (updateFn: UIArtifact | ((currentArtifact: UIArtifact) => UIArtifact)) => void
}
) => {
    const handleClick = useCallback((event: MouseEvent<HTMLElement>) => {
        const boundingBox = event.currentTarget.getBoundingClientRect();
        setArtifact((artifact) =>
            artifact.status === 'streaming' ? { ...artifact, isVisible: true } : {
                ...artifact,
                title: result.title,
                kind: result.kind,
                documentId: result.id,
                isVisible: true,
                boundingBox: {
                    left: boundingBox.x,
                    top: boundingBox.y,
                    width: boundingBox.width,
                    height: boundingBox.height,
                }
            }
        )
    }, [setArtifact, result])
    return (
        <div
            className="size-full absolute top-0 left-0 rounded-xl z-10"
            ref={hitboxRef}
            onClick={handleClick}
            role="presentation"
            aria-hidden="true"
        >
            <div className="w-full p-4 flex justify-end items-center">
                <div className="absolute right-[9px] top-[13px] p-2 hover:dark:bg-zinc-700 rounded-md hover:bg-zinc-100">
                    <FullscreenIcon />
                </div>
            </div>
        </div>
    )


}

const HitboxLayer = memo(PureHitboxLayer, (prevProps, nextProps) => {
    if (!equal(prevProps.result, nextProps.result)) return false;
    return true;
});