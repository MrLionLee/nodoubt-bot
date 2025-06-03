"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef } from "react";
import { artifactDefinitions, type ArtifactKind } from '@/components/artifact/artifact'
import { initialArtifactData, useArtifact } from '@/hooks/use-artifact';

export type DataStreamDelta = {
    type: 'text-delta' | 'code-delta' | 'title' | 'id' | 'clear' | 'finish' | 'kind'
    content: string
}


export function DataStreamHandler({ id }: { id: string }) {
    // 只有
    const { data: dataStream } = useChat({ id });
    const { artifact, setArtifact } = useArtifact()
    const lastProcessedIndex = useRef(-1)
    useEffect(() => {
        if (!dataStream?.length) return;

        const newDeltas = dataStream.slice(lastProcessedIndex.current + 1);
        lastProcessedIndex.current = dataStream.length - 1;


        (newDeltas as DataStreamDelta[]).forEach((delta: DataStreamDelta) => {
            const artifactDefinition = artifactDefinitions.find(
                (artifactDefinition) => artifactDefinition.kind === artifact.kind,
            );
            // 流式处理, 这里主要是处理 delta-xxx 数据的
            if (artifactDefinition?.onStreamPart) {
                artifactDefinition.onStreamPart({
                    streamPart: delta,
                    setArtifact,
                })
            }

            // 这里处理 title, id, kind 数据
            setArtifact((currentArtifact) => {
                if (!currentArtifact) {
                    return {
                        ...initialArtifactData,
                        status: 'streaming'
                    }
                }

                switch (delta.type) {
                    case 'id':
                        return {
                            ...currentArtifact,
                            documentId: delta.content as string,
                            status: 'streaming'
                        }
                    case 'title':
                        return {
                            ...currentArtifact,
                            title: delta.content as string,
                            status: 'streaming'
                        }

                    case 'kind':
                        return {
                            ...currentArtifact,
                            kind: delta.content as ArtifactKind,
                            status: 'streaming'
                        }

                    case 'clear':
                        return {
                            ...currentArtifact,
                            content: '',
                            status: 'streaming'
                        }
                    case 'finish':
                        return {
                            ...currentArtifact,
                            status: 'idle'
                        }
                    default:
                        return currentArtifact;
                }
            })

            
        })

    }, [dataStream, setArtifact, artifact]);

    return null
}