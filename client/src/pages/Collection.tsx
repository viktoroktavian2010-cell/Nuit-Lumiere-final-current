import { ProductCard, SiteLayout } from "@/components/Storefront";
import { trpc } from "@/lib/trpc";
import { seedCatalogProducts } from "@shared/catalog";

export default function Collection() {
  const query = trpc.catalog.list.useQuery(undefined, { staleTime: 60_000 });
  const products = query.data?.length ? query.data : seedCatalogProducts;
  return <SiteLayout><main className="section-shell">
    <div className="page-heading"><span className="kicker">Nuit Lumière</span><h1>The Collection</h1><p>A considered selection of memorable compositions — from luminous florals to deep woods and amber. Discover the character and story behind each scent.</p></div>
    <figure className="collection-signature collection-hero"><img src="/media/diamond-fragrance.png" alt="Nuit Lumière signature diamond perfume bottle" loading="eager" /></figure>
    <div className="product-grid">{products.map((product) => <ProductCard key={product.slug} product={product} />)}</div>
  </main></SiteLayout>;
}
