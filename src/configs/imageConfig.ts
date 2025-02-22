import { z } from 'zod';

export const imageConfigKeys = [
  'cfg_scale',
  'height',
  'hide_watermark',
  'model',
  'negative_prompt',
  'safe_mode',
  'seed',
  'steps',
  'style_preset',
  'width',
] as const;

export type ImageConfigKey = (typeof imageConfigKeys)[number];

export const stylePresetEnum = z.enum([
  '3D Model',
  'Abstract',
  'Advertising',
  'Alien',
  'Analog Film',
  'Anime',
  'Architectural',
  'Cinematic',
  'Collage',
  'Comic Book',
  'Craft Clay',
  'Cubist',
  'Digital Art',
  'Disco',
  'Dreamscape',
  'Dystopian',
  'Enhance',
  'Fairy Tale',
  'Fantasy Art',
  'Fighting Game',
  'Film Noir',
  'Flat Papercut',
  'Food Photography',
  'Gothic',
  'GTA',
  'Graffiti',
  'Grunge',
  'HDR',
  'Horror',
  'Hyperrealism',
  'Impressionist',
  'Isometric Style',
  'Kirigami',
  'Legend of Zelda',
  'Line Art',
  'Long Exposure',
  'Lowpoly',
  'Minecraft',
  'Minimalist',
  'Monochrome',
  'Nautical',
  'Neon Noir',
  'Neon Punk',
  'Origami',
  'Paper Mache',
  'Paper Quilling',
  'Papercut Collage',
  'Papercut Shadow Box',
  'Photographic',
  'Pixel Art',
  'Pokemon',
  'Pointillism',
  'Pop Art',
  'Psychedelic',
  'Real Estate',
  'Renaissance',
  'Retro Arcade',
  'Retro Game',
  'RPG Fantasy Game',
  'Silhouette',
  'Space',
  'Stacked Papercut',
  'Stained Glass',
  'Steampunk',
  'Strategy Game',
  'Street Fighter',
  'Super Mario',
  'Surrealist',
  'Techwear Fashion',
  'Texture',
  'Thick Layered Papercut',
  'Tilt-Shift',
  'Tribal',
  'Typography',
  'Watercolor',
  'Zentangle',
]);

export type StylePreset = z.infer<typeof stylePresetEnum>;

export const imageConfig = {
  cfg_scale: 7,
  height: 1024,
  hide_watermark: false,
  model: 'fluently-xl' as string,
  negative_prompt: undefined as string | undefined,
  safe_mode: true,
  seed: undefined as number | undefined,
  steps: 30,
  style_preset: undefined as StylePreset | undefined,
  width: 1024,
} as const;

export type ImageConfig = typeof imageConfig;

export const imageConfigSchema = z
  .object({
    cfg_scale: z.number().optional(),
    height: z.number().optional(),
    hide_watermark: z.boolean().optional(),
    model: z.string().optional(),
    negative_prompt: z.string().optional(),
    safe_mode: z.boolean().optional(),
    seed: z.number().optional(),
    steps: z.number().optional(),
    style_preset: stylePresetEnum.optional(),
    width: z.number().optional(),
  })
  .partial();

export type PartialImageConfig = z.infer<typeof imageConfigSchema>;
