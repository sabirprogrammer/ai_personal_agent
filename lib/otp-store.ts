import { insforgeAdmin, hasInsforgeAdminKey } from "./insforge-admin";

/**
 * Server-side OTP store.
 * Backed strictly by InsForge database table `otp_codes` in production.
 * In-memory fallbacks are disabled to guarantee production-ready TTL and persistence.
 */

export async function storeOtp(phoneNumber: string, method: string, otp: string, ttlMs = 10 * 60 * 1000): Promise<void> {
  if (!hasInsforgeAdminKey) {
    throw new Error("[OTP Store] Database configuration is missing. INSFORGE_API_KEY/INSFORGE_ADMIN_KEY must be set in your .env.local file.");
  }

  const expiresAt = new Date(Date.now() + ttlMs).toISOString();
  
  // Delete any pre-existing code to avoid duplicate key conflict on (phone, method)
  await insforgeAdmin.database
    .from("otp_codes")
    .delete()
    .eq("phone", phoneNumber)
    .eq("method", method);

  // Insert new verification OTP code
  const { error } = await insforgeAdmin.database
    .from("otp_codes")
    .insert([
      {
        phone: phoneNumber,
        method,
        code: otp,
        expires_at: expiresAt
      }
    ]);

  if (error) {
    throw new Error(`[OTP Store] Failed to save verification code: ${error.message}`);
  }
}

export async function verifyOtp(phoneNumber: string, method: string, otp: string): Promise<boolean> {
  if (!hasInsforgeAdminKey) {
    throw new Error("[OTP Store] Database configuration is missing. INSFORGE_API_KEY/INSFORGE_ADMIN_KEY must be set in your .env.local file.");
  }

  const { data: record, error } = await insforgeAdmin.database
    .from("otp_codes")
    .select("*")
    .eq("phone", phoneNumber)
    .eq("method", method)
    .maybeSingle();

  if (error || !record) {
    if (error) console.error("[OTP Store] Database select error:", error.message);
    return false;
  }

  const isExpired = new Date(record.expires_at).getTime() < Date.now();
  const isMatch = record.code === otp;

  // Consume/delete the code after verification
  await insforgeAdmin.database
    .from("otp_codes")
    .delete()
    .eq("phone", phoneNumber)
    .eq("method", method);

  if (isExpired) {
    console.warn("[OTP Store] Verification code has expired.");
    return false;
  }

  return isMatch;
}
