import { config } from 'dotenv';

config();

export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

export const ACCESS_TOKEN_EXPIRES_IN =
  process.env.ACCESS_TOKEN_EXPIRES_IN || '1h'; // E.g 24h, 7d, 60s
export const REFRESH_TOKEN_EXPIRES_IN =
  process.env.REFRESH_TOKEN_EXPIRES_IN || '4d';

function checkIfSecretIsValid(secret: string, name: string) {
  if (!secret || secret.trim().length === 0) {
    throw new Error(`${name}: Secret Cannot be Empty`);
  } else if (secret.length < 8) {
    throw new Error(`${name}: secret has to have at least 8 characters`);
  }
}

checkIfSecretIsValid(ACCESS_TOKEN_SECRET, 'access token secret');
checkIfSecretIsValid(REFRESH_TOKEN_SECRET, 'refresh token secret');
