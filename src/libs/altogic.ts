import { createClient } from 'altogic';

const ENT_URL = process.env.NEXT_PUBLIC_ALTOGIC_ENV_URL;
const CLIENT_KEY = process.env.NEXT_PUBLIC_ALTOGIC_CLIENT_KEY;

if (!ENT_URL || !CLIENT_KEY) {
  throw new Error('Missing environment variables for Altogic, please check your .env file');
}

const { realtime } = createClient(ENT_URL, CLIENT_KEY);

export { realtime };
