import { createHash } from "crypto";

export async function hashPassword(password: string, salt: string, algorithm: string): Promise<string> {
  const hash = await createHash(algorithm);
  hash.update(password + salt);
  return hash.digest('hex');
}
