import { insforgeAdmin, hasInsforgeAdminKey } from "./insforge-admin";

/**
 * Server-side OTP store.
 * Backed by InsForge database table `otp_codes` in production,
 * and falls back to a module-level Map in local/simulated sandbox environments.
 */

interface OtpEntry {
  otp: string;
  expires: number;
  method: string;
}

// Module-level fallback store — persists for the lifetime of the server process
const otpMemoryStore = new Map<string, OtpEntry>();

export async function storeOtp(phoneNumber: string, method: string, otp: string, ttlMs = 10 * 60 * 1000): Promise<void> {
  if (hasInsforgeAdminKey) {
    try {
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
        console.error("[OTP Store] Database insert error, falling back to memory:", error.message);
        const storeKey = `${phoneNumber}:${method}`;
        otpMemoryStore.set(storeKey, { otp, expires: Date.now() + ttlMs, method });
      }
    } catch (dbErr: any) {
      console.error("[OTP Store] Database store failed, falling back to memory:", dbErr);
      const storeKey = `${phoneNumber}:${method}`;
      otpMemoryStore.set(storeKey, { otp, expires: Date.now() + ttlMs, method });
    }
  } else {
    // In-memory fallback for local simulation sandbox environments
    const storeKey = `${phoneNumber}:${method}`;
    otpMemoryStore.set(storeKey, { otp, expires: Date.now() + ttlMs, method });
  }
}

export async function verifyOtp(phoneNumber: string, method: string, otp: string): Promise<boolean> {
  if (hasInsforgeAdminKey) {
    try {
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
        console.warn("[OTP Store] Code has expired.");
        return false;
      }

      return isMatch;
    } catch (dbErr: any) {
      console.error("[OTP Store] Database verify failed, falling back to memory:", dbErr);
    }
  }

  // Fallback / memory check
  const storeKey = `${phoneNumber}:${method}`;
  const entry = otpMemoryStore.get(storeKey);

  if (!entry) return false;
  
  if (Date.now() > entry.expires) {
    otpMemoryStore.delete(storeKey);
    return false;
  }
  
  if (entry.otp !== otp) return false;

  // Consume the OTP
  otpMemoryStore.delete(storeKey);
  return true;
}
