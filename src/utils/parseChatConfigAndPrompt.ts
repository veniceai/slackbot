import { ChatConfigKey, PartialChatConfig, chatConfigKeys, chatConfigSchema } from '../configs/chatConfig';

/**
 * Parses a string input that may contain configuration parameters and a prompt.
 * Input format: "param1:value1, param2:value2, actual prompt text"
 * Example: "temperature:0.7, model:llama-3.3-70b, Tell me a story about a cat"
 */
export const parseChatConfigAndPrompt = (input: string): { config: PartialChatConfig; prompt: string } => {
  const parts = input.split(',');
  const pairs: [string, string][] = [];
  let lastValidConfigIndex = -1;

  // Collect all valid config pairs
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;
    const trimmed = part.trim();
    const [potentialKey, ...valueParts] = trimmed.split(':');
    const key = potentialKey?.trim();

    // Special handling for prompt which can contain spaces
    if (key === 'prompt' && valueParts.length > 0) {
      const value = valueParts.join(':').trim();
      if (value) {
        pairs.push([key, value]);
        lastValidConfigIndex = i;
        continue;
      }
    }

    // Only consider it a valid config pair if there's no space in either key or first value part
    const firstValuePart = valueParts[0]?.trim() || '';
    if (key && !key.includes(' ') && firstValuePart && !firstValuePart.includes(' ')) {
      if (chatConfigKeys.includes(key as ChatConfigKey)) {
        pairs.push([key, firstValuePart]);
        lastValidConfigIndex = i;
      }
    }
  }

  const configObject = pairs.reduce<Record<string, unknown>>((acc, [key, value]) => {
    try {
      // Handle numeric values
      if (['max_completion_tokens', 'temperature', 'top_p', 'frequency_penalty', 'presence_penalty'].includes(key)) {
        const numValue = Number(value);
        if (isNaN(numValue)) return acc;
        return { ...acc, [key]: numValue };
      }
      // Handle boolean values
      if (key === 'include_venice_system_prompt') {
        return { ...acc, [key]: value.toLowerCase() === 'true' };
      }
      // Handle string values (model, character_slug, prompt)
      return { ...acc, [key]: value };
    } catch {
      return acc;
    }
  }, {});

  const parsed = chatConfigSchema.safeParse(configObject);

  return {
    config: parsed.success ? parsed.data : {},
    prompt: parts
      .slice(lastValidConfigIndex + 1)
      .join(',')
      .trim(),
  };
};
