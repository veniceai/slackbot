import { ImageConfigKey, PartialImageConfig, imageConfigKeys, imageConfigSchema } from '../configs/imageConfig';

/**
 * Parses a string input that may contain configuration parameters and a prompt.
 * Input format: "param1:value1, param2:value2, actual prompt text"
 * Example: "width:512, height:512, safe_mode:false, a photo of a cat"
 */
export const parseImageConfigAndPrompt = (input: string): { config: PartialImageConfig; prompt: string } => {
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

    // Special handling for negative_prompt which can contain spaces
    if (key === 'negative_prompt' && valueParts.length > 0) {
      const value = valueParts.join(':').trim();
      if (value) {
        pairs.push([key, value]);
        lastValidConfigIndex = i;
        continue;
      }
    }

    // For all other parameters, maintain strict no-spaces validation
    const firstValuePart = valueParts[0]?.trim() || '';
    if (key && !key.includes(' ') && firstValuePart && !firstValuePart.includes(' ')) {
      if (imageConfigKeys.includes(key as ImageConfigKey)) {
        pairs.push([key, firstValuePart]);
        lastValidConfigIndex = i;
      }
    }
  }

  const configObject = pairs.reduce<Record<string, unknown>>((acc, [key, value]) => {
    try {
      // Handle numeric values
      if (['height', 'width', 'steps', 'cfg_scale', 'seed'].includes(key)) {
        const numValue = Number(value);
        if (isNaN(numValue)) return acc;
        return { ...acc, [key]: numValue };
      }
      // Handle boolean values
      if (['hide_watermark', 'safe_mode'].includes(key)) {
        return { ...acc, [key]: value.toLowerCase() === 'true' };
      }
      // Handle string values (model, style_preset, negative_prompt)
      return { ...acc, [key]: value };
    } catch {
      return acc;
    }
  }, {});

  const parsed = imageConfigSchema.safeParse(configObject);

  return {
    config: parsed.success ? parsed.data : {},
    prompt: parts
      .slice(lastValidConfigIndex + 1)
      .join(',')
      .trim(),
  };
};
