import axios from 'axios';
import { postUrlResponse } from '../postUrlResponse';

jest.mock('axios');

describe('postUrlResponse', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should post ephemeral message successfully', async () => {
    (axios.post as jest.Mock).mockResolvedValue({ status: 200 });

    const message = { text: 'test message' };
    await postUrlResponse('response-url', true, message);

    expect(axios.post).toHaveBeenCalledWith('response-url', message);
  });

  it('should post in-channel message successfully', async () => {
    (axios.post as jest.Mock).mockResolvedValue({ status: 200 });

    const message = { text: 'test message' };
    await postUrlResponse('response-url', false, message);

    expect(axios.post).toHaveBeenCalledWith('response-url', {
      ...message,
      response_type: 'in_channel',
    });
  });

  it('should throw error on non-200 response', async () => {
    (axios.post as jest.Mock).mockResolvedValue({ status: 500 });

    await expect(postUrlResponse('response-url', true, { text: 'test' })).rejects.toThrow(
      'Failed to post thinking message',
    );
  });
});
