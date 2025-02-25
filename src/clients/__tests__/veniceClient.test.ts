import MockAdapter from 'axios-mock-adapter';

import { veniceClient } from '../veniceClient';

describe('veniceClient', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(veniceClient);
  });

  afterEach(() => {
    mock.reset();
  });

  it('should be configured with correct base URL', () => {
    expect(veniceClient.defaults.baseURL).toBe('https://api.venice.ai/api/v1');
  });

  it('should have correct headers', () => {
    expect(veniceClient.defaults.headers).toMatchObject({
      Authorization: expect.stringContaining('Bearer '),
      'Content-Type': 'application/json',
    });
  });

  it('should have 120000ms timeout', () => {
    expect(veniceClient.defaults.timeout).toBe(120000);
  });

  it('should accept only 2xx status codes', () => {
    const validateStatus = veniceClient.defaults.validateStatus;
    expect(validateStatus!(200)).toBe(true);
    expect(validateStatus!(299)).toBe(true);
    expect(validateStatus!(300)).toBe(false);
    expect(validateStatus!(400)).toBe(false);
    expect(validateStatus!(500)).toBe(false);
  });

  it('should handle successful requests', async () => {
    const mockData = { data: 'test' };
    mock.onGet('/test').reply(200, mockData);

    const response = await veniceClient.get('/test');
    expect(response.data).toEqual(mockData);
  });

  it('should handle and log error responses', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const mockError = { message: 'error' };
    mock.onGet('/error').reply(400, mockError);

    await expect(veniceClient.get('/error')).rejects.toThrow();
    expect(consoleSpy).toHaveBeenCalledWith(
      'Venice API error:',
      expect.objectContaining({
        data: mockError,
        status: 400,
        url: '/error',
      }),
    );

    consoleSpy.mockRestore();
  });
});
