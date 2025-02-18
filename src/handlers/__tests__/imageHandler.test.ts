import { imageHandler } from '../imageHandler';
import { isBotInChannel } from '../../services/slack/isBotInChannel';
import { postImage } from '../../services/slack/postImage';
import { postMessage } from '../../services/slack/postMessage';
import { postThinkingMessage } from '../../services/slack/postThinkingMessage';
import { postUrlResponse } from '../../services/slack/postUrlResponse';
import { updateMessage } from '../../services/slack/updateMessage';
import { generateImage } from '../../services/venice/generateImage';
import { parseImageConfigAndPrompt } from '../../utils/parseImageConfigAndPrompt';

jest.mock('../../services/slack/isBotInChannel');
jest.mock('../../services/slack/postImage');
jest.mock('../../services/slack/postMessage');
jest.mock('../../services/slack/postThinkingMessage');
jest.mock('../../services/slack/postUrlResponse');
jest.mock('../../services/slack/updateMessage');
jest.mock('../../services/venice/generateImage');
jest.mock('../../utils/parseImageConfigAndPrompt');

describe('imageHandler', () => {
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

  const mockEvent = {
    channel_id: 'channel123',
    user_name: 'testuser',
    user_id: 'U123456',
    command: '/venice',
    response_url: 'http://response.url',
    text: 'A beautiful sunset',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (parseImageConfigAndPrompt as jest.Mock).mockReturnValue({
      config: {},
      prompt: 'A beautiful sunset',
    });
    (isBotInChannel as jest.Mock).mockResolvedValue(true);
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should handle successful image generation', async () => {
    const mockThinkingTs = 'thinking123';
    const mockBase64Image = 'base64image';

    (postThinkingMessage as jest.Mock).mockResolvedValue(mockThinkingTs);
    (generateImage as jest.Mock).mockResolvedValue(mockBase64Image);
    (postImage as jest.Mock).mockResolvedValue('file123');

    await imageHandler(mockEvent);

    expect(postThinkingMessage).toHaveBeenCalledWith(mockEvent.channel_id, 'image', 'A beautiful sunset');
    expect(generateImage).toHaveBeenCalledWith('A beautiful sunset', {});
    expect(postImage).toHaveBeenCalledWith(
      mockBase64Image,
      mockEvent.channel_id,
      'A beautiful sunset',
      mockEvent.user_name,
      mockThinkingTs,
    );
  });

  it('should handle bot not in channel', async () => {
    (isBotInChannel as jest.Mock).mockResolvedValue(false);

    await imageHandler(mockEvent);

    expect(postUrlResponse).toHaveBeenCalledWith(
      mockEvent.response_url,
      true,
      expect.objectContaining({
        text: expect.stringContaining('Please add the Venice AI bot'),
      }),
    );
    expect(generateImage).not.toHaveBeenCalled();
  });

  it('should handle errors with thinking message', async () => {
    const mockThinkingTs = 'thinking123';
    const error = new Error('Generation failed');

    (postThinkingMessage as jest.Mock).mockResolvedValue(mockThinkingTs);
    (generateImage as jest.Mock).mockRejectedValue(error);

    await imageHandler(mockEvent);

    expect(updateMessage).toHaveBeenCalledWith(
      mockEvent.channel_id,
      mockThinkingTs,
      expect.objectContaining({
        blocks: expect.arrayContaining([
          expect.objectContaining({
            text: expect.objectContaining({
              text: expect.stringContaining('error'),
            }),
          }),
        ]),
      }),
    );
  });

  it('should handle errors without thinking message', async () => {
    const error = new Error('Generation failed');

    (postThinkingMessage as jest.Mock).mockRejectedValue(error);

    await imageHandler(mockEvent);

    expect(postMessage).toHaveBeenCalledWith(
      mockEvent.channel_id,
      expect.objectContaining({
        blocks: expect.arrayContaining([
          expect.objectContaining({
            text: expect.objectContaining({
              text: expect.stringContaining('error'),
            }),
          }),
        ]),
      }),
    );
  });
});
