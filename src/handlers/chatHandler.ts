import { postUrlResponse } from '../services/slack/postUrlResponse';
import { SlackBlock } from '../services/slack/types/SlackBlock';
import { generateChatCompletion } from '../services/venice/generateChatCompletion';
import { parseChatConfigAndPrompt } from '../utils/parseChatConfigAndPrompt';

import type { SlackCommandPayload } from './types/SlackCommandPayload';

export const chatHandler = async (event: SlackCommandPayload): Promise<void> => {
  try {
    const { config, prompt } = parseChatConfigAndPrompt(event.text);

    await postUrlResponse(event.response_url, false, {
      blocks: [
        {
          text: {
            text: `:hourglass_flowing_sand: Thinking about:`,
            type: 'mrkdwn',
          },
          type: 'section',
        },
        {
          text: {
            text: `> @${event.user_name}: ${prompt}`,
            type: 'mrkdwn',
          },
          type: 'section',
        },
      ],
      text: prompt,
    });

    const response = await generateChatCompletion([{ content: prompt, role: 'user' }], config);

    // Split response into chunks at last whitespace before 3000 chars
    const chunks: string[] = [];
    let remaining = response;

    while (remaining.length > 3000) {
      const lastSpace = remaining.lastIndexOf(' ', 3000);
      if (lastSpace === -1) break; // Fallback if no space found

      chunks.push(remaining.slice(0, lastSpace).trim());
      remaining = remaining.slice(lastSpace + 1);
    }
    if (remaining.length > 0) {
      chunks.push(remaining.trim());
    }

    for (const chunk of chunks) {
      await postUrlResponse(event.response_url, false, {
        blocks: [
          {
            text: {
              text: chunk ?? '',
              type: 'mrkdwn',
            },
            type: 'section',
          },
        ],
        text: chunk,
      });
    }
  } catch (error) {
    console.error('Error handling chat generation:', error);

    const errorBlocks = [
      {
        text: {
          text: '❌ Sorry, there was an error generating the response.',
          type: 'mrkdwn',
        },
        type: 'section',
      },
      {
        text: {
          text: `\`\`\`${error}\`\`\``,
          type: 'mrkdwn',
        },
        type: 'section',
      },
    ] as SlackBlock[];

    await postUrlResponse(event.response_url, false, {
      blocks: errorBlocks,
      text: '❌ Sorry, there was an error generating the response.',
    });
  }
};
