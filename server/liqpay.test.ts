import { createHash } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createLiqPayCheckout, verifyLiqPayCallback } from "./liqpay";

afterEach(() => vi.unstubAllEnvs());

function sign(data: string, privateKey: string, algorithm: "sha3-256" | "sha1" = "sha3-256") {
  return createHash(algorithm).update(`${privateKey}${data}${privateKey}`).digest("base64");
}

describe("LiqPay test checkout", () => {
  it("creates a UAH sandbox payload and never returns the private key", () => {
    vi.stubEnv("LIQPAY_PUBLIC_KEY", "sandbox_public_test");
    vi.stubEnv("LIQPAY_PRIVATE_KEY", "sandbox_private_test");
    vi.stubEnv("NUIT_PUBLIC_URL", "https://shop.example");
    const checkout = createLiqPayCheckout({ orderId: "order-123", amount: 5800, description: "A test order" });
    expect(checkout).not.toBeNull();
    const payload = JSON.parse(Buffer.from(checkout!.data, "base64").toString("utf8"));
    expect(payload).toMatchObject({ public_key: "sandbox_public_test", action: "pay", currency: "UAH", amount: "5800.00", order_id: "order-123" });
    expect(payload).not.toHaveProperty("sandbox");
    expect(payload.server_url).toBe("https://shop.example/api/liqpay/callback");
    expect(checkout!.signature).toBe(sign(checkout!.data, "sandbox_private_test"));
    expect(JSON.stringify(checkout)).not.toContain("sandbox_private_test");
  });

  it("accepts a correctly signed callback and rejects tampering", () => {
    vi.stubEnv("LIQPAY_PRIVATE_KEY", "sandbox_private_test");
    const data = Buffer.from(JSON.stringify({ order_id: "order-123", amount: 5800, currency: "UAH", status: "success" })).toString("base64");
    expect(verifyLiqPayCallback(data, sign(data, "sandbox_private_test"))).toMatchObject({ order_id: "order-123", status: "success" });
    expect(verifyLiqPayCallback(data, "wrong-signature")).toBeNull();
  });

  it("accepts legacy SHA1 callbacks but rejects non-sandbox merchant keys", () => {
    vi.stubEnv("LIQPAY_PRIVATE_KEY", "sandbox_private_test");
    const data = Buffer.from(JSON.stringify({ order_id: "order-legacy", status: "success" })).toString("base64");
    expect(verifyLiqPayCallback(data, sign(data, "sandbox_private_test", "sha1"))).toMatchObject({ status: "success" });
    vi.stubEnv("LIQPAY_PUBLIC_KEY", "live_public_key");
    const checkout = createLiqPayCheckout({ orderId: "order-live", amount: 100, description: "Must not charge" });
    expect(checkout).toBeNull();
  });
});
