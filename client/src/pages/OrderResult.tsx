import { Link } from "wouter";
import { Check, Clock3, X } from "lucide-react";
import { SiteLayout, money } from "@/components/Storefront";
import { trpc } from "@/lib/trpc";

export default function OrderResult() {
  const id = new URLSearchParams(window.location.search).get("order") ?? "";
  const isUuid = /^[0-9a-f-]{36}$/i.test(id);
  const query = trpc.checkout.status.useQuery({ orderId: id }, { enabled: isUuid, refetchInterval: 4000, retry: false });
  const order = query.data;
  const paid = order?.paymentStatus === "success";
  const failed = ["failure", "error", "reversed"].includes(order?.paymentStatus ?? "");
  return <SiteLayout><main className="section-shell"><div className="status-card">
    <div className="status-mark">{paid ? <Check size={20} /> : failed ? <X size={20} /> : <Clock3 size={20} />}</div>
    <span className="kicker">Payment status</span>
    <h1>{paid ? "Payment confirmed." : failed ? "Payment not completed." : "Waiting for confirmation."}</h1>
    {order ? <><p>Order <strong>{order.id}</strong> · {money(order.total)}</p><p>{paid ? "A verified LiqPay callback has confirmed your payment." : failed ? `Provider status: ${order.paymentStatus}. You can return to the collection and try again.` : "The payment provider is still processing this order. This page checks for a signed confirmation."}</p></> : <p>{query.isLoading ? "Looking up order status…" : "Order status is not available for this link."}</p>}
    <Link className="button button-outline" href="/collection">Return to The Collection</Link>
  </div></main></SiteLayout>;
}
