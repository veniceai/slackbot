import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

import { RequestWithRawBody, slackSignatureVerification } from './middleware/slackSignatureVerification';
import slackRoutes from './routes/slackRoutes';

dotenv.config();

const isDev = process.env.NODE_ENV !== 'production';
const app = express();
const port = process.env.PORT || 3000;

app.use(
  express.urlencoded({
    extended: true,
    verify: (req: express.Request, _: express.Response, buf: Buffer) => {
      (req as RequestWithRawBody).rawBody = buf;
    },
  }),
);

app.use(
  express.json({
    verify: (req: express.Request, _: express.Response, buf: Buffer) => {
      (req as RequestWithRawBody).rawBody = buf;
    },
  }),
);

const limiter = rateLimit({
  keyGenerator: (req) => req.body?.team_id || req.body?.user_id || req.ip,
  legacyHeaders: false,
  max: 100,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  windowMs: 15 * 60 * 1000,
});

app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure && !process.env.BYPASS_HTTPS_REDIRECT) {
    return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
});

app.use((req, res, next) => {
  if (isDev) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
  }
  next();
});

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        connectSrc: ["'self'", 'https://api.venice.ai', 'https://slack.com'],
        defaultSrc: ["'self'"],
      },
    },
    frameguard: { action: 'deny' },
    hsts: true,
  }),
);

app.use('/slack', (req, res, next) => slackSignatureVerification(req as RequestWithRawBody, res, next));
app.use('/slack', limiter);
app.use('/slack', slackRoutes);

app.post('/', (req, res) => {
  if (req.body.type !== 'url_verification') {
    return res.status(403).json({ error: 'Forbidden - Only URL verification allowed' });
  }

  if (!req.body.challenge) {
    return res.status(400).json({ error: 'Bad Request - Missing challenge parameter' });
  }

  res.json({ challenge: req.body.challenge });
});

// Add this route before the catch-all
app.get('/health', (_, res) => {
  res.status(200).json({ status: 'ok' });
});

// catch-all
app.use('*', (req, res) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('No route matched:', req.method, req.originalUrl);
  }
  res.status(404).json({ error: 'Not found' });
});

app.listen(port, () => {
  const routes = [
    'POST / (URL verification)',
    'POST /slack/events',
    'POST /slack/commands',
    'POST /slack/interactions',
  ];

  if (isDev) {
    console.log(`Server listening at http://localhost:${port}`);
    console.log('Available routes:');
    routes.forEach((route) => console.log(`- ${route}`));
  }
});
