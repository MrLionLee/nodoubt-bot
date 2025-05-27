import { ChatPage } from './pages/chat';
import { test, expect } from '@playwright/test';

test.describe('chat activity',() => {
    let chatPage: ChatPage;

  test.beforeEach(async ({ page }) => {
    chatPage = new ChatPage(page);
    await chatPage.createNewChat();
  });
    test('发送用户信息，然后拿到响应',async () => {
        await chatPage.sendUserMessage('Why is grass green?');
        await chatPage.isGenerationComplete();

        const assistantMessage = await chatPage.getRecentAssistantMessage();
        expect(assistantMessage.content).toContain("It's just green duh!");
    })
})