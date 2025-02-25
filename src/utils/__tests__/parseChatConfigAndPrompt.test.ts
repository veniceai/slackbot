import { parseChatConfigAndPrompt } from '../parseChatConfigAndPrompt';

describe('parseChatConfigAndPrompt', () => {
  it('should parse empty input', () => {
    const result = parseChatConfigAndPrompt('');
    expect(result).toEqual({ config: {}, prompt: '' });
  });

  it('should parse prompt only', () => {
    const result = parseChatConfigAndPrompt('Tell me a story about a cat');
    expect(result).toEqual({ config: {}, prompt: 'Tell me a story about a cat' });
  });

  it('should parse single config parameter', () => {
    const result = parseChatConfigAndPrompt('temperature:0.7, Tell me a story');
    expect(result).toEqual({
      config: { temperature: 0.7 },
      prompt: 'Tell me a story',
    });
  });

  it('should parse multiple config parameters', () => {
    const result = parseChatConfigAndPrompt(
      'temperature:0.7, model:llama-3.3-70b, max_completion_tokens:2000, Tell me a story',
    );
    expect(result).toEqual({
      config: {
        temperature: 0.7,
        model: 'llama-3.3-70b',
        max_completion_tokens: 2000,
      },
      prompt: 'Tell me a story',
    });
  });

  it('should handle prompts containing commas', () => {
    const result = parseChatConfigAndPrompt('temperature:0.7, Write a list of fruits: apple, banana, orange');
    expect(result).toEqual({
      config: { temperature: 0.7 },
      prompt: 'Write a list of fruits: apple, banana, orange',
    });
  });

  it('should parse all numeric parameters correctly', () => {
    const result = parseChatConfigAndPrompt(
      'temperature:0.7, top_p:0.9, frequency_penalty:1.5, presence_penalty:-0.5, max_completion_tokens:1000, Hello',
    );
    expect(result).toEqual({
      config: {
        temperature: 0.7,
        top_p: 0.9,
        frequency_penalty: 1.5,
        presence_penalty: -0.5,
        max_completion_tokens: 1000,
      },
      prompt: 'Hello',
    });
  });

  it('should parse boolean and string parameters correctly', () => {
    const result = parseChatConfigAndPrompt(
      'character_slug:assistant, include_venice_system_prompt:true, model:llama-3.3-70b, Hello',
    );
    expect(result).toEqual({
      config: {
        character_slug: 'assistant',
        include_venice_system_prompt: true,
        model: 'llama-3.3-70b',
      },
      prompt: 'Hello',
    });
  });

  it('should handle boolean values case-insensitively', () => {
    const result = parseChatConfigAndPrompt('include_venice_system_prompt:TRUE, Hello');
    expect(result).toEqual({
      config: {
        include_venice_system_prompt: true,
      },
      prompt: 'Hello',
    });
  });

  it('should ignore invalid config keys', () => {
    const result = parseChatConfigAndPrompt('invalid_key:value, temperature:0.7, Hello');
    expect(result).toEqual({
      config: { temperature: 0.7 },
      prompt: 'Hello',
    });
  });

  it('should handle malformed input without comma separator', () => {
    const result = parseChatConfigAndPrompt('model:test Hello');
    expect(result).toEqual({
      config: {},
      prompt: 'model:test Hello',
    });
  });

  it('should handle config parameters with spaces correctly', () => {
    const result = parseChatConfigAndPrompt('model:llama-3.3-70b, temperature:0.7, Tell me a story');
    expect(result).toEqual({
      config: {
        model: 'llama-3.3-70b',
        temperature: 0.7,
      },
      prompt: 'Tell me a story',
    });
  });

  it('should ignore malformed config values', () => {
    const result = parseChatConfigAndPrompt('temperature:invalid, model:llama-3.3-70b, Hello');
    expect(result).toEqual({
      config: {
        model: 'llama-3.3-70b',
      },
      prompt: 'Hello',
    });
  });

  it('should handle config values containing colons', () => {
    const result = parseChatConfigAndPrompt('model:llama-3.3-70b, prompt:Write time: 3:00 PM');
    expect(result).toEqual({
      config: {
        model: 'llama-3.3-70b',
        prompt: 'Write time: 3:00 PM',
      },
      prompt: '',
    });
  });

  it('should ignore invalid numeric values but keep valid config values', () => {
    const result = parseChatConfigAndPrompt(
      'temperature:invalid, model:llama-3.3-70b, top_p:0.9, Hello, there: my friend',
    );
    expect(result).toEqual({
      config: {
        top_p: 0.9,
        model: 'llama-3.3-70b',
      },
      prompt: 'Hello, there: my friend',
    });
  });

  it('should handle invalid numeric values', () => {
    const result = parseChatConfigAndPrompt('temperature:invalid, Hello: there my friend');
    expect(result).toEqual({
      config: {},
      prompt: 'Hello: there my friend',
    });
  });

  it('should validate numeric ranges', () => {
    const result = parseChatConfigAndPrompt('temperature:3.0, top_p:1.5, frequency_penalty:3, Hello, there my friend');
    expect(result).toEqual({
      config: {},
      prompt: 'Hello, there my friend',
    });
  });

  it('should handle multi-word prompt parameter', () => {
    const result = parseChatConfigAndPrompt('prompt:tell me about cats and dogs, model:llama-3.3-70b, Tell me a story');
    expect(result).toEqual({
      config: {
        prompt: 'tell me about cats and dogs',
        model: 'llama-3.3-70b',
      },
      prompt: 'Tell me a story',
    });
  });

  it('should handle prompt parameter with colons', () => {
    const result = parseChatConfigAndPrompt(
      'prompt:write a schedule: 9am: wake up, 10am: work, model:llama-3.3-70b, Hello',
    );
    expect(result).toEqual({
      config: {
        prompt: 'write a schedule: 9am: wake up',
        model: 'llama-3.3-70b',
      },
      prompt: 'Hello',
    });
  });
});
