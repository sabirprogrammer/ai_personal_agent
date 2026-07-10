import crypto from "crypto";

const SECRET = process.env.ADMIN_JWT_SECRET || "default_super_secret_admin_token_key_12345";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@alyla.ai";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "AdminSecretPass123!";

// Predefined pbkdf2 hash of "AdminSecretPass123!" using salt "salt123"
const DEFAULT_HASHED_PASS = "salt123:6ea48a2f4efec3c0f4dfb5dbd0e9d6d1b7d5fce7263b6510a716c96b77cd2f7e7e23118cf94519967e8140db50bcfd7b7adbe874a7b74ea14092b3a89345e8b6";

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

  // If password matches env config (plaintext), or default hashed password
  if (process.env.ADMIN_PASSWORD) {
    return passwordInput === ADMIN_PASSWORD;
  }

  return verifyPassword(passwordInput, DEFAULT_HASHED_PASS);
}
