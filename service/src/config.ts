export const config = {
  JWT_SECRET:
    process.env.JWT_SECRET || "a-string-secret-at-least-256-bits-long",
  PORT: 5000,
  BCRYPT_ROUNDS: 10,
  TOKEN_EXPIRY: "24h",
  MONGO_URI:
    process.env.JWT_SECRET ||
    "mongodb+srv://admin:DfddjZYwow5pAxjc@zdcluster.5hsth.mongodb.net/?retryWrites=true&w=majority&appName=ZdCluster",
  DB_NAME: process.env.DB_NAME || "nearzero_trust",
};
