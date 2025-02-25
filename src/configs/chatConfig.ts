import { z } from 'zod';

export const chatConfigKeys = [
  'model',
  'prompt',
  'temperature',
  'top_p',
  'max_completion_tokens',
  'frequency_penalty',
  'presence_penalty',
  'character_slug',
  'include_venice_system_prompt',
] as const;

export type ChatConfigKey = (typeof chatConfigKeys)[number];

// Define the base chat configuration
export const chatConfig = {
  character_slug: undefined as string | undefined,
  frequency_penalty: undefined as number | undefined,
  include_venice_system_prompt: undefined as boolean | undefined,
  max_completion_tokens: undefined as number | undefined,
  model: 'llama-3.3-70b' as string,
  presence_penalty: undefined as number | undefined,
  prompt: undefined as string | undefined,
  stream: false, // MUST BE FALSE FOR SLACK
  temperature: undefined as number | undefined,
  top_p: undefined as number | undefined,
} as const;

export type ChatConfig = typeof chatConfig;

// Schema for validation
export const chatConfigSchema = z
  .object({
    character_slug: z.string().optional(),
    frequency_penalty: z.number().min(-2).max(2).optional(),
    include_venice_system_prompt: z.boolean().optional(),
    max_completion_tokens: z.number().optional(),
    model: z.string().optional(),
    presence_penalty: z.number().min(-2).max(2).optional(),
    prompt: z.string().optional(),
    temperature: z.number().min(0).max(2).optional(),
    top_p: z.number().min(0).max(1).optional(),
  })
  .partial();

export type PartialChatConfig = z.infer<typeof chatConfigSchema>;
