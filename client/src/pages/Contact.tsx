import { Link } from "wouter";
import { SiteLayout } from "@/components/Storefront";

export default function Contact() {
  return <SiteLayout><main className="section-shell">
    <div className="page-heading"><span className="kicker">We are here to help</span><h1>Contact</h1><p>For questions about a fragrance, an order or delivery within Ukraine, please reach out to our customer care team.</p></div>
    <article className="content-copy"><p>Customer care contact details will be added by the store owner before opening the shop. In the meantime, you can continue exploring the collection.</p><Link className="button button-outline" href="/collection">The Collection</Link></article>
  </main></SiteLayout>;
}
