import { Schema } from "prosemirror-model";
import { addListNodes } from 'prosemirror-schema-list'
import { schema } from 'prosemirror-schema-basic'
import { textblockTypeInputRule } from 'prosemirror-inputrules'; // TODO 定制化生成更多的规则
import type { Transaction } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view'
import {  RefObject } from "react";
import { buildContentFromDocument } from "./function";

export const documentSchema = new Schema({
    // 通过 addListNodes 扩展节点， 'paragraph block*' 表示段落后可跟任意数量块元素， 'block' 定义块级节点类型。
    nodes: addListNodes(schema.spec.nodes, 'paragraph block*', 'block'),
    marks: schema.spec.marks,
})

// 定义标题输入规则，例如输入 # 自动转换为一级标题。

export function headingRule(level: number) {
    return textblockTypeInputRule(
        new RegExp(`^(#{1,${level}})\\s$`),
        documentSchema.nodes.heading,
        () => ({ level }),
    );
}


export const handleTransaction = ({
    transaction,
    editorRef,
    onSaveContent
}: {
    transaction: Transaction,
    editorRef: RefObject<EditorView | null>
    onSaveContent: (updatedContent: string, debounce: boolean) => void;
}) =>  {
    if (!editorRef || !editorRef.current) return;

    const newState = editorRef.current.state.apply(transaction);
    editorRef.current.updateState(newState);

    // 将 doc 转成 markdown 格式，然后保存到数据库中。
    if (transaction.docChanged && !transaction.getMeta('no-save')) {
        const updatedContent = buildContentFromDocument(newState.doc);

        if(transaction.getMeta('no-debounce')) {
            onSaveContent(updatedContent, false);
        }else {
            onSaveContent(updatedContent, true);
        }
    }
}