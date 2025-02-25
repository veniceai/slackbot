import { chatConfig, chatConfigSchema, PartialChatConfig } from '../chatConfig';

describe('chatConfig', () => {
  it('should validate a valid complete config', () => {
    const result = chatConfigSchema.safeParse(chatConfig);
    expect(result.success).toBe(true);
  });

  it('should validate a valid partial config', () => {
    const partialConfig: PartialChatConfig = {
      temperature: 0.7,
      model: 'llama-3.3-70b',
    };
    const result = chatConfigSchema.safeParse(partialConfig);
    expect(result.success).toBe(true);
  });

  it('should reject invalid temperature values', () => {
    const invalidConfig: PartialChatConfig = {
      temperature: 2.5, // Max is 2
    };
    const result = chatConfigSchema.safeParse(invalidConfig);
    expect(result.success).toBe(false);
  });

  it('should reject invalid penalty values', () => {
    const invalidConfig: PartialChatConfig = {
      frequency_penalty: 3, // Max is 2
      presence_penalty: -3, // Min is -2
    };
    const result = chatConfigSchema.safeParse(invalidConfig);
    expect(result.success).toBe(false);
  });

  it('should validate venice parameters correctly', () => {
    const validConfig: PartialChatConfig = {
      character_slug: 'test-character',
      include_venice_system_prompt: true,
    };
    const result = chatConfigSchema.safeParse(validConfig);
    expect(result.success).toBe(true);
  });

  it('should validate partial venice parameters', () => {
    const validConfig: PartialChatConfig = {
      character_slug: 'test-character',
      // include_venice_system_prompt omitted
    };
    const result = chatConfigSchema.safeParse(validConfig);
    expect(result.success).toBe(true);
  });
});
