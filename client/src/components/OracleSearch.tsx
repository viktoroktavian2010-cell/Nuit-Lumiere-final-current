import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import { Link, useLocation } from "wouter";
import { seedCatalogProducts } from "@shared/catalog";
import { trpc } from "@/lib/trpc";
import "./OracleSearch.css";

export default function OracleSearch() {
  const [location, setLocation] = useLocation();
  const productsQuery = trpc.catalog.list.useQuery(undefined, {
    staleTime: 60_000,
  });
  const products = productsQuery.data?.length
    ? productsQuery.data
    : seedCatalogProducts;
  const [query, setQuery] = useState("");
  const [typedPlaceholder, setTypedPlaceholder] = useState("");
  const isGallery = location.split(/[?#]/, 1)[0] === "/gallery";
  const isSupportedPage = ["/mirror", "/gallery"].includes(
    location.split(/[?#]/, 1)[0]
  );
  const placeholder = isGallery
    ? "Search fragrances..."
    : "Tell the Oracle your secret desire...";

  useEffect(() => {
    setTypedPlaceholder("");
    const characters = Array.from(placeholder);
    let count = 0;
    const timer = window.setInterval(() => {
      count += 1;
      setTypedPlaceholder(characters.slice(0, count).join(""));
      if (count >= characters.length) window.clearInterval(timer);
    }, 100);
    return () => window.clearInterval(timer);
  }, [placeholder]);

  const matches = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return [];
    return products
      .filter(product =>
        `${product.name} ${product.brand} ${product.description}`
          .toLocaleLowerCase()
          .includes(normalizedQuery)
      )
      .slice(0, 5);
  }, [products, query]);

  if (!isSupportedPage) return null;

  const productHref = (slug: string, gender: string) =>
    `/gallery#${gender === "men" ? `for-him-${slug}` : slug}`;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const firstMatch = matches[0];
    if (firstMatch) {
      setLocation(productHref(firstMatch.slug, firstMatch.gender));
      setQuery("");
    }
  };

  return (
    <section
      className="oracle-search-band"
      aria-label={isGallery ? "Search fragrances" : "Oracle search"}
    >
      <form className="oracle-search" role="search" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="oracle-fragrance-search">
          {isGallery
            ? "Search fragrances"
            : "Tell the Oracle your secret desire"}
        </label>
        <input
          id="oracle-fragrance-search"
          type="search"
          autoComplete="off"
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder={typedPlaceholder}
          aria-label={
            isGallery
              ? "Search fragrances"
              : "Tell the Oracle your secret desire"
          }
          aria-controls="oracle-search-results"
          aria-expanded={matches.length > 0}
        />
        <button type="submit" aria-label="Search">
          <Search size={21} strokeWidth={1.4} aria-hidden="true" />
        </button>
        {matches.length > 0 && (
          <div
            className="oracle-results"
            id="oracle-search-results"
            role="listbox"
          >
            {matches.map(product => (
              <Link
                key={product.slug}
                href={productHref(product.slug, product.gender)}
                role="option"
                aria-selected={false}
                onClick={() => setQuery("")}
              >
                <span>{product.name}</span>
                <small>{product.brand}</small>
              </Link>
            ))}
          </div>
        )}
      </form>
    </section>
  );
}
