import { parseImageConfigAndPrompt } from '../parseImageConfigAndPrompt';

describe('parseImageConfigAndPrompt', () => {
  it('should parse empty input', () => {
    const result = parseImageConfigAndPrompt('');
    expect(result).toEqual({ config: {}, prompt: '' });
  });

  it('should parse prompt only', () => {
    const result = parseImageConfigAndPrompt('A beautiful sunset');
    expect(result).toEqual({ config: {}, prompt: 'A beautiful sunset' });
  });

  it('should parse single config parameter', () => {
    const result = parseImageConfigAndPrompt('width:512, A beautiful sunset');
    expect(result).toEqual({
      config: { width: 512 },
      prompt: 'A beautiful sunset',
    });
  });

  it('should parse multiple config parameters', () => {
    const result = parseImageConfigAndPrompt('width:512, height:512, steps:50, cfg_scale:7.5, A beautiful sunset');
    expect(result).toEqual({
      config: {
        width: 512,
        height: 512,
        steps: 50,
        cfg_scale: 7.5,
      },
      prompt: 'A beautiful sunset',
    });
  });

  it('should parse boolean parameters', () => {
    const result = parseImageConfigAndPrompt('safe_mode:true, hide_watermark:false, A sunset');
    expect(result).toEqual({
      config: {
        safe_mode: true,
        hide_watermark: false,
      },
      prompt: 'A sunset',
    });
  });

  it('should handle boolean values case-insensitively', () => {
    const result = parseImageConfigAndPrompt('safe_mode:TRUE, hide_watermark:FALSE, A sunset');
    expect(result).toEqual({
      config: {
        safe_mode: true,
        hide_watermark: false,
      },
      prompt: 'A sunset',
    });
  });

  it('should handle prompts containing commas', () => {
    const result = parseImageConfigAndPrompt('width:512, Draw me a red car, blue sky, and green grass');
    expect(result).toEqual({
      config: { width: 512 },
      prompt: 'Draw me a red car, blue sky, and green grass',
    });
  });

  it('should parse style_preset', () => {
    const result = parseImageConfigAndPrompt('style_preset:Anime, A beautiful sunset');
    expect(result).toEqual({
      config: { style_preset: 'Anime' },
      prompt: 'A beautiful sunset',
    });
  });

  it('should parse negative prompt', () => {
    const result = parseImageConfigAndPrompt('negative_prompt:blur, A beautiful sunset');
    expect(result).toEqual({
      config: { negative_prompt: 'blur' },
      prompt: 'A beautiful sunset',
    });
  });

  it('should ignore invalid config keys', () => {
    const result = parseImageConfigAndPrompt('invalid_key:value, width:512, A sunset');
    expect(result).toEqual({
      config: { width: 512 },
      prompt: 'A sunset',
    });
  });

  it('should handle malformed input without comma separator', () => {
    const result = parseImageConfigAndPrompt('width:512 A beautiful sunset');
    expect(result).toEqual({
      config: {},
      prompt: 'width:512 A beautiful sunset',
    });
  });

  it('should handle config parameters with spaces correctly', () => {
    const result = parseImageConfigAndPrompt('model:stable-diffusion-xl, width:512, A sunset');
    expect(result).toEqual({
      config: {
        model: 'stable-diffusion-xl',
        width: 512,
      },
      prompt: 'A sunset',
    });
  });

  it('should ignore malformed numeric values but keep valid config values', () => {
    const result = parseImageConfigAndPrompt('width:invalid, model:stable-diffusion-xl, height:512, A sunset');
    expect(result).toEqual({
      config: {
        model: 'stable-diffusion-xl',
        height: 512,
      },
      prompt: 'A sunset',
    });
  });

  it('should handle config values containing colons', () => {
    const result = parseImageConfigAndPrompt('model:stable-diffusion-xl, Draw time: 3:00 PM');
    expect(result).toEqual({
      config: {
        model: 'stable-diffusion-xl',
      },
      prompt: 'Draw time: 3:00 PM',
    });
  });

  it('should handle invalid numeric values', () => {
    const result = parseImageConfigAndPrompt('width:invalid, A sunset');
    expect(result).toEqual({
      config: {},
      prompt: 'A sunset',
    });
  });

  it('should parse seed parameter', () => {
    const result = parseImageConfigAndPrompt('seed:12345, width:512, A sunset');
    expect(result).toEqual({
      config: {
        seed: 12345,
        width: 512,
      },
      prompt: 'A sunset',
    });
  });

  it('should handle multiple style-related parameters', () => {
    const result = parseImageConfigAndPrompt(
      'style_preset:Anime, negative_prompt:blur and noise, model:stable-diffusion-xl, A beautiful character',
    );
    expect(result).toEqual({
      config: {
        style_preset: 'Anime',
        negative_prompt: 'blur and noise',
        model: 'stable-diffusion-xl',
      },
      prompt: 'A beautiful character',
    });
  });

  it('should handle all numeric parameters together', () => {
    const result = parseImageConfigAndPrompt(
      'width:512, height:512, steps:30, cfg_scale:7.5, seed:12345, A beautiful sunset',
    );
    expect(result).toEqual({
      config: {
        width: 512,
        height: 512,
        steps: 30,
        cfg_scale: 7.5,
        seed: 12345,
      },
      prompt: 'A beautiful sunset',
    });
  });

  it('should handle multi-word string parameters', () => {
    const result = parseImageConfigAndPrompt(
      'negative_prompt:blurry and low quality, model:stable-diffusion-xl, A sunset',
    );
    expect(result).toEqual({
      config: {
        negative_prompt: 'blurry and low quality',
        model: 'stable-diffusion-xl',
      },
      prompt: 'A sunset',
    });
  });
});
