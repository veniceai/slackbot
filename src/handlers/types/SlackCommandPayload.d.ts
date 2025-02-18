export interface SlackCommandPayload {
  channel_id: string;
  command: string;
  response_url: string;
  text: string;
  user_id: string;
  user_name: string;
}
