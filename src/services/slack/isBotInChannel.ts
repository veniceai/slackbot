import { slackClient } from '../../clients/slackClient';

export const isBotInChannel = async (channelId: string): Promise<boolean> => {
  try {
    const auth = await slackClient.auth.test({ token: process.env.SLACK_BOT_TOKEN });
    const response = await slackClient.conversations.members({
      channel: channelId,
      token: process.env.SLACK_BOT_TOKEN,
    });
    return (!!auth.user_id && response.members?.includes(auth.user_id)) ?? false;
  } catch (error) {
    console.error('Error checking if bot is in channel:', error);
    return false;
  }
};
