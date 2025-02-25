import { getAvailableModels } from './getAvailableModels';

import { veniceClient } from '../../clients/veniceClient';
import { PartialChatConfig, chatConfig } from '../../configs/chatConfig';

export interface VeniceChatMessage {
  content: string;
  role: 'system' | 'user';
  name?: string;
}

export interface VeniceChatConfig {
  frequency_penalty?: number;
  max_completion_tokens?: number;
  model?: string;
  presence_penalty?: number;
  stream?: boolean;
  temperature?: number;
  top_p?: number;
}

export interface VeniceChatResponse {
  choices?: Array<{
    message?: {
      content: string;
    };
  }>;
}

export const generateChatCompletion = async (
  messages: VeniceChatMessage[],
  partialConfig: PartialChatConfig,
): Promise<string> => {
  try {
    const configForUse = { ...chatConfig, ...partialConfig };

    const models = await getAvailableModels('text');
    const randomIndex = Math.floor(Math.random() * models.length);
    const model = models.map((m) => m.id).includes(configForUse.model) ? configForUse.model : models[randomIndex]?.id;

    if (!model) {
      throw new Error('No available models found');
    }

    const response = await veniceClient.post<VeniceChatResponse>('/chat/completions', {
      ...configForUse,
      messages: messages.length > 0 ? messages : null,
      model,
    });

    console.log('response', response);

    const firstChoice = response.data.choices?.[0]?.message?.content;
    if (!firstChoice) {
      if ((response.data as { error: string }).error) {
        throw new Error((response.data as { error: string }).error);
      }
      throw new Error(`Invalid response from Venice API: ${JSON.stringify(response.data)}`);
    }

    return firstChoice;
  } catch (error) {
    console.error('Error generating chat completion:', error);
    throw error;
  }
};
