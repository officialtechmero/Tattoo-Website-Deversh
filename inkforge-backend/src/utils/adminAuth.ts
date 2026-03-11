import crypto from "node:crypto";

type AdminTokenPayload = {
  sub: "admin";
  exp: number;
};

const TOKEN_TTL_SECONDS = 60 * 60 * 12;

const toBase64Url = (value: string): string => {
  return Buffer.from(value, "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
};

const fromBase64Url = (value: string): string => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 ? "=".repeat(4 - (normalized.length % 4)) : "";
  return Buffer.from(normalized + padding, "base64").toString("utf-8");
};

const sign = (content: string): string => {
  const secret =
    process.env.ADMIN_TOKEN_SECRET ??
    `${process.env.ADMIN_PASSWORD ?? ""}:tatoo_inkify_admin`;

  return crypto
    .createHmac("sha256", secret)
    .update(content)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
};

const timingSafeEqual = (a: string, b: string): boolean => {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) return false;
  return crypto.timingSafeEqual(aBuffer, bBuffer);
};

export const verifyAdminCredentials = (username: string, password: string): boolean => {
  const adminUsername = process.env.ADMIN_USERNAME ?? "";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";
  if (!adminUsername || !adminPassword) return false;
  return timingSafeEqual(username, adminUsername) && timingSafeEqual(password, adminPassword);
};

export const generateAdminToken = (): string => {
  const payload: AdminTokenPayload = {
    sub: "admin",
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  };
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
};

export const verifyAdminToken = (token: string): boolean => {
  if (!token) return false;
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return false;
  if (!timingSafeEqual(signature, sign(encodedPayload))) return false;

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as AdminTokenPayload;
    if (payload.sub !== "admin") return false;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return false;
    return true;
  } catch {
    return false;
  }
};

export const getBearerToken = (authorizationHeader?: string): string | null => {
  if (!authorizationHeader) return null;
  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token.trim();
};
