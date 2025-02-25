import { postMessage } from '../postMessage';
import { slackClient } from '../../../clients/slackClient';

jest.mock('../../../clients/slackClient', () => ({
  slackClient: {
    chat: {
      postMessage: jest.fn(),
    },
  },
}));

describe('postMessage', () => {
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should post message successfully', async () => {
    const mockResponse = { ok: true };
    (slackClient.chat.postMessage as jest.Mock).mockResolvedValue(mockResponse);

    const message = { text: 'test message' };
    const result = await postMessage('channel-id', message);

    expect(result).toEqual(mockResponse);
    expect(slackClient.chat.postMessage).toHaveBeenCalledWith({
      ...message,
      channel: 'channel-id',
      token: process.env.SLACK_BOT_TOKEN,
    });
  });

  it('should throw error when Slack API fails', async () => {
    (slackClient.chat.postMessage as jest.Mock).mockResolvedValue({
      ok: false,
      error: 'channel_not_found',
    });

    await expect(postMessage('channel-id', { text: 'test' })).rejects.toThrow(
      'Failed to post message: channel_not_found',
    );
  });
});
