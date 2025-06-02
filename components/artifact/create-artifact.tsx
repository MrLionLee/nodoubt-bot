import { DataStreamDelta } from '../chat/data-stream-handler'
import { ComponentType, Dispatch, SetStateAction } from 'react';
import { UIArtifact } from './artifact';

interface ArtifactContent<M=any> {
    title: string;
    content: string;
    isLoading: boolean;
    // mode: 'edit' | 'diff';
    status: 'idle' | 'streaming';
    // metadata: M,
    onSaveContent: (updateContent: string, debounce: boolean) => void
}

type ArtifactConfig<T extends string, M = any> = {
    kind: T;
    description: string;
    content: ComponentType<ArtifactContent<M>>;
    onStreamPart: (args: {
        setArtifact: Dispatch<SetStateAction<UIArtifact>>;
        streamPart: DataStreamDelta;
      }) => void;
}

export class Artifact<T extends string, M =any> {
    readonly kind: T;
    readonly description: string;
    readonly content: ComponentType<ArtifactContent<M>>;
    readonly onStreamPart: (args: {
        setArtifact: Dispatch<SetStateAction<UIArtifact>>;
        streamPart: DataStreamDelta;
      }) => void;

    constructor(config: ArtifactConfig<T,M>) {
        this.kind = config.kind;
        this.description= config.description;
        this.content = config.content;
        this.onStreamPart = config.onStreamPart;
    }
}