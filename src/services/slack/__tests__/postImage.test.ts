import { postImage } from '../postImage';
import { slackClient } from '../../../clients/slackClient';
import { deleteMessage } from '../deleteMessage';

jest.mock('../../../clients/slackClient', () => ({
  slackClient: {
    filesUploadV2: jest.fn(),
    files: {
      info: jest.fn(),
    },
  },
}));

jest.mock('../deleteMessage', () => ({
  deleteMessage: jest.fn(),
}));

describe('postImage', () => {
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should successfully upload and process an image', async () => {
    const fileId = 'test-file-id';
    (slackClient.filesUploadV2 as jest.Mock).mockResolvedValue({
      ok: true,
      files: [{ files: [{ id: fileId }] }],
    });

    (slackClient.files.info as jest.Mock).mockResolvedValue({
      ok: true,
      file: { mimetype: 'image/png' },
    });

    const result = await postImage('base64Image', 'channel-id', 'test prompt', 'testuser', 'message-ts');

    expect(result).toBe(fileId);
    expect(deleteMessage).toHaveBeenCalledWith('channel-id', 'message-ts');
    expect(slackClient.filesUploadV2).toHaveBeenCalledWith(
      expect.objectContaining({
        channel_id: 'channel-id',
        filename: 'venice.png',
        title: '@testuser: test prompt',
      }),
    );
  });

  it('should retry file info check until ready', async () => {
    const fileId = 'test-file-id';
    (slackClient.filesUploadV2 as jest.Mock).mockResolvedValue({
      ok: true,
      files: [{ files: [{ id: fileId }] }],
    });

    // First two calls return without mimetype, third succeeds
    (slackClient.files.info as jest.Mock)
      .mockResolvedValueOnce({ ok: true, file: {} })
      .mockResolvedValueOnce({ ok: true, file: {} })
      .mockResolvedValueOnce({ ok: true, file: { mimetype: 'image/png' } });

    const result = await postImage('base64Image', 'channel-id', 'test prompt', 'testuser');

    expect(result).toBe(fileId);
    expect(slackClient.files.info).toHaveBeenCalledTimes(3);
  });

  it('should throw error when upload fails', async () => {
    (slackClient.filesUploadV2 as jest.Mock).mockResolvedValue({
      ok: false,
      error: 'Upload failed',
    });

    await expect(postImage('base64Image', 'channel-id', 'test prompt', 'testuser')).rejects.toThrow(
      'Failed to upload file: Upload failed',
    );
  });

  it('should throw error when file ID is missing', async () => {
    (slackClient.filesUploadV2 as jest.Mock).mockResolvedValue({
      ok: true,
      files: [],
    });

    await expect(postImage('base64Image', 'channel-id', 'test prompt', 'testuser')).rejects.toThrow(
      'No file ID returned from upload',
    );
  });
});
