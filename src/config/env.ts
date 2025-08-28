import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Check for command line arguments
const args = process.argv.slice(2);
const headlessArg = args.find(arg => arg.startsWith('--headless='));
const headlessValue = headlessArg ? headlessArg.split('=')[1] === 'true' : undefined;

const customerArg = args.find(arg => arg.startsWith('--customer='));
const customerFilter = customerArg ? customerArg.split('=')[1] : undefined;

// Function to determine headless value with priority: CLI args > env vars > default
function getHeadlessValue(): boolean {
  if (headlessValue !== undefined) {
    return headlessValue;
  }
  if (process.env.BROWSER_HEADLESS !== undefined) {
    return process.env.BROWSER_HEADLESS === 'true';
  }
  return true; // default value
}

export const envConfig = {
  timeout: parseInt(process.env.BROWSER_TIMEOUT || '30000', 10),
  headless: getHeadlessValue(),
  userAgent: DEFAULT_USER_AGENT,
  customerFilter,
  batchSize: parseInt(process.env.BATCH_SIZE || '10', 10)
};

// Log configuration for debugging
if (process.env.NODE_ENV !== 'production') {
  console.log(`🔧 Browser Config: headless=${envConfig.headless}, timeout=${envConfig.timeout}ms, batch=${envConfig.batchSize}`);
  if (headlessValue !== undefined) {
    console.log(`📝 Headless mode overridden by CLI argument: --headless=${headlessValue}`);
  }
  if (customerFilter) {
    console.log(`🎯 Filtering for customer: "${customerFilter}"`);
  }
}
