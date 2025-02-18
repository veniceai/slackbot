import { postMessage } from './postMessage';
import { postUrlResponse } from './postUrlResponse';

type ThinkingMessageReturn<T> = T extends string ? undefined : T extends undefined ? string : string | undefined;

export const postThinkingMessage = async <T extends string | undefined>(
  channel: string,
  type: 'image' | 'text',
  message: string,
  responseUrl?: T,
): Promise<ThinkingMessageReturn<T>> => {
  try {
    const imageThinking = type === 'image' ? `Generating image for prompt "${message}..."` : undefined;
    const chatThinking = type === 'text' ? `Thinking about "${message}"...` : 'Generating response...';

    // If responseUrl is provided, post to it
    if (responseUrl) {
      const response = await postUrlResponse(responseUrl, true, {
        text: `:hourglass_flowing_sand: ${imageThinking ?? chatThinking}`,
      });

      if (response.status !== 200) {
        throw new Error('Failed to post thinking message');
      }

      return undefined as ThinkingMessageReturn<T>;
    }

    const response = await postMessage(channel, {
      text: `:hourglass_flowing_sand: ${imageThinking ?? chatThinking}`,
    });

    if (!response.ok || !response.ts) {
      throw new Error('Failed to post thinking message');
    }

    return response.ts as ThinkingMessageReturn<T>;
  } catch (error) {
    console.error('Error posting thinking message:', error);
    throw error;
  }
};
