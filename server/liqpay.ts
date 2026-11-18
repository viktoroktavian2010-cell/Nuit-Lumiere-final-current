import { createHash, timingSafeEqual } from "node:crypto";

const CHECKOUT_URL = "https://www.liqpay.ua/api/3/checkout";
const DEFAULT_PREVIEW_ORIGIN = "https://8328-ihh6yk5571mj7rnl89mc9-d5cf9a5a.us3.manus.computer";
const isTestKey = (value: string | undefined) => Boolean(value?.trim().startsWith("sandbox_"));
const configured = () => isTestKey(process.env.LIQPAY_PUBLIC_KEY) && isTestKey(process.env.LIQPAY_PRIVATE_KEY);
const publicOrigin = () => (process.env.NUIT_PUBLIC_URL || DEFAULT_PREVIEW_ORIGIN).trim().replace(/\/+$/, "");

function signatureFor(data: string, privateKey: string, algorithm: "sha3-256" | "sha1" = "sha3-256"): string {
  return createHash(algorithm).update(`${privateKey}${data}${privateKey}`, "utf8").digest("base64");
}

export function liqpayReadiness() {
  return {
    configured: configured(),
    callbackConfigured: Boolean(publicOrigin()),
    testMode: true as const,
  };
}

export function createLiqPayCheckout(input: { orderId: string; amount: number; description: string }) {
  const publicKey = process.env.LIQPAY_PUBLIC_KEY?.trim();
  const privateKey = process.env.LIQPAY_PRIVATE_KEY?.trim();
  const origin = publicOrigin();
  if (!publicKey || !privateKey || !isTestKey(publicKey) || !isTestKey(privateKey) || !origin) return null;

  const payload = {
    public_key: publicKey,
    version: 7,
    action: "pay",
    amount: input.amount.toFixed(2),
    currency: "UAH",
    description: input.description.slice(0, 255),
    order_id: input.orderId,
    language: "uk",
    server_url: `${origin}/api/liqpay/callback`,
    result_url: `${origin}/checkout/result?order=${encodeURIComponent(input.orderId)}`,
  };
  const data = Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
  return { url: CHECKOUT_URL, data, signature: signatureFor(data, privateKey) };
}

export function verifyLiqPayCallback(data: string, signature: string): Record<string, unknown> | null {
  const privateKey = process.env.LIQPAY_PRIVATE_KEY?.trim();
  if (!privateKey || !isTestKey(privateKey) || !data || !signature) return null;
  const received = Buffer.from(signature);
  const valid = (["sha3-256", "sha1"] as const).some((algorithm) => {
    const expected = Buffer.from(signatureFor(data, privateKey, algorithm));
    return expected.length === received.length && timingSafeEqual(expected, received);
  });
  if (!valid) return null;
  try {
    const parsed: unknown = JSON.parse(Buffer.from(data, "base64").toString("utf8"));
    return parsed && typeof parsed === "object" ? parsed as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

export function liqpayPublicKeyMatches(value: unknown): boolean {
  return typeof value === "string" && value === process.env.LIQPAY_PUBLIC_KEY?.trim();
}
