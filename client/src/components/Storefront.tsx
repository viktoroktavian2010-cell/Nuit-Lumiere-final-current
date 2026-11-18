import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { MusicControl } from "@/components/MusicControl";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import { seedCatalogProducts, type CatalogProduct } from "@shared/catalog";
import { requestVoiceGuide } from "@/lib/audioEvents";
import OracleSearch from "@/components/OracleSearch";

export function money(amount: number) {
  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function Header() {
  const { t } = useLanguage();
  const [location] = useLocation();
  const { items, increment, decrement, remove } = useCart();
  const productsQuery = trpc.catalog.list.useQuery(undefined, {
    staleTime: 60_000,
  });
  const products = productsQuery.data?.length
    ? productsQuery.data
    : seedCatalogProducts;
  const quantity = items.reduce((sum, line) => sum + line.quantity, 0);
  const total = items.reduce(
    (sum, line) =>
      sum +
      (products.find(product => product.slug === line.slug)?.price ?? 0) *
        line.quantity,
    0
  );
  return (
    <header className="site-header">
      <Link className="wordmark" href="/" aria-label="Nuit Lumière home">
        Nuit <span>Lumière</span>
      </Link>
      <nav className="main-nav" aria-label="Main navigation">
        <Link
          href="/gallery"
          className={location === "/gallery" ? "is-active" : undefined}
          aria-current={location === "/gallery" ? "page" : undefined}
        >
          {t("gallery")}
        </Link>
        <Link
          href="/mirror"
          className={location === "/mirror" ? "is-active" : undefined}
          aria-current={location === "/mirror" ? "page" : undefined}
        >
          {t("mirror")}
        </Link>
        <Link
          href="/about"
          className={location === "/about" ? "is-active" : undefined}
          aria-current={location === "/about" ? "page" : undefined}
        >
          {t("about")}
        </Link>
        <Link
          href="/contacts"
          className={location === "/contacts" ? "is-active" : undefined}
          aria-current={location === "/contacts" ? "page" : undefined}
        >
          {t("contact")}
        </Link>
      </nav>
      <div className="header-actions">
        <LanguageSwitcher />
        <details className="mini-cart">
          <summary aria-label={`${t("cart")}, ${quantity}`}>
            <ShoppingBag size={17} strokeWidth={1.5} /> <span>{t("cart")}</span>
            <span className="bag-count">{quantity}</span>
          </summary>
          <div className="mini-cart-panel">
            <div className="mini-cart-title">
              <span>{t("yourCart")}</span>
              <span className="muted">
                {quantity} {quantity === 1 ? "piece" : "pieces"}
              </span>
            </div>
            {items.length === 0 ? (
              <>
                <p className="muted mini-empty">{t("emptyCart")}</p>
                <Link
                  className="button button-outline mini-checkout"
                  href="/cart"
                >
                  {t("openCart")}
                </Link>
              </>
            ) : (
              <>
                <div className="mini-lines">
                  {items.map(line => {
                    const product = products.find(
                      item => item.slug === line.slug
                    );
                    if (!product) return null;
                    return (
                      <div className="mini-line" key={line.slug}>
                        <img src={product.image} alt="" />
                        <div className="mini-line-copy">
                          <strong>{product.name}</strong>
                          <span>{money(product.price)}</span>
                          <div className="quantity-stepper">
                            <button
                              type="button"
                              onClick={() => decrement(line.slug)}
                              aria-label={`Reduce ${product.name} quantity`}
                            >
                              <Minus size={12} />
                            </button>
                            <span>{line.quantity}</span>
                            <button
                              type="button"
                              onClick={() => increment(line.slug)}
                              aria-label={`Add ${product.name} quantity`}
                            >
                              <Plus size={12} />
                            </button>
                            <button
                              className="remove-line"
                              type="button"
                              onClick={() => remove(line.slug)}
                              aria-label={`Remove ${product.name}`}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mini-total">
                  <span>Subtotal</span>
                  <strong>{money(total)}</strong>
                </div>
                <Link className="button button-gold mini-checkout" href="/cart">
                  {t("viewCartCheckout")}
                </Link>
              </>
            )}
          </div>
        </details>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-shell">
        <div className="footer-grid">
          <section className="footer-column footer-shop">
            <h2 className="footer-heading">Shop</h2>
            <nav className="footer-links" aria-label="Shop">
              <Link href="/gallery?gender=women">Women&apos;s Fragrances</Link>
              <Link href="/gallery?gender=men">Men&apos;s Fragrances</Link>
              <Link href="/collection">The Collection</Link>
            </nav>
            <Link className="footer-wordmark" href="/">
              Nuit <span>Lumière</span>
            </Link>
            <p className="footer-tagline">
              Composed for the quiet beauty of evening.
            </p>
          </section>

          <section className="footer-column">
            <h2 className="footer-heading">About</h2>
            <nav className="footer-links" aria-label="About">
              <Link href="/about">Our Story</Link>
              <Link href="/gallery">Gallery</Link>
              <Link href="/contacts">Contact</Link>
            </nav>
          </section>

          <section className="footer-column">
            <h2 className="footer-heading">Help</h2>
            <nav className="footer-links" aria-label="Help">
              <Link href="/contacts?topic=shipping-and-payment">
                Shipping &amp; Payment
              </Link>
              <Link href="/contacts?topic=returns">Returns</Link>
              <Link href="/contacts?topic=faq">Frequently Asked Questions</Link>
            </nav>
          </section>

          <section className="footer-column footer-club">
            <h2 className="footer-heading">The Private Circle</h2>
            <p className="footer-club-copy">
              Join our private circle for new scents and quiet rituals.
            </p>
            <form
              className="footer-newsletter"
              onSubmit={event => event.preventDefault()}
            >
              <input
                id="footer-email"
                name="email"
                type="email"
                autoComplete="email"
                aria-label="Email address"
                placeholder="Your email address"
                required
              />
              <button type="submit">Subscribe</button>
            </form>
          </section>
        </div>

        <div className="footer-bottom">
          <span>© 2024 Nuit Lumière. All rights reserved.</span>
          <nav className="footer-social" aria-label="Social media">
            <a
              href="https://www.instagram.com/"
              aria-label="Instagram"
              target="_blank"
              rel="noreferrer"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle className="footer-social-dot" cx="17.6" cy="6.8" r="1" />
              </svg>
            </a>
            <a
              href="https://t.me/"
              aria-label="Telegram"
              target="_blank"
              rel="noreferrer"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m21 4-3.1 16-6.2-4.6-3.2 3 .6-5.2L19 6.1 7.3 12l-4.2-1.4L21 4Z" />
              </svg>
            </a>
            <a
              href="https://www.pinterest.com/"
              aria-label="Pinterest"
              target="_blank"
              rel="noreferrer"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.8a9.2 9.2 0 0 0-3.35 17.77c-.08-.88-.15-2.24.03-3.2l1.1-4.68s-.28-.56-.28-1.4c0-1.31.76-2.3 1.7-2.3.8 0 1.19.6 1.19 1.32 0 .8-.51 2-0.77 3.12-.22.93.47 1.68 1.39 1.68 1.67 0 2.96-1.76 2.96-4.3 0-2.25-1.62-3.82-3.94-3.82-2.68 0-4.25 2.01-4.25 4.09 0 .81.31 1.69.7 2.17.07.09.08.17.06.26l-.26 1.04c-.04.17-.14.2-.32.12-1.18-.55-1.92-2.28-1.92-3.67 0-2.99 2.17-5.74 6.27-5.74 3.29 0 5.85 2.34 5.85 5.47 0 3.27-2.06 5.9-4.91 5.9-.96 0-1.86-.5-2.17-1.1l-.59 2.26c-.21.83-.78 1.87-1.16 2.5a9.2 9.2 0 1 0 2.67-18.49Z" />
              </svg>
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}

export function SiteLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const targets = document.querySelectorAll<HTMLElement>(
      ".product-card, .section-heading, .page-heading, .hero-copy, .for-him-copy, .home-feature > div, .content-copy"
    );
    if (!("IntersectionObserver" in window)) {
      targets.forEach(target => target.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            currentObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -36px 0px" }
    );
    targets.forEach(target => {
      target.classList.add("reveal-on-scroll");
      observer.observe(target);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Header />
      <OracleSearch />
      {children}
      <Footer />
      <MusicControl />
    </>
  );
}

export function ProductCard({
  product,
  listPath,
}: {
  product: CatalogProduct;
  listPath?: string;
}) {
  const { t } = useLanguage();
  const { add } = useCart();
  const cardId =
    product.gender === "men" ? `for-him-${product.slug}` : product.slug;
  const cardHref = listPath
    ? `${listPath}#${cardId}`
    : product.gender === "men"
      ? `/#${cardId}`
      : `/gallery#${cardId}`;
  return (
    <article className="product-card" id={cardId}>
      <Link
        href={cardHref}
        className="product-image-wrap"
        aria-label={`View ${product.name}`}
        onClick={() => requestVoiceGuide(product.description, product.slug)}
      >
        <img
          src={product.image}
          alt={`${product.name} perfume bottle`}
          loading="lazy"
        />
        <span className="image-shine" />
      </Link>
      <div className="product-details">
        <span className="product-brand">{product.brand}</span>
        <h2>{product.name}</h2>
        <p>{product.description}</p>
        <div className="product-buy-row">
          <strong>{money(product.price)}</strong>
          <button
            type="button"
            className="add-button"
            onClick={() => add(product.slug)}
          >
            {t("addToCart")} <Plus size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}
