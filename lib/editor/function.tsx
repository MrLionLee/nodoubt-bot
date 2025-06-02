
import { DOMParser, type Node } from 'prosemirror-model';
import { documentSchema } from './config';
import { Markdown } from '@/components/markdown';
import { renderToString } from 'react-dom/server';
import { defaultMarkdownSerializer } from 'prosemirror-markdown';


export const buildDocumentFromContent = (content: string) => {
    const parser =  DOMParser.fromSchema(documentSchema);
    const stringFromMarkdown = renderToString(<Markdown>{content}</Markdown>)
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = stringFromMarkdown;
    return parser.parse(tempContainer); // 转化成一个 prise node
  };

  
  export const buildContentFromDocument = (doc: Node) => {
    return defaultMarkdownSerializer.serialize(doc); // 转化成一个 markdown 字符串，用于保存到 databas
  };