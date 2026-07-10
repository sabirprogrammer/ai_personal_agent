import crypto from "crypto";

const SECRET = process.env.ADMIN_JWT_SECRET || "default_super_secret_admin_token_key_12345";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@alyla.ai";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "AdminSecretPass123!";

// Predefined pbkdf2 hash of "AdminSecretPass123!" using salt "salt123"
const DEFAULT_HASHED_PASS = "salt123:7933343ea0e3db40118df7f6f8113af78a6196d1ae7fef55c6b555c9898f0763986a7c5991f9bb6c07662e91985be6ce2c9ce0b58aa816857a028b8cf9e9c102";

/**
 * Haps password input using PBKDF2 with a random salt.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verifies a password against a stored hashed password.
 */
export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, originalHash] = stored.split(":");
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
    return hash === originalHash;
  } catch {
    return false;
  }
}

/**
 * Creates a signed JWT-like token.
 */
export function createToken(payload: object): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", SECRET).update(`${header}.${data}`).digest("base64url");
  return `${header}.${data}.${signature}`;
}

/**
 * Verifies a signed session token. Returns the payload or null.
 */
export function verifyToken(token: string): any {
  try {
    const [header, data, signature] = token.split(".");
    const expectedSig = crypto.createHmac("sha256", SECRET).update(`${header}.${data}`).digest("base64url");
    if (signature !== expectedSig) return null;
    return JSON.parse(Buffer.from(data, "base64url").toString());
  } catch {
    return null;
  }
}

/**
 * Validates admin credentials against predefined settings.
 */
export function validateAdminCredentials(emailOrUsername: string, passwordInput: string): boolean {
  // Normalize comparison
  const normalizedInput = emailOrUsername.trim().toLowerCase();
  const targetAdminEmail = ADMIN_EMAIL.toLowerCase();

  if (normalizedInput !== targetAdminEmail && normalizedInput !== "admin") {
    return false;
  }

  // First check process.env.ADMIN_PASSWORD if it is set in environment (plaintext check)
  if (process.env.ADMIN_PASSWORD && passwordInput === process.env.ADMIN_PASSWORD) {
    return true;
  }

  // Fallback to verifying against the correct default pbkdf2 hashed password
  return verifyPassword(passwordInput, DEFAULT_HASHED_PASS);
}
