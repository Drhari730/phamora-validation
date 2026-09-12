import bcrypt from "bcryptjs";

export async function hashSecret(secret: string): Promise<string> {
  return bcrypt.hash(secret, 10);
}

export async function verifySecret(secret: string, hash: string): Promise<boolean> {
  return bcrypt.compare(secret, hash);
}

/** 6-digit PIN a student sets at consent time to resume their session later. */
export function generatePin(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/** Long random token used as an expert's invite-link credential. */
export function generateInviteToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
