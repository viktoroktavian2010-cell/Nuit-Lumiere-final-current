import { Link } from "wouter";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { SiteLayout, money } from "@/components/Storefront";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import { seedCatalogProducts } from "@shared/catalog";

export default function Cart() {
  const { items, increment, decrement, remove } = useCart();
  const query = trpc.catalog.list.useQuery(undefined, { staleTime: 60_000 });
  const products = query.data?.length ? query.data : seedCatalogProducts;
  const lines = items.map((line) => ({ ...line, product: products.find((product) => product.slug === line.slug) })).filter((line) => line.product);
  const total = lines.reduce((sum, line) => sum + (line.product?.price ?? 0) * line.quantity, 0);
  return <SiteLayout><main className="section-shell">
    <div className="page-heading"><span className="kicker">Your selection</span><h1>Shopping bag</h1><p>Your chosen compositions, ready for their next chapter.</p></div>
    {items.length === 0 ? <div className="empty-state"><div className="status-mark"><ShoppingBag size={20} /></div><h2>Your bag is waiting.</h2><p>Explore the collection to find a fragrance that feels like yours.</p><Link className="button button-gold" href="/collection">The Collection</Link></div> : <div className="cart-layout">
      <div>{lines.map(({ slug, quantity, product }) => product && <article className="cart-row" key={slug}>
        <img src={product.image} alt={`${product.name} perfume bottle`} />
        <div><span className="product-brand">{product.brand}</span><h2>{product.name}</h2><p>{money(product.price)} each</p><div className="quantity-stepper large"><button type="button" onClick={() => decrement(slug)} aria-label={`Reduce ${product.name} quantity`}><Minus size={13} /></button><span>{quantity}</span><button type="button" onClick={() => increment(slug)} aria-label={`Add ${product.name} quantity`}><Plus size={13} /></button><button type="button" className="remove-line" onClick={() => remove(slug)} aria-label={`Remove ${product.name}`}><Trash2 size={14} /></button></div></div>
        <strong className="cart-row-price">{money(product.price * quantity)}</strong>
      </article>)}</div>
      <aside className="cart-summary"><h2>Order summary</h2><div className="summary-line"><span>Subtotal</span><span>{money(total)}</span></div><div className="summary-line"><span>Currency</span><span>UAH</span></div><div className="summary-line"><span>Delivery</span><span>Selected at checkout</span></div><div className="summary-line total"><span>Total</span><strong>{money(total)}</strong></div><Link className="button button-gold" href="/checkout">Continue to checkout</Link><p className="shipping-note">Delivery is available within Ukraine via Nova Poshta or Ukrposhta.</p></aside>
    </div>}
  </main></SiteLayout>;
}
