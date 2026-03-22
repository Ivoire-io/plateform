// ─── Phone Auth Utility ───
// Derive a deterministic password from a phone number for Supabase auth.
// The user never sees or types this password — it's internal.

import { createHmac } from "crypto";

export function derivePhonePassword(phone: string): string {
  const secret =
    process.env.PHONE_AUTH_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "ivoire-io-phone-auth-default";
  return createHmac("sha256", secret).update(phone).digest("hex");
}
