import { pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";
import type { Db } from "mongodb";
import { DEFAULT_ADMIN_PASSWORD, DEFAULT_ADMIN_USERNAME } from "@/lib/auth";
import { ADMIN_USERS_COLLECTION } from "@/lib/mongodb";

type AdminUserDoc = {
  username: string;
  usernameLower: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
};

const HASH_ITERATIONS = 120000;
const HASH_KEYLEN = 64;
const HASH_DIGEST = "sha512";

function toUsernameKey(username: string) {
  return username.trim().toLowerCase();
}

function hashPassword(password: string, saltHex?: string) {
  const salt = saltHex ? Buffer.from(saltHex, "hex") : randomBytes(16);
  const hash = pbkdf2Sync(password, salt, HASH_ITERATIONS, HASH_KEYLEN, HASH_DIGEST);
  return {
    saltHex: salt.toString("hex"),
    hashHex: hash.toString("hex"),
  };
}

function encodeHash(password: string) {
  const { saltHex, hashHex } = hashPassword(password);
  return `pbkdf2$${HASH_DIGEST}$${HASH_ITERATIONS}$${saltHex}$${hashHex}`;
}

function verifyHash(password: string, encoded: string) {
  const parts = encoded.split("$");
  if (parts.length !== 5) return false;
  const [scheme, digest, iterationsRaw, saltHex, hashHex] = parts;
  if (scheme !== "pbkdf2" || digest !== HASH_DIGEST) return false;
  const iterations = Number(iterationsRaw);
  if (!Number.isFinite(iterations) || iterations <= 0) return false;

  const calculated = pbkdf2Sync(password, Buffer.from(saltHex, "hex"), iterations, HASH_KEYLEN, digest);
  const expected = Buffer.from(hashHex, "hex");
  if (expected.length !== calculated.length) return false;
  return timingSafeEqual(expected, calculated);
}

export async function ensureAdminUser(db: Db) {
  const col = db.collection<AdminUserDoc>(ADMIN_USERS_COLLECTION);
  await col.createIndex({ usernameLower: 1 }, { unique: true });

  const existing = await col.findOne({ usernameLower: toUsernameKey(DEFAULT_ADMIN_USERNAME) });
  if (existing) return;

  const now = new Date();
  await col.insertOne({
    username: DEFAULT_ADMIN_USERNAME,
    usernameLower: toUsernameKey(DEFAULT_ADMIN_USERNAME),
    passwordHash: encodeHash(DEFAULT_ADMIN_PASSWORD),
    createdAt: now,
    updatedAt: now,
  });
}

export async function verifyAdminCredentials(db: Db, username: string, password: string) {
  const usernameLower = toUsernameKey(username);
  if (!usernameLower || !password) return false;

  const col = db.collection<AdminUserDoc>(ADMIN_USERS_COLLECTION);
  const user = await col.findOne({ usernameLower });
  if (!user) return false;
  return verifyHash(password, user.passwordHash);
}
