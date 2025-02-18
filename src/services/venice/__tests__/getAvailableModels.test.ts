import { getAvailableModels } from '../getAvailableModels';
import { veniceClient } from '../../../clients/veniceClient';

jest.mock('../../../clients/veniceClient', () => ({
  veniceClient: {
    get: jest.fn(),
  },
}));

describe('getAvailableModels', () => {
  // Spy on console methods
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should fetch text models successfully', async () => {
    const mockModels = [
      { id: 'model1', name: 'Model 1', type: 'text' },
      { id: 'model2', name: 'Model 2', type: 'text' },
    ];

    (veniceClient.get as jest.Mock).mockResolvedValue({
      data: { data: mockModels },
    });

    const result = await getAvailableModels('text');

    expect(result).toEqual(mockModels);
    expect(veniceClient.get).toHaveBeenCalledWith('/models', {
      params: { type: 'text' },
    });
  });

  it('should fetch image models successfully', async () => {
    const mockModels = [
      { id: 'model1', name: 'Model 1', type: 'image' },
      { id: 'model2', name: 'Model 2', type: 'image' },
    ];

    (veniceClient.get as jest.Mock).mockResolvedValue({
      data: { data: mockModels },
    });

    const result = await getAvailableModels('image');

    expect(result).toEqual(mockModels);
    expect(veniceClient.get).toHaveBeenCalledWith('/models', {
      params: { type: 'image' },
    });
  });

  it('should return empty array on error', async () => {
    (veniceClient.get as jest.Mock).mockRejectedValue(new Error('API Error'));

    const result = await getAvailableModels('text');

    expect(result).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
