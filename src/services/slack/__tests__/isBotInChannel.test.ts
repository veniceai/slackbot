import { isBotInChannel } from '../isBotInChannel';
import { slackClient } from '../../../clients/slackClient';

jest.mock('../../../clients/slackClient', () => ({
  slackClient: {
    auth: {
      test: jest.fn(),
    },
    conversations: {
      members: jest.fn(),
    },
  },
}));

describe('isBotInChannel', () => {
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should return true when bot is in channel', async () => {
    (slackClient.auth.test as jest.Mock).mockResolvedValue({
      user_id: 'bot-user-id',
    });
    (slackClient.conversations.members as jest.Mock).mockResolvedValue({
      members: ['user1', 'bot-user-id', 'user2'],
    });

    const result = await isBotInChannel('channel-id');
    expect(result).toBe(true);
  });

  it('should return false when bot is not in channel', async () => {
    (slackClient.auth.test as jest.Mock).mockResolvedValue({
      user_id: 'bot-user-id',
    });
    (slackClient.conversations.members as jest.Mock).mockResolvedValue({
      members: ['user1', 'user2'],
    });

    const result = await isBotInChannel('channel-id');
    expect(result).toBe(false);
  });

  it('should return false when auth test fails', async () => {
    (slackClient.auth.test as jest.Mock).mockRejectedValue(new Error('Auth failed'));

    const result = await isBotInChannel('channel-id');
    expect(result).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('should return false when members check fails', async () => {
    (slackClient.auth.test as jest.Mock).mockResolvedValue({
      user_id: 'bot-user-id',
    });
    (slackClient.conversations.members as jest.Mock).mockRejectedValue(new Error('Members check failed'));

    const result = await isBotInChannel('channel-id');
    expect(result).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('should return false when user_id is missing', async () => {
    (slackClient.auth.test as jest.Mock).mockResolvedValue({});
    (slackClient.conversations.members as jest.Mock).mockResolvedValue({
      members: ['user1', 'user2'],
    });

    const result = await isBotInChannel('channel-id');
    expect(result).toBe(false);
  });
});
