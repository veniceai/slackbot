import { deleteMessage } from './deleteMessage';

import { slackClient } from '../../clients/slackClient';

export const postImage = async (
  base64Image: string,
  channel: string,
  prompt: string,
  userName: string,
  txToRemove?: string,
): Promise<string> => {
  try {
    const imageBuffer = Buffer.from(base64Image, 'base64');

    const uploadResponse = await slackClient.filesUploadV2({
      alt_text: `@${userName}: ${prompt}`,
      channel_id: channel,
      file: imageBuffer,
      filename: 'venice.png',
      title: `@${userName}: ${prompt}`,
      token: process.env.SLACK_BOT_TOKEN,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload file: ${uploadResponse.error}`);
    }

    const fileId = uploadResponse.files?.[0]?.files?.[0]?.id;
    if (!fileId) {
      throw new Error('No file ID returned from upload');
    }

    let attempts = 0;
    const maxAttempts = 25;
    while (attempts < maxAttempts) {
      const fileInfo = await slackClient.files.info({ file: fileId, token: process.env.SLACK_BOT_TOKEN });

      if (fileInfo.ok && fileInfo.file?.mimetype) {
        if (txToRemove) {
          deleteMessage(channel, txToRemove);
        }

        return fileId;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
    }

    throw new Error('File upload processing timed out');
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};
