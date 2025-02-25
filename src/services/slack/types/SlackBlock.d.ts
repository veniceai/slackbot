export interface SlackBlock {
  type: string;
  accessory?: unknown;
  alt_text?: string;
  element?: {
    action_id: string;
    type: string;
    initial_value?: string;
    placeholder?: {
      text: string;
      type: string;
    };
  };
  image_url?: string;
  label?: {
    text: string;
    type: string;
  };
  slack_file?: {
    id: string;
  };
  text?: {
    text: string;
    type: string;
  };
  title?: {
    text: string;
    type: string;
  };
}
