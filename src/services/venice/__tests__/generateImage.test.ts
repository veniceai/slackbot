import { generateImage } from '../generateImage';
import { veniceClient } from '../../../clients/veniceClient';
import { getAvailableModels } from '../getAvailableModels';

jest.mock('../../../clients/veniceClient', () => ({
  veniceClient: {
    post: jest.fn(),
  },
}));

jest.mock('../getAvailableModels', () => ({
  getAvailableModels: jest.fn(),
}));

describe('generateImage', () => {
  // Spy on console methods
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should successfully generate an image', async () => {
    const mockModels = [{ id: 'model1' }, { id: 'model2' }];
    (getAvailableModels as jest.Mock).mockResolvedValue(mockModels);

    const base64Image =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    const mockResponse = {
      data: {
        images: [base64Image],
      },
    };
    (veniceClient.post as jest.Mock).mockResolvedValue(mockResponse);

    const prompt = 'A beautiful sunset';
    const config = { width: 512, height: 512 };

    const result = await generateImage(prompt, config);

    expect(result).toBe(base64Image);
    expect(veniceClient.post).toHaveBeenCalledWith(
      '/image/generate',
      expect.objectContaining({
        prompt,
        width: 512,
        height: 512,
      }),
    );
  });

  it('should throw error when no models are available', async () => {
    (getAvailableModels as jest.Mock).mockResolvedValue([]);

    const prompt = 'A beautiful sunset';
    const config = {};

    await expect(generateImage(prompt, config)).rejects.toThrow('No available models found');
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

    const prompt = 'A beautiful sunset';
    const config = {};

    await expect(generateImage(prompt, config)).rejects.toThrow(errorMessage);
  });

  it('should use provided model if available', async () => {
    const mockModels = [{ id: 'model1' }, { id: 'model2' }];
    (getAvailableModels as jest.Mock).mockResolvedValue(mockModels);

    const base64Image =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    const mockResponse = {
      data: {
        images: [base64Image],
      },
    };
    (veniceClient.post as jest.Mock).mockResolvedValue(mockResponse);

    const prompt = 'A beautiful sunset';
    const config = { model: 'model1' };

    await generateImage(prompt, config);

    expect(veniceClient.post).toHaveBeenCalledWith(
      '/image/generate',
      expect.objectContaining({
        model: 'model1',
      }),
    );
  });

  it('should throw error for invalid base64 image data', async () => {
    const mockModels = [{ id: 'model1' }];
    (getAvailableModels as jest.Mock).mockResolvedValue(mockModels);

    const mockResponse = {
      data: {
        images: ['not-valid-base64'],
      },
    };
    (veniceClient.post as jest.Mock).mockResolvedValue(mockResponse);

    const prompt = 'A beautiful sunset';
    const config = {};

    await expect(generateImage(prompt, config)).rejects.toThrow('Invalid base64 image data received');
  });

  it('should throw error for invalid response structure', async () => {
    const mockModels = [{ id: 'model1' }];
    (getAvailableModels as jest.Mock).mockResolvedValue(mockModels);

    const mockResponse = {
      data: {
        images: null,
      },
    };
    (veniceClient.post as jest.Mock).mockResolvedValue(mockResponse);

    const prompt = 'A beautiful sunset';
    const config = {};

    await expect(generateImage(prompt, config)).rejects.toThrow('Invalid response structure from Venice API');
  });
});
