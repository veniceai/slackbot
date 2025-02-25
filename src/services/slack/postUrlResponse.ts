import axios, { AxiosResponse } from 'axios';

import type { SlackBlock } from './types/SlackBlock';
import type { ChatPostMessageArguments } from '@slack/web-api';

export const postUrlResponse = async (
  responseUrl: string,
  isEphemeral: boolean,
  message: Omit<ChatPostMessageArguments, 'channel' | 'attachments'> & { blocks?: SlackBlock[] },
): Promise<AxiosResponse> => {
  const response = await axios.post(responseUrl, isEphemeral ? message : { ...message, response_type: 'in_channel' });

  if (response.status !== 200) {
    throw new Error('Failed to post thinking message');
  }

  return response;
};
