// src/helper/util.ts
import * as bcrypt from 'bcryptjs';
export async function hashPasswordHelper(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

export async function comparePasswordHelper(plain: string, hashed: string): Promise<boolean> {
  if (!plain || !hashed) return false;
  return bcrypt.compare(plain, hashed);
}
