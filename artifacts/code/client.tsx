import { Artifact } from '@/components/artifact/create-artifact'
import { CodeEditor } from '@/components/code-editor';

export const codeArtifact = new Artifact<'code'>({
    kind: 'code',
    description:
        'Useful for code generation; Code execution is only available for js code.',
    content: (props) => {
        return (
            <div className='px-1'>
                <CodeEditor {...props} />
            </div>
        )
    },
    onStreamPart: ({ streamPart, setArtifact }) => {
        if (streamPart.type === 'code-delta') {
            setArtifact((currentArtifact) => ({
                ...currentArtifact,
                content: streamPart.content,
                isVisible:
                    currentArtifact.status === 'streaming' &&
                        currentArtifact.content.length > 300 &&
                        currentArtifact.content.length < 310
                        ? true :
                        currentArtifact.isVisible,
                status: 'streaming',
            }))
        }
    },
   
})
