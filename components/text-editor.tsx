'use client';

import { exampleSetup } from 'prosemirror-example-setup';
import { inputRules } from 'prosemirror-inputrules';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import React, { memo, useEffect, useRef } from 'react';
import { buildDocumentFromContent, buildContentFromDocument } from '@/lib/editor/function'
import { documentSchema, headingRule, handleTransaction } from '@/lib/editor/config'

type EditorProps = {
    content: string;
    onSaveContent: (updatedContent: string, debounce: boolean) => void;
    status: 'streaming' | 'idle';
    isCurrentVersion: boolean;
    currentVersionIndex: number;
};

export function Editor({
    content,
    onSaveContent,
    status,
    isCurrentVersion,
}: EditorProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<EditorView | null>(null);

    // 生成 editorView
    useEffect(() => {
        if (containerRef.current && !editorRef.current) {
            const state = EditorState.create({
                doc: buildDocumentFromContent(content),
                plugins: [
                    // 官方提供的示例模块。封装插件和配置
                    ...exampleSetup({ schema: documentSchema, menuBar: false }),
                    inputRules({
                        rules: [
                            // 这里是一些 inputRules 的配置
                            headingRule(1),
                            headingRule(2),
                            headingRule(3),
                            headingRule(4),
                            headingRule(5),
                            headingRule(6),
                        ],
                    })
                ],
            });

            editorRef.current = new EditorView(containerRef.current, {
                state,
            })
        }

        return () => {
            if (editorRef.current) {
                editorRef.current.destroy();
                editorRef.current = null;
            }
        }
    }, [])

    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.setProps({
                dispatchTransaction: (transaction) => {
                    // transaction 发生变更时的处理；
                    handleTransaction({
                        transaction,
                        editorRef,
                        onSaveContent
                    })
                }
            })
        }

    }, [onSaveContent])


    useEffect(() => {
        if (editorRef.current && content) {
            const currentContent = buildContentFromDocument(editorRef.current.state.doc);

            if (status === 'streaming') {
                console.info('status === streaming')

            }

            if (currentContent !== content) {
                console.info('currentContent  !== content')
            }

        }
    }, [content, status])

    return (
        // 这里配置了一个 container，具体内容根据 props 动态渲染
        <div className="relative prose dark:prose-invert" ref={containerRef} />
    )
}


// type EditorProps = {
//     content: string;
//     isCurrentVersion: boolean;
//     currentVersionIndex: number;
//     status: 'streaming' | 'idle';
//     onSaveContent:(updateContent:string, debounce: boolean) => void;
// };



