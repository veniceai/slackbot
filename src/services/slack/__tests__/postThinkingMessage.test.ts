import { postThinkingMessage } from '../postThinkingMessage';
import { postMessage } from '../postMessage';
import { postUrlResponse } from '../postUrlResponse';

jest.mock('../postMessage', () => ({
  postMessage: jest.fn(),
}));

jest.mock('../postUrlResponse', () => ({
  postUrlResponse: jest.fn(),
}));

describe('postThinkingMessage', () => {
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should post image thinking message to channel', async () => {
    (postMessage as jest.Mock).mockResolvedValue({ ok: true, ts: 'message-ts' });

    const result = await postThinkingMessage('channel-id', 'image', 'test prompt');

    expect(result).toBe('message-ts');
    expect(postMessage).toHaveBeenCalledWith('channel-id', {
      text: ':hourglass_flowing_sand: Generating image for prompt "test prompt..."',
    });
  });

  it('should post chat thinking message to channel', async () => {
    (postMessage as jest.Mock).mockResolvedValue({ ok: true, ts: 'message-ts' });

    const result = await postThinkingMessage('channel-id', 'text', 'test prompt');

    expect(result).toBe('message-ts');
    expect(postMessage).toHaveBeenCalledWith('channel-id', {
      text: ':hourglass_flowing_sand: Thinking about "test prompt"...',
    });
  });

  it('should post to response URL when provided', async () => {
    (postUrlResponse as jest.Mock).mockResolvedValue({ status: 200 });

    const result = await postThinkingMessage('channel-id', 'text', 'test prompt', 'response-url');

    expect(result).toBeUndefined();
    expect(postUrlResponse).toHaveBeenCalledWith('response-url', true, {
      text: ':hourglass_flowing_sand: Thinking about "test prompt"...',
    });
  });

  it('should throw error when channel post fails', async () => {
    (postMessage as jest.Mock).mockResolvedValue({ ok: false });

    await expect(postThinkingMessage('channel-id', 'text', 'test prompt')).rejects.toThrow(
      'Failed to post thinking message',
    );
  });

  it('should throw error when response URL post fails', async () => {
    (postUrlResponse as jest.Mock).mockResolvedValue({ status: 500 });

    await expect(postThinkingMessage('channel-id', 'text', 'test prompt', 'response-url')).rejects.toThrow(
      'Failed to post thinking message',
    );
  });
});
