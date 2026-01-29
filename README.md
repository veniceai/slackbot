# Venice AI Slack Bot

A Slack bot that leverages Venice AI's API to generate both text responses and images directly within Slack channels.

## Features

- **Text Generation**: Generate AI responses using `/venice chat [prompt]`
- **Image Generation**: Create AI-generated images using `/venice image [prompt]`
- **Inline Configuration**: Customize model parameters within your prompts
- **Security**:
  - Slack signature verification
  - Rate limiting
  - Helmet security headers
  - HTTPS enforcement
- **Health Monitoring**: Built-in health check endpoint

## Prerequisites

- Node.js >= 20.0.0
- [Venice AI API key](https://docs.venice.ai/welcome/guides/generating-api-key)
- Slack workspace with admin permissions
- A Slack App with:
  - Bot Token (`xoxb-*`)
  - Signing Secret
  - App ID
  - Client ID
  - OAuth scopes configured (see [Slack App Configuration](#slack-app-configuration))
  - Slash commands enabled
  - Event subscriptions enabled
  - Interactivity enabled

## Quick Start

```bash
# Install dependencies
yarn install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Build and start
yarn build
yarn start
```

## Environment Variables

Create a `.env` file with these required variables:

```env
NODE_ENV=development
PORT=3000
SLACK_SIGNING_SECRET=your_signing_secret_here
VENICE_API_KEY=your_api_key_here
SLACK_BOT_TOKEN=your_bot_token_here
APP_ID=your_app_id_here
CLIENT_ID=your_client_id_here
BYPASS_HTTPS_REDIRECT=boolean
```

## Slack App Configuration

1. Create a new Slack app at [api.slack.com/apps](https://api.slack.com/apps)

2. Required Bot Token Scopes:
   - `app_mentions:read` - Allow bot to see when it's mentioned
   - `channels:join` - Allow bot to join public channels
   - `channels:read` - View basic channel information
   - `chat:write` - Send messages as the bot
   - `chat:write.public` - Send messages to channels the bot isn't in
   - `commands` - Add slash commands
   - `files:write` - Upload and edit files
   - `groups:read` - View basic private channel information
   - `groups:write` - Manage private channels the bot is in
   - `im:write` - Respond to slash commands in direct messages

3. Slash Command Configuration:

   ```bash
   Command: /venice
   Request URL: https://your-domain.com/slack/commands
   Description: Generate AI text and images
   Usage hint: chat [prompt] or image [prompt] (defaults to image if not specified)
   ```

4. Interactivity & Events:

   > Note: These endpoints are required by Slack but currently just return 200 OK responses to prevent errors.

   ```bash
   Interactivity Request URL: https://your-domain.com/slack/interactions
   Events Request URL: https://your-domain.com/slack/events
   ```

## Usage

### Text Generation

Basic usage:

```bash
/venice chat Tell me a story about a cat
```

With configuration:

```bash
/venice chat temperature:0.7, model:llama-3.3-70b, Tell me a story about a cat
```

Available chat configuration parameters:

```typescript
{
  model: string  // AI model to use
  prompt: string  // The prompt text
  temperature: number  // (0-2) Response randomness
  top_p: number  // (0-1) Response diversity
  stop: string[]  // Array of stopping sequences
  max_completion_tokens: number  // Maximum response length
  frequency_penalty: number  // (-2 to 2) Repetition control
  presence_penalty: number  // (-2 to 2) Topic control
  venice_parameters: {
    character_slug: string  // Character configuration
    include_venice_system_prompt: boolean
  }
}
```

### Image Generation

Basic usage:

```bash
/venice image A cat playing piano
# or simply (since image is the default)
/venice A cat playing piano
```

With configuration:

```bash
/venice image model:sdxl, style:anime, A cat playing piano
```

Available image configuration parameters:

```typescript
{
  cfg_scale: number  // Classifier free guidance scale
  height: number  // Image height in pixels
  hide_watermark: boolean  // Whether to hide the watermark
  model: string  // AI model to use
  negative_prompt: string  // Things to avoid in the generation
  safe_mode: boolean  // Enable/disable safe mode
  seed: number  // Random seed for reproducibility
  steps: number  // Number of diffusion steps
  style_preset: string  // Visual style (see list below)
  width: number  // Image width in pixels
}
```

Available style presets:

```
3D Model, Abstract, Advertising, Alien, Analog Film, Anime, Architectural, Cinematic, Collage, Comic Book, Craft Clay, Cubist, Digital Art, Disco, Dreamscape, Dystopian, Enhance, Fairy Tale, Fantasy Art, Fighting Game, Film Noir, Flat Papercut, Food Photography, Gothic, GTA, Graffiti, Grunge, HDR, Horror, Hyperrealism, Impressionist, Isometric Style, Kirigami, Legend of Zelda, Line Art, Long Exposure, Lowpoly, Minecraft, Minimalist, Monochrome, Nautical, Neon Noir, Neon Punk, Origami, Paper Mache, Paper Quilling, Papercut Collage, Papercut Shadow Box, Photographic, Pixel Art, Pokemon, Pointillism, Pop Art, Psychedelic, Real Estate, Renaissance, Retro Arcade, Retro Game, RPG Fantasy Game, Silhouette, Space, Stacked Papercut, Stained Glass, Steampunk, Strategy Game, Street Fighter, Super Mario, Surrealist, Techwear Fashion, Texture, Thick Layered Papercut, Tilt-Shift, Tribal, Typography, Watercolor, Zentangle
```

## Tips & Known Behavior

### Response Streaming

Currently, Clawdbot doesn't truly stream tokens in real-time. You may notice the bot shows a few initial items, then flashes red (indicating processing), and later dumps a larger chunk of output. This is expected behavior due to how the bot batches responses.

### Telegram Bot Streaming (API 9.3+)

For those interested in Telegram integration, Bot API 9.3 introduced `sendMessageDraft` which enables real-time streaming responses similar to ChatGPT:

- The bot shows a typing bubble that updates in real-time as it generates text
- This provides a much smoother user experience for long responses
- Reference: [Telegram Bot API 9.3 Release](https://core.telegram.org/bots/api#december-4-2025)

> **Note**: The official Telegram docs can be confusing for implementing streaming. Look for community guides and examples for clearer implementation steps.

## Development

```bash
# Run in development mode with hot reload
yarn dev

# Type checking
yarn type-check

# Linting
yarn lint

# Production build
yarn build

# Start production server
yarn start:prod
```

## Deployment

This project is configured for deployment on [Render.com](https://render.com).

1. Fork this repository
2. Create a new Web Service on Render
3. Connect your GitHub repository
4. Add environment variables in Render dashboard
5. Render will automatically deploy when you push to main

**Note**: When deploying to Render's free tier, you must set `BYPASS_HTTPS_REDIRECT=true`

The `render.yaml` configuration handles:

- Build and start commands
- Environment variables
- Health checks
- Auto-deployment

## Architecture

- `src/handlers/` - Command and event handlers
- `src/services/` - Venice AI and Slack API integrations
- `src/configs/` - Configuration schemas and defaults
- `src/utils/` - Helper functions and utilities
- `src/middleware/` - Express middleware (security, validation)

## Security Features

- Slack signature verification on all requests
- Rate limiting: 100 requests per 15 minutes per user/team
- Helmet.js security headers
- HTTPS redirect in production
- Environment variable validation
- Input validation using Zod

## API Documentation

- [Venice AI API Documentation](https://docs.venice.ai/api-reference/api-spec)
- [Venice API Key Generation](https://docs.venice.ai/welcome/guides/generating-api-key)
- [Slack App Creation Guide](https://api.slack.com/quickstart)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

[MIT](./LICENSE)
