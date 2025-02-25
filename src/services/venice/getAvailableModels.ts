import { veniceClient } from '../../clients/veniceClient';

export interface VeniceModel {
  id: string;
  name: string;
  type: string;
  description?: string;
}

export const getAvailableModels = async (type: 'text' | 'image'): Promise<VeniceModel[]> => {
  try {
    const response = await veniceClient.get<{ data: VeniceModel[] }>('/models', { params: { type } });
    return response?.data?.data || [];
  } catch (error) {
    console.error('Error fetching models:', error);
    return [];
  }
};
