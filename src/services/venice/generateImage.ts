import { getAvailableModels } from './getAvailableModels';

import { veniceClient } from '../../clients/veniceClient';
import { PartialImageConfig, imageConfig } from '../../configs/imageConfig';

export interface VeniceImageResponse {
  images?: string[];
}

const isValidBase64 = (str: string): boolean => {
  // Check if string matches base64 pattern
  const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
  if (!base64Regex.test(str)) {
    return false;
  }

  try {
    // Try to decode and check if it results in valid data
    const decoded = Buffer.from(str, 'base64').toString('base64');
    return decoded === str;
  } catch {
    return false;
  }
};

export const generateImage = async (prompt: string, partialConfig: PartialImageConfig): Promise<string> => {
  try {
    const configForUse = { ...imageConfig, ...partialConfig };

    const models = await getAvailableModels('image');
    const randomIndex = Math.floor(Math.random() * models.length);
    const model = models.map((m) => m.id).includes(configForUse.model) ? configForUse.model : models[randomIndex]?.id;

    if (!model) {
      throw new Error('No available models found');
    }

    const response = await veniceClient.post<VeniceImageResponse>('/image/generate', {
      ...configForUse,
      model,
      prompt,
    });

    if (!response.data || !Array.isArray(response.data.images)) {
      if ((response.data as { error: string }).error) {
        throw new Error((response.data as { error: string }).error);
      }
      throw new Error('Invalid response structure from Venice API');
    }

    const firstImage = response.data.images[0];
    if (!firstImage || typeof firstImage !== 'string') {
      throw new Error('Invalid image data in response');
    }

    if (!isValidBase64(firstImage)) {
      throw new Error('Invalid base64 image data received');
    }

    return firstImage;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
};
