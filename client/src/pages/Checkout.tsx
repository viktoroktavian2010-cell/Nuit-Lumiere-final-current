import { useState, type FormEvent } from "react";
import { Link } from "wouter";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { SiteLayout, money } from "@/components/Storefront";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import { seedCatalogProducts } from "@shared/catalog";
import { appendDemoOrder } from "@/lib/demoOrders";

type Shipping = "nova_poshta" | "ukrposhta";
const cities = ["Kyiv", "Lviv", "Odesa", "Dnipro"];
const branches = ["Branch 1", "Branch 2", "Branch 3"];

export default function Checkout() {
  const { items } = useCart();
  const query = trpc.catalog.list.useQuery(undefined, { staleTime: 60_000 });
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [shipping, setShipping] = useState<Shipping>("nova_poshta");
  const [city, setCity] = useState("");
  const [branch, setBranch] = useState("");
  const [postalAddress, setPostalAddress] = useState("");
  const [payment, setPayment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const products = query.data?.length ? query.data : seedCatalogProducts;
  const lines = items
    .map((line) => ({ ...line, product: products.find((product) => product.slug === line.slug) }))
    .filter((line) => line.product);
  const total = lines.reduce((sum, line) => sum + (line.product?.price ?? 0) * line.quantity, 0);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    appendDemoOrder({
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `demo-${Date.now()}`,
      customerName: form.name.trim(),
      total,
      status: "New",
      createdAt: new Date().toISOString(),
    });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <SiteLayout>
        <main className="section-shell">
          <div className="status-card">
            <div className="status-mark"><LockKeyhole size={20} /></div>
            <span className="kicker">Demo checkout</span>
            <h1>Thank you.</h1>
            <p>This demo order was saved locally for the admin dashboard. Your details were not sent, and no payment was processed.</p>
            <p><strong>Order total:</strong> {money(total)}</p>
            <Link className="button button-outline" href="/cart"><ArrowLeft size={13} /> Return to your bag</Link>
          </div>
        </main>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <main className="section-shell">
        <div className="page-heading">
          <span className="kicker">Almost yours</span>
          <h1>Checkout</h1>
          <p>Enter your contact details and choose a delivery option within Ukraine.</p>
        </div>
        {items.length === 0 ? (
          <div className="empty-state">
            <h2>Your bag is empty.</h2>
            <Link className="button button-gold" href="/collection">Explore the collection</Link>
          </div>
        ) : (
          <div className="checkout-layout">
            <form className="form-card" onSubmit={submit}>
              <h2>Contact details</h2>
              <div className="form-grid">
                <div className="field full">
                  <label htmlFor="checkout-name">Name</label>
                  <input id="checkout-name" name="name" autoComplete="name" required minLength={2} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
                </div>
                <div className="field">
                  <label htmlFor="checkout-email">Email</label>
                  <input id="checkout-email" name="email" type="email" autoComplete="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
                </div>
                <div className="field">
                  <label htmlFor="checkout-phone">Phone</label>
                  <input id="checkout-phone" name="phone" type="tel" autoComplete="tel" placeholder="+380…" required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
                </div>

                <div className="field full checkout-divider">
                  <label>Delivery service</label>
                  <div className="radio-options">
                    <label className="radio-card">
                      <input type="radio" name="shipping" value="nova_poshta" checked={shipping === "nova_poshta"} onChange={() => setShipping("nova_poshta")} />
                      <span><strong>Nova Poshta</strong><span>Delivery to a Nova Poshta branch</span></span>
                    </label>
                    <label className="radio-card">
                      <input type="radio" name="shipping" value="ukrposhta" checked={shipping === "ukrposhta"} onChange={() => setShipping("ukrposhta")} />
                      <span><strong>Ukrposhta</strong><span>Delivery to a post office or address</span></span>
                    </label>
                  </div>
                </div>

                {shipping === "nova_poshta" ? (
                  <>
                    <div className="field">
                      <label htmlFor="checkout-city">City</label>
                      <select id="checkout-city" name="city" required value={city} onChange={(event) => { setCity(event.target.value); setBranch(""); }}>
                        <option value="" disabled>Select a city</option>
                        {cities.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label htmlFor="checkout-branch">Branch</label>
                      <select id="checkout-branch" name="branch" required value={branch} onChange={(event) => setBranch(event.target.value)} disabled={!city}>
                        <option value="" disabled>{city ? "Select a branch" : "Choose a city first"}</option>
                        {city && branches.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    </div>
                  </>
                ) : (
                  <div className="field full">
                    <label htmlFor="checkout-postal-address">Ukrposhta city and office / address</label>
                    <input id="checkout-postal-address" name="postalAddress" autoComplete="street-address" placeholder="City, post office or delivery address" required value={postalAddress} onChange={(event) => setPostalAddress(event.target.value)} />
                  </div>
                )}

                <div className="field full checkout-divider">
                  <label htmlFor="checkout-payment">Payment method</label>
                  <select id="checkout-payment" name="payment" required value={payment} onChange={(event) => setPayment(event.target.value)}>
                    <option value="" disabled>Select a payment method</option>
                    <option value="iban">Pay by IBAN</option>
                  </select>
                </div>
                {payment === "iban" && (
                  <div className="iban-details field full" aria-live="polite">
                    <div className="iban-heading"><strong>Bank transfer details</strong><span>Demo information</span></div>
                    <div className="iban-detail-row"><span>Recipient</span><strong>Nuit Lumière — Demo</strong></div>
                    <div className="iban-detail-row"><span>IBAN</span><strong>UA00 0000 0000 0000 0000 0000 0000</strong></div>
                    <div className="iban-detail-row"><span>Bank</span><strong>Demo Bank (not a real account)</strong></div>
                    <p>These placeholder details are for layout preview only. No payment will be processed.</p>
                  </div>
                )}
              </div>
              <div className="form-actions">
                <button className="button button-gold" type="submit" disabled={query.isLoading}>Continue (demo only)</button>
                <Link className="button button-outline" href="/cart"><ArrowLeft size={13} /> Return to bag</Link>
                <p className="shipping-note">UI preview only — this form does not send your information or connect to a payment service.</p>
              </div>
            </form>

            <aside className="order-card">
              <h2>Your order</h2>
              <div className="order-list">
                {lines.map(({ slug, quantity, product }) => product && (
                  <div className="order-list-line" key={slug}>
                    <img src={product.image} alt="" />
                    <div className="order-list-copy">{product.name}<small>{quantity} × {money(product.price)}</small></div>
                    <strong>{money(product.price * quantity)}</strong>
                  </div>
                ))}
              </div>
              <div className="summary-line"><span>Delivery</span><span>Selected above</span></div>
              <div className="summary-line total"><span>Total</span><strong>{money(total)}</strong></div>
              <p className="shipping-note">Prices are shown in UAH. Shipping fees are not included in this demo.</p>
            </aside>
          </div>
        )}
      </main>
    </SiteLayout>
  );
}
