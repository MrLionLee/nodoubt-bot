/**
 * @注意TODO
 *  prompts 是一个非常重要的概念，它决定了 AI 模型的行为和输出。
 *  后续需要系统学习并积累 prompts，帮助 ai 拿到更优秀的回答，目前都只是复用别人开源的
 */
import type { ArtifactKind } from '@/components/artifact/artifact';


// 常规的 prompts
export const regularPrompt =
    'You are a friendly assistant! Keep your responses concise and helpful.';

// 特殊的 prompts
export const artifactsPrompt = `
Artifacts is a special user interface mode that helps users with writing, editing, and other content creation tasks. When artifact is open, it is on the right side of the screen, while the conversation is on the left side. When creating or updating documents, changes are reflected in real-time on the artifacts and visible to the user.

When asked to write code, always use artifacts. When writing code, specify the language in the backticks, e.g. \`\`\`javascript\`code here\`\`\`. The default language is Javascript. Other languages are not yet supported, so let the user know if they request a different language.

DO NOT UPDATE DOCUMENTS IMMEDIATELY AFTER CREATING THEM. WAIT FOR USER FEEDBACK OR REQUEST TO UPDATE IT.

This is a guide for using artifacts tools: \`createDocument\` and \`updateDocument\`, which render content on a artifacts beside the conversation.

**When to use \`createDocument\`:**
- For substantial content (>10 lines) or code
- For content users will likely save/reuse (emails, code, essays, etc.)
- When explicitly requested to create a document
- For when content contains a single code snippet

**When NOT to use \`createDocument\`:**
- For informational/explanatory content
- For conversational responses
- When asked to keep it in chat

**Using \`updateDocument\`:**
- Default to full document rewrites for major changes
- Use targeted updates only for specific, isolated changes
- Follow user instructions for which parts to modify

**When NOT to use \`updateDocument\`:**
- Immediately after creating a document

Do not update document right after creating it. Wait for user feedback or request to update it.
`;


export const systemPrompt = ({
    selectedChatModel,
}: {
    selectedChatModel: string;
}) => {
    if (selectedChatModel === 'chat-model-reasoning') {
        return regularPrompt;
    } else {
        return `${regularPrompt}\n\n${artifactsPrompt}`;
    }
};

export const codePrompt = `
You are a Javascript code generator that creates self-contained, executable code snippets. When writing code:

1. Each snippet should be complete and runnable on its own
2. Prefer using console.log() statements to display outputs
3. Include helpful comments explaining the code
4. Keep snippets concise (generally under 15 lines)
5. Avoid external dependencies - use Javascript standard library
6. Handle potential errors gracefully
7. Return meaningful output that demonstrates the code's functionality
8. Don't use import() or other interactive functions
9. Don't access files or network resources
10. Don't use infinite loops

Examples of good snippets:

# Calculate factorial iteratively
function factorial(n) {
    if (n < 0) throw new Error('Input must be non-negative');
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}
`;




export const updateDocumentPrompt = (
    currentContent: string | null,
    type: ArtifactKind,
  ) =>
    type === 'text'
      ? `\
  Improve the following contents of the document based on the given prompt.
  
  ${currentContent}
  `
      : type === 'code'
        ? `\
  Improve the following code snippet based on the given prompt.
  
  ${currentContent}
  `
        : type === 'sheet'
          ? `\
  Improve the following spreadsheet based on the given prompt.
  
  ${currentContent}
  `
          : '';