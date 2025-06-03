import type { DataStreamDelta } from '../chat/data-stream-handler'
import type { ComponentType, Dispatch, SetStateAction } from 'react';
import type { UIArtifact } from './artifact';

interface ArtifactContent{
    title: string;
    content: string;
    isLoading: boolean;
    status: 'idle' | 'streaming';
    onSaveContent: (updateContent: string, debounce: boolean) => void
}

type ArtifactConfig<T extends string> = {
    kind: T;
    description: string;
    content: ComponentType<ArtifactContent>;
    onStreamPart: (args: {
        setArtifact: Dispatch<SetStateAction<UIArtifact>>;
        streamPart: DataStreamDelta;
      }) => void;
}

export class Artifact<T extends string> {
    readonly kind: T;
    readonly description: string;
    readonly content: ComponentType<ArtifactContent>;
    readonly onStreamPart: (args: {
        setArtifact: Dispatch<SetStateAction<UIArtifact>>;
        streamPart: DataStreamDelta;
      }) => void;

    constructor(config: ArtifactConfig<T>) {
        this.kind = config.kind;
        this.description= config.description;
        this.content = config.content;
        this.onStreamPart = config.onStreamPart;
    }
}