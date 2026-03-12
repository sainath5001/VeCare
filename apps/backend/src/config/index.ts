import path from 'path';
import { config } from 'dotenv';
import { mnemonic } from '@vechain/sdk-core';
import { ValidateEnv } from '@utils/validateEnv';

// Resolve .env relative to backend app root (apps/backend) so it works when run from monorepo root
const envFileName = `.env.${process.env.NODE_ENV || 'development'}.local`;
const envPath = path.resolve(__dirname, '..', '..', envFileName);

// Debug: Log if we're loading from .env file or using existing env vars
console.log('🔍 Checking environment variables...');
console.log('SKIP_DOTENV:', process.env.SKIP_DOTENV);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);

// Only load .env files if critical environment variables are not already set
// This allows deployment platforms (Coolify, Railway, etc.) to provide env vars directly
const hasCriticalEnvVars = process.env.OPENAI_API_KEY && process.env.PORT;

if (!hasCriticalEnvVars && !process.env.SKIP_DOTENV) {
  console.log('📁 Loading from .env file...');
  let result = config({ path: envPath });
  // Fallback 1: try cwd with same name (e.g. when run from apps/backend)
  if (!result?.parsed && !process.env.OPENAI_API_KEY) {
    const cwdPath = path.resolve(process.cwd(), envFileName);
    console.log('   Trying fallback path:', cwdPath);
    result = config({ path: cwdPath });
  }
  // Fallback 2: try .env in backend folder (so .env works if someone created that instead of .env.development.local)
  if (!result?.parsed) {
    const plainEnvPath = path.resolve(__dirname, '..', '.env');
    result = config({ path: plainEnvPath });
    if (result?.parsed) console.log('   Loaded from .env');
  }
  if (!result?.parsed) {
    const plainCwd = path.resolve(process.cwd(), '.env');
    result = config({ path: plainCwd });
    if (result?.parsed) console.log('   Loaded from .env (cwd)');
  }
} else {
  console.log('✅ Using existing environment variables (skipping .env file)');
}

const validatedEnv = ValidateEnv();

export const CREDENTIALS = process.env.CREDENTIALS === 'true';
export const { NODE_ENV, PORT, LOG_FORMAT, LOG_DIR, ORIGIN } = validatedEnv;

export const { OPENAI_API_KEY } = validatedEnv;
export const { MAX_FILE_SIZE } = validatedEnv;
export const { ADMIN_MNEMONIC, ADMIN_ADDRESS } = validatedEnv;
export const { NETWORK_URL, NETWORK_TYPE } = validatedEnv;
export const { REWARD_AMOUNT } = validatedEnv;
export const { PINATA_API_KEY, PINATA_API_SECRET, PINATA_GATEWAY } = validatedEnv;

// Support both mnemonic and private key
export const ADMIN_PRIVATE_KEY = validatedEnv.ADMIN_PRIVATE_KEY
  ? validatedEnv.ADMIN_PRIVATE_KEY
  : validatedEnv.ADMIN_MNEMONIC
  ? mnemonic.derivePrivateKey(validatedEnv.ADMIN_MNEMONIC.split(' '))
  : '';
