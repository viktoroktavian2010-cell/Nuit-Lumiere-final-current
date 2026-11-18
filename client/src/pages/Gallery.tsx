import { useEffect, useState } from "react";
import { useSearch } from "wouter";
import { ProductCard, SiteLayout } from "@/components/Storefront";
import FilmArchive from "@/components/FilmArchive";
import { trpc } from "@/lib/trpc";
import { seedCatalogProducts } from "@shared/catalog";

const PRODUCTS_PER_PAGE = 9;

export default function Gallery() {
  const query = trpc.catalog.list.useQuery(undefined, { staleTime: 60_000 });
  const products = query.data?.length ? query.data : seedCatalogProducts;
  const search = useSearch();
  const requestedGender = new URLSearchParams(search).get("gender");
  const genderFilter = requestedGender === "men" || requestedGender === "women"
    ? requestedGender
    : null;
  const filteredProducts = genderFilter
    ? products.filter(product => product.gender === genderFilter)
    : products;
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const visibleProducts = filteredProducts.slice(
    page * PRODUCTS_PER_PAGE,
    (page + 1) * PRODUCTS_PER_PAGE
  );

  useEffect(() => {
    setPage(currentPage => Math.min(currentPage, pageCount - 1));
  }, [pageCount]);

  useEffect(() => {
    setPage(0);
  }, [genderFilter]);

  return (
    <SiteLayout>
      <main>
        <FilmArchive products={filteredProducts} />
        <section className="section-shell" aria-labelledby="gallery-grid-heading">
          <div className="section-heading">
            <div>
              <span className="kicker">The interactive collection</span>
              <h1 id="gallery-grid-heading">The Gallery</h1>
            </div>
            <p>Explore every composition at your own pace, and find the fragrance that feels like yours.</p>
          </div>
          <div className="product-grid">
            {visibleProducts.map((product) => (
              <ProductCard key={product.slug} product={product} listPath="/gallery" />
            ))}
          </div>
          <nav className="catalog-pagination" aria-label="Catalog pagination">
            <button
              type="button"
              className="catalog-pagination-arrow catalog-pagination-arrow-prev"
              onClick={() => setPage(currentPage => Math.max(0, currentPage - 1))}
              disabled={page === 0}
              aria-label="Previous page"
            >
              <img src="/pagination-arrow.png" alt="" aria-hidden="true" />
            </button>
            <span className="catalog-pagination-status" aria-live="polite">
              {page + 1} / {pageCount}
            </span>
            <button
              type="button"
              className="catalog-pagination-arrow catalog-pagination-arrow-next"
              onClick={() => setPage(currentPage => Math.min(pageCount - 1, currentPage + 1))}
              disabled={page === pageCount - 1}
              aria-label="Next page"
            >
              <img src="/pagination-arrow.png" alt="" aria-hidden="true" />
            </button>
          </nav>
        </section>
      </main>
    </SiteLayout>
  );
}
