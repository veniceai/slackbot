import { imageConfig, imageConfigSchema, PartialImageConfig, StylePreset } from '../imageConfig';

describe('imageConfig', () => {
  it('should validate a valid complete config', () => {
    const result = imageConfigSchema.safeParse(imageConfig);
    expect(result.success).toBe(true);
  });

  it('should validate a valid partial config', () => {
    const partialConfig: PartialImageConfig = {
      width: 512,
      height: 512,
      cfg_scale: 8,
    };
    const result = imageConfigSchema.safeParse(partialConfig);
    expect(result.success).toBe(true);
  });

  it('should validate valid style presets', () => {
    const validStyles: StylePreset[] = ['3D Model', 'Anime', 'Watercolor'];

    validStyles.forEach((style) => {
      const config: PartialImageConfig = {
        style_preset: style,
      };
      const result = imageConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });
  });

  it('should reject invalid style presets', () => {
    const config: PartialImageConfig = {
      // @ts-expect-error Testing invalid style
      style_preset: 'InvalidStyle',
    };
    const result = imageConfigSchema.safeParse(config);
    expect(result.success).toBe(false);
  });

  it('should validate boolean fields', () => {
    const config: PartialImageConfig = {
      hide_watermark: true,
      safe_mode: false,
    };
    const result = imageConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
  });

  it('should validate numeric fields', () => {
    const config: PartialImageConfig = {
      seed: 12345,
      steps: 50,
      width: 2048,
      height: 2048,
    };
    const result = imageConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
  });
});
