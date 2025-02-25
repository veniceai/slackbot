import { slackClient } from '../../clients/slackClient';

import type { ChatDeleteResponse } from '@slack/web-api';

export const deleteMessage = async (channel: string, ts: string): Promise<ChatDeleteResponse> => {
  try {
    const response = await slackClient.chat.delete({ channel, token: process.env.SLACK_BOT_TOKEN, ts });

    if (!response.ok) {
      throw new Error(`Failed to delete message: ${response.error}`);
    }

    return response;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};
