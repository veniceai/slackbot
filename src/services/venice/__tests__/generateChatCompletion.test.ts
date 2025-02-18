import { generateChatCompletion } from '../generateChatCompletion';
import { veniceClient } from '../../../clients/veniceClient';
import { getAvailableModels } from '../getAvailableModels';

// Mock the dependencies
jest.mock('../../../clients/veniceClient', () => ({
  veniceClient: {
    post: jest.fn(),
  },
}));

jest.mock('../getAvailableModels', () => ({
  getAvailableModels: jest.fn(),
}));

describe('generateChatCompletion', () => {
  // Spy on console methods
  const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('should successfully generate a chat completion', async () => {
    // Mock the available models
    const mockModels = [{ id: 'model1' }, { id: 'model2' }];
    (getAvailableModels as jest.Mock).mockResolvedValue(mockModels);

    // Mock the API response
    const mockResponse = {
      data: {
        choices: [
          {
            message: {
              content: 'Hello, world!',
            },
          },
        ],
      },
    };
    (veniceClient.post as jest.Mock).mockResolvedValue(mockResponse);

    const messages = [{ role: 'user' as const, content: 'Hello' }];
    const config = { temperature: 0.7 };

    const result = await generateChatCompletion(messages, config);

    expect(result).toBe('Hello, world!');
    expect(veniceClient.post).toHaveBeenCalledWith(
      '/chat/completions',
      expect.objectContaining({
        messages,
        temperature: 0.7,
      }),
    );
  });

  it('should throw error when no models are available', async () => {
    (getAvailableModels as jest.Mock).mockResolvedValue([]);

    const messages = [{ role: 'user' as const, content: 'Hello' }];
    const config = {};

    await expect(generateChatCompletion(messages, config)).rejects.toThrow('No available models found');
  });

  it('should handle API error responses', async () => {
    (getAvailableModels as jest.Mock).mockResolvedValue([{ id: 'model1' }]);

    const errorMessage = 'API Error';
    const mockResponse = {
      data: {
        error: errorMessage,
      },
    };
    (veniceClient.post as jest.Mock).mockResolvedValue(mockResponse);

    const messages = [{ role: 'user' as const, content: 'Hello' }];
    const config = {};

    await expect(generateChatCompletion(messages, config)).rejects.toThrow(errorMessage);
  });

  it('should use provided model if available', async () => {
    const mockModels = [{ id: 'model1' }, { id: 'model2' }];
    (getAvailableModels as jest.Mock).mockResolvedValue(mockModels);

    const mockResponse = {
      data: {
        choices: [
          {
            message: {
              content: 'Response',
            },
          },
        ],
      },
    };
    (veniceClient.post as jest.Mock).mockResolvedValue(mockResponse);

    const messages = [{ role: 'user' as const, content: 'Hello' }];
    const config = { model: 'model1' };

    await generateChatCompletion(messages, config);

    expect(veniceClient.post).toHaveBeenCalledWith(
      '/chat/completions',
      expect.objectContaining({
        model: 'model1',
      }),
    );
  });
});
