/**
 * Centralised, validated runtime configuration.
 * Every other module imports `env` instead of reading process.env directly.
 */
import 'dotenv/config';

const required = ['MONGO_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT ?? 3000),
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:4200',
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  accessTokenTtl: '15m',
  refreshTokenTtl: '7d',
  allowedEmailDomain: process.env.ALLOWED_EMAIL_DOMAIN?.trim().toLowerCase() || null,
  seedOnStart: process.env.SEED_ON_START === 'true',
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || null,
  anthropicModel: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-5-5',
  voyageApiKey: process.env.VOYAGE_API_KEY || null,
  voyageModel: process.env.VOYAGE_MODEL ?? 'voyage-3',
  uploadDir: process.env.UPLOAD_DIR ?? 'public/uploads',
});
