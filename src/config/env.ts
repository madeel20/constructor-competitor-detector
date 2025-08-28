import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export const envConfig = {
  timeout: parseInt(process.env.BROWSER_TIMEOUT || '30000', 10),
  headless: process.env.BROWSER_HEADLESS === 'true' || process.env.BROWSER_HEADLESS === undefined,
  userAgent: DEFAULT_USER_AGENT
};
