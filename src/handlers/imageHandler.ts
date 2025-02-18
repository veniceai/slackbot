import { isBotInChannel } from '../services/slack/isBotInChannel';
import { postImage } from '../services/slack/postImage';
import { postMessage } from '../services/slack/postMessage';
import { postThinkingMessage } from '../services/slack/postThinkingMessage';
import { postUrlResponse } from '../services/slack/postUrlResponse';
import { SlackBlock } from '../services/slack/types/SlackBlock';
import { updateMessage } from '../services/slack/updateMessage';
import { generateImage } from '../services/venice/generateImage';
import { parseImageConfigAndPrompt } from '../utils/parseImageConfigAndPrompt';

import type { SlackCommandPayload } from './types/SlackCommandPayload';

export const imageHandler = async (event: SlackCommandPayload): Promise<void> => {
  let thinkingTs: string | undefined;

  try {
    const isInChannel = await isBotInChannel(event.channel_id);
    if (!isInChannel) {
      await postUrlResponse(event.response_url, true, {
        text: 'Please add the Venice AI bot to this channel to use image generation commands. You can type @Venice AI to add it. Venice can not create images in DMs due to Slack API limitations.',
      });
      return;
    }

    const input = event.text.trim();
    const { config, prompt } = parseImageConfigAndPrompt(input);
    thinkingTs = await postThinkingMessage(event.channel_id, 'image', prompt);
    const base64Image = await generateImage(prompt, config);

    await postImage(base64Image, event.channel_id, prompt, event.user_name, thinkingTs);
  } catch (error) {
    console.error('Error handling image generation:', error);

    const errorBlocks = [
      {
        text: {
          text: '❌ Sorry, there was an error generating the image.',
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

    if (thinkingTs) {
      await updateMessage(event.channel_id, thinkingTs, {
        blocks: errorBlocks,
        text: '❌ Sorry, there was an error generating the image.',
      });
      return;
    }

    await postMessage(event.channel_id, {
      blocks: errorBlocks,
      text: '❌ Sorry, there was an error generating the image.',
    });
  }
};
