import { chatHandler } from '../chatHandler';
import { postUrlResponse } from '../../services/slack/postUrlResponse';
import { generateChatCompletion } from '../../services/venice/generateChatCompletion';
import { parseChatConfigAndPrompt } from '../../utils/parseChatConfigAndPrompt';

// Add mock for slackClient
jest.mock('../../clients/slackClient', () => ({
  slackClient: {
    chat: {
      postMessage: jest.fn().mockResolvedValue({ ok: true }),
    },
  },
}));

jest.mock('../../services/slack/postUrlResponse');
jest.mock('../../services/venice/generateChatCompletion');
jest.mock('../../utils/parseChatConfigAndPrompt');

describe('chatHandler', () => {
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

  const mockEvent = {
    channel_id: 'channel123',
    user_name: 'testuser',
    user_id: 'U123456',
    command: '/venice',
    response_url: 'http://response.url',
    text: 'Hello world',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (parseChatConfigAndPrompt as jest.Mock).mockReturnValue({
      config: {},
      prompt: 'Hello world',
    });
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should handle successful chat completion', async () => {
    (generateChatCompletion as jest.Mock).mockResolvedValue('AI response');
    (postUrlResponse as jest.Mock).mockResolvedValue({});

    await chatHandler(mockEvent);

    expect(postUrlResponse).toHaveBeenCalledWith(
      mockEvent.response_url,
      false,
      expect.objectContaining({
        blocks: expect.arrayContaining([
          expect.objectContaining({
            text: expect.objectContaining({
              text: expect.stringContaining(mockEvent.user_name),
            }),
          }),
        ]),
      }),
    );

    // Verify response was posted
    expect(postUrlResponse).toHaveBeenCalledWith(
      mockEvent.response_url,
      false,
      expect.objectContaining({
        blocks: expect.arrayContaining([
          expect.objectContaining({
            text: expect.objectContaining({
              text: 'AI response',
            }),
          }),
        ]),
      }),
    );
  });

  it('should handle long responses by chunking', async () => {
    const longResponse = 'a '.repeat(4000);
    (generateChatCompletion as jest.Mock).mockResolvedValue(longResponse);
    (postUrlResponse as jest.Mock).mockResolvedValue({ ok: true });

    await chatHandler(mockEvent);

    // Initial thinking + 3 chunks (due to 8000 chars split at spaces)
    expect(postUrlResponse).toHaveBeenCalledTimes(4);
  });

  it('should handle errors gracefully', async () => {
    const error = new Error('API Error');
    const postUrlResponseCalls: any[] = [];

    // Track all calls to postUrlResponse
    (postUrlResponse as jest.Mock).mockImplementation((...args) => {
      postUrlResponseCalls.push(args);
      return Promise.resolve({ ok: true });
    });

    // Mock parseChatConfigAndPrompt to ensure it's working
    (parseChatConfigAndPrompt as jest.Mock).mockReturnValue({
      config: {},
      prompt: 'Hello world',
    });

    // Make the chat completion fail immediately
    (generateChatCompletion as jest.Mock).mockRejectedValueOnce(error);

    // Execute handler and wait for all promises
    await chatHandler(mockEvent);
    // Wait for any pending microtasks
    await new Promise(process.nextTick);

    // Verify both messages were attempted
    expect(postUrlResponseCalls.length).toBe(2);

    // Verify first call was thinking message
    const firstCall = postUrlResponseCalls[0];
    expect(firstCall[2].blocks[0].text.text).toContain('Thinking about');

    // Verify second call was error message
    const lastCall = postUrlResponseCalls[1];
    expect(lastCall[2].blocks[0].text.text).toContain('error');
  });
});
