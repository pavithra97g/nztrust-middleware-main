export const config = {
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  PORT: 5000,
  BCRYPT_ROUNDS: 10,
  TOKEN_EXPIRY: '24h'
};