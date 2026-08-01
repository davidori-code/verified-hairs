import bcrypt from "bcryptjs";

// 12 rounds is a reasonable balance for 2026 hardware: strong enough to
// resist brute-force/rainbow-table attacks, fast enough not to noticeably
// slow down registration/login requests. Higher rounds = slower hashing,
// which is the point (it deliberately costs an attacker more), but too high
// adds real latency to every legitimate login too.
const SALT_ROUNDS = 12;

export async function hashPassword(plainTextPassword: string): Promise<string> {
  return bcrypt.hash(plainTextPassword, SALT_ROUNDS);
}

export async function verifyPassword(
  plainTextPassword: string,
  passwordHash: string
): Promise<boolean> {
  return bcrypt.compare(plainTextPassword, passwordHash);
}
