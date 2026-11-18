import { SiteLayout } from "@/components/Storefront";

export default function Privacy() {
  return <SiteLayout><main className="section-shell">
    <div className="page-heading"><span className="kicker">Your information</span><h1>Privacy</h1></div>
    <article className="content-copy">
      <p>This preview shop stores customer details submitted with an order so the store can arrange delivery and provide support. Orders are retained in the store database. Payment card details are entered directly on LiqPay and are not collected or stored by this website.</p>
      <p>Before commercial use, the store owner must publish a complete privacy notice naming the data controller, contact details, legal basis, service providers, retention period and applicable data-subject rights.</p>
      <h2>Contact</h2><p>Privacy request contact details must be published by the store owner before the shop opens.</p>
    </article>
  </main></SiteLayout>;
}
