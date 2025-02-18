import { SlackBlock } from './types/SlackBlock';

import { slackClient } from '../../clients/slackClient';

import type { ChatUpdateArguments, ChatUpdateResponse } from '@slack/web-api';

export const updateMessage = async (
  channel: string,
  ts: string,
  message: Omit<ChatUpdateArguments, 'channel' | 'attachments' | 'ts'> & { blocks?: SlackBlock[] },
): Promise<ChatUpdateResponse> => {
  try {
    const response = await slackClient.chat.update({
      ...message,
      channel,
      token: process.env.SLACK_BOT_TOKEN,
      ts,
    } as ChatUpdateArguments);

    if (!response.ok) {
      throw new Error(`Failed to update message: ${response.error}`);
    }

    return response;
  } catch (error) {
    console.error('Error updating message:', error);
    throw error;
  }
};
