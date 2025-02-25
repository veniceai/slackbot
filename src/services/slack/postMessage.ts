import { SlackBlock } from './types/SlackBlock';

import { slackClient } from '../../clients/slackClient';

import type { ChatPostMessageArguments, ChatPostMessageResponse } from '@slack/web-api';

export const postMessage = async (
  channel: string,
  message: Omit<ChatPostMessageArguments, 'channel' | 'attachments'> & { blocks?: SlackBlock[] },
): Promise<ChatPostMessageResponse> => {
  try {
    const response = await slackClient.chat.postMessage({
      ...message,
      channel,
      token: process.env.SLACK_BOT_TOKEN,
    } as ChatPostMessageArguments);

    if (!response.ok) {
      throw new Error(`Failed to post message: ${response.error}`);
    }

    return response;
  } catch (error) {
    console.error('Error posting message:', error);
    throw error;
  }
};
