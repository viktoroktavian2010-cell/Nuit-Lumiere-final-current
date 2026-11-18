import { useEffect, useState, type FormEvent } from "react";
import { LockKeyhole, LogOut, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { SiteLayout, money } from "@/components/Storefront";
import { trpc } from "@/lib/trpc";
import { supabase } from "@/lib/supabase";
import { seedCatalogProducts, type CatalogProduct } from "@shared/catalog";
import { readDemoOrders, writeDemoOrders, type DemoOrder, type DemoOrderStatus } from "@/lib/demoOrders";
import "./Admin.css";

const ADMIN_PASSWORD = "admin123";
const ADMIN_SESSION_KEY = "nuit-lumiere-admin-unlocked";
type AdminTab = "products" | "orders";
type ProductDraft = Pick<CatalogProduct, "name" | "brand" | "description" | "image" | "gender"> & { price: string };
type ProductEditor = { mode: "create" | "edit"; originalSlug?: string };
type SupabaseProductRow = {
  slug: string;
  name: string;
  brand: string;
  gender: CatalogProduct["gender"];
  description: string;
  image_url: string;
  price: number | string;
  in_stock: boolean;
};
const SUPABASE_PRODUCT_COLUMNS = "slug,name,brand,gender,description,image_url,price,in_stock";

function readAdminSession() {
  try {
    return typeof window !== "undefined" && window.sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
  } catch {
    return false;
  }
}

function mapSupabaseProduct(product: SupabaseProductRow): CatalogProduct {
  return {
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    description: product.description,
    image: product.image_url,
    price: Number(product.price),
    gender: product.gender,
    active: product.in_stock ? 1 : 0,
  };
}

function emptyProductDraft(): ProductDraft {
  return { name: "", brand: "", price: "", image: "", description: "", gender: "women" };
}

function productDraftFrom(product: CatalogProduct): ProductDraft {
  return {
    name: product.name,
    brand: product.brand,
    price: String(product.price),
    image: product.image,
    description: product.description,
    gender: product.gender,
  };
}

function uniqueProductSlug(name: string, products: CatalogProduct[], excludedSlug?: string) {
  const base = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "product";
  let slug = base;
  let suffix = 2;
  while (products.some((product) => product.slug === slug && product.slug !== excludedSlug)) {
    slug = `${base}-${suffix++}`;
  }
  return slug;
}

export default function Admin() {
  const catalogQuery = trpc.catalog.list.useQuery(undefined, { staleTime: 60_000 });
  const [authenticated, setAuthenticated] = useState(readAdminSession);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState<AdminTab>("products");
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [orders, setOrders] = useState<DemoOrder[]>(readDemoOrders);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [priceDraft, setPriceDraft] = useState("");
  const [productError, setProductError] = useState("");
  const [productEditor, setProductEditor] = useState<ProductEditor | null>(null);
  const [productDraft, setProductDraft] = useState<ProductDraft>(emptyProductDraft);
  const [editorError, setEditorError] = useState("");

  function updateProductDraft<K extends keyof ProductDraft>(field: K, value: ProductDraft[K]) {
    setProductDraft((current) => ({ ...current, [field]: value }));
  }

  useEffect(() => {
    if (supabase) return;
    if (catalogQuery.isLoading && !catalogQuery.isError) return;
    const catalog = catalogQuery.data?.length ? catalogQuery.data : seedCatalogProducts;
    setProducts(catalog);
    setProductsLoaded(true);
  }, [catalogQuery.data, catalogQuery.isError, catalogQuery.isLoading]);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    void supabase
      .from("products")
      .select(SUPABASE_PRODUCT_COLUMNS)
      .order("name")
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setProductError(`Could not load Supabase products: ${error.message}`);
          setProducts([]);
        } else {
          setProducts((data ?? []).map((product) => mapSupabaseProduct(product as SupabaseProductRow)));
        }
        setProductsLoaded(true);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    writeDemoOrders(orders);
  }, [orders]);

  useEffect(() => {
    if (!productEditor) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setProductEditor(null);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [productEditor]);

  function unlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== ADMIN_PASSWORD) {
      setAuthError("That password is not correct. Try again.");
      return;
    }
    try {
      window.sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
    } catch {
      // Access remains available for this tab if session storage is unavailable.
    }
    setAuthError("");
    setAuthenticated(true);
  }

  function logout() {
    try {
      window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
    } catch {
      // The local dashboard can still be locked for this session.
    }
    setAuthenticated(false);
    setPassword("");
  }

  function beginPriceEdit(product: CatalogProduct) {
    setEditingSlug(product.slug);
    setPriceDraft(String(product.price));
    setProductError("");
  }

  async function savePrice(slug: string) {
    const nextPrice = Number(priceDraft);
    if (!Number.isFinite(nextPrice) || nextPrice < 1) {
      setProductError("Enter a price of at least 1 UAH.");
      return;
    }
    if (!supabase) {
      setProductError("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      return;
    }
    const { error } = await supabase.from("products").update({ price: Math.round(nextPrice) }).eq("slug", slug);
    if (error) {
      setProductError(`Could not save product price: ${error.message}`);
      return;
    }
    setProducts((current) => current.map((product) => product.slug === slug ? { ...product, price: Math.round(nextPrice) } : product));
    setEditingSlug(null);
    setPriceDraft("");
    setProductError("");
  }

  function openCreateProduct() {
    setProductDraft(emptyProductDraft());
    setProductEditor({ mode: "create" });
    setEditorError("");
  }

  function openEditProduct(product: CatalogProduct) {
    setProductDraft(productDraftFrom(product));
    setProductEditor({ mode: "edit", originalSlug: product.slug });
    setEditorError("");
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!productEditor) return;

    const name = productDraft.name.trim();
    const brand = productDraft.brand.trim();
    const image = productDraft.image.trim();
    const description = productDraft.description.trim();
    const price = Number(productDraft.price);
    if (!name || !brand || !image || !description) {
      setEditorError("Please complete every product field.");
      return;
    }
    if (!Number.isFinite(price) || price < 1) {
      setEditorError("Enter a price of at least 1 UAH.");
      return;
    }

    const editor = productEditor;
    if (!supabase) {
      setEditorError("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      return;
    }
    const slug = uniqueProductSlug(name, products, editor.originalSlug);
    const existingProduct = editor.originalSlug ? products.find((product) => product.slug === editor.originalSlug) : undefined;
    const values = {
      slug,
      name,
      brand,
      gender: productDraft.gender,
      description,
      image_url: image,
      price: Math.round(price),
      in_stock: editor.mode === "create" ? true : existingProduct?.active === 1,
    };
    const result = editor.mode === "edit" && editor.originalSlug
      ? await supabase.from("products").update(values).eq("slug", editor.originalSlug).select(SUPABASE_PRODUCT_COLUMNS).single()
      : await supabase.from("products").insert(values).select(SUPABASE_PRODUCT_COLUMNS).single();
    if (result.error || !result.data) {
      setEditorError(`Could not save product to Supabase: ${result.error?.message ?? "No product was returned."}`);
      return;
    }
    const savedProduct = mapSupabaseProduct(result.data as SupabaseProductRow);
    setProducts((current) => [savedProduct, ...current.filter((product) => product.slug !== editor.originalSlug && product.slug !== savedProduct.slug)]);
    setProductEditor(null);
    setProductDraft(emptyProductDraft());
    setEditorError("");
    setProductError("");
  }

  async function deleteProduct(product: CatalogProduct) {
    if (!window.confirm(`Delete ${product.name} from the Supabase catalog? This cannot be undone.`)) return;
    if (!supabase) {
      setProductError("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      return;
    }
    const { error } = await supabase.from("products").delete().eq("slug", product.slug);
    if (error) {
      setProductError(`Could not delete product: ${error.message}`);
      return;
    }
    setProducts((current) => current.filter((item) => item.slug !== product.slug));
    if (editingSlug === product.slug) setEditingSlug(null);
    if (productEditor?.originalSlug === product.slug) setProductEditor(null);
  }

  function updateOrderStatus(orderId: string, status: DemoOrderStatus) {
    setOrders((current) => current.map((order) => order.id === orderId ? { ...order, status } : order));
  }

  return (
    <SiteLayout>
      <main className="section-shell local-admin">
        <div className="page-heading">
          <span className="kicker">Store management</span>
          <h1>Administration</h1>
          <p>A lightweight local dashboard for products and demo orders.</p>
        </div>

        {!authenticated ? (
          <section className="admin-login-card" role="dialog" aria-modal="true" aria-labelledby="admin-login-title">
            <div className="admin-login-icon"><LockKeyhole size={19} /></div>
            <span className="kicker">Protected area</span>
            <h2 id="admin-login-title">Administrator sign-in</h2>
            <p>Enter the admin password to manage this storefront.</p>
            <form onSubmit={unlock} autoComplete="off" autoCorrect="off">
              <label className="admin-login-label" htmlFor="admin-password">Password</label>
              <input
                id="admin-password"
                className="admin-login-input"
                type="password"
                autoComplete="off"
                autoCorrect="off"
                value={password}
                onChange={(event) => setPassword(event.currentTarget.value)}
                aria-invalid={Boolean(authError)}
                required
              />
              {authError && <p className="admin-form-error" role="alert">{authError}</p>}
              <button className="button button-gold" type="submit">Unlock dashboard</button>
            </form>
          </section>
        ) : (
          <section className="admin-dashboard" aria-label="Store dashboard">
            <div className="admin-dashboard-toolbar">
              <div className="admin-dashboard-tabs" role="tablist" aria-label="Admin sections">
                <button className={activeTab === "products" ? "is-active" : ""} type="button" role="tab" aria-selected={activeTab === "products"} onClick={() => setActiveTab("products")}>Products <span>{productsLoaded ? products.length : "…"}</span></button>
                <button className={activeTab === "orders" ? "is-active" : ""} type="button" role="tab" aria-selected={activeTab === "orders"} onClick={() => setActiveTab("orders")}>Orders <span>{orders.length}</span></button>
              </div>
              <button className="admin-logout" type="button" onClick={logout}><LogOut size={14} /> Lock dashboard</button>
            </div>

            {activeTab === "products" ? (
              <div className="admin-data-panel" role="tabpanel">
                <div className="admin-panel-heading admin-products-heading">
                  <div>
                    <span className="kicker">Catalog</span>
                    <h2>Products</h2>
                    <p className="admin-products-subtitle">{supabase ? "Products are saved in Supabase." : "Supabase is not configured; showing the demo catalog."}</p>
                  </div>
                  <button className="admin-create-product" type="button" onClick={openCreateProduct}><Plus size={15} /> Create New Product</button>
                </div>
                {productError && <p className="admin-form-error" role="alert">{productError}</p>}
                {catalogQuery.isLoading && !productsLoaded ? <p className="admin-empty">Loading products…</p> : products.length === 0 ? <p className="admin-empty">No products in the catalog.</p> : (
                  <div className="admin-data-table-wrap">
                    <table className="admin-data-table">
                      <thead><tr><th>Name</th><th>Price</th><th>Brand</th><th><span className="sr-only">Actions</span></th></tr></thead>
                      <tbody>{products.map((product) => (
                        <tr key={product.slug}>
                          <td>{product.name}</td>
                          <td>
                            {editingSlug === product.slug ? (
                              <div className="admin-price-editor">
                                <input type="number" min="1" step="1" autoComplete="off" autoCorrect="off" value={priceDraft} onChange={(event) => setPriceDraft(event.currentTarget.value)} aria-label={`Price for ${product.name}`} />
                                <button className="admin-icon-action" type="button" onClick={() => savePrice(product.slug)} aria-label={`Save ${product.name} price`}><Save size={14} /></button>
                                <button className="admin-text-action" type="button" onClick={() => setEditingSlug(null)}>Cancel</button>
                              </div>
                            ) : <><span>{money(product.price)}</span><button className="admin-icon-action" type="button" onClick={() => beginPriceEdit(product)} aria-label={`Edit ${product.name} price`}><Pencil size={13} /></button></>}
                          </td>
                          <td>{product.brand}</td>
                          <td>
                            <div className="admin-row-actions">
                              <button className="admin-edit-product" type="button" onClick={() => openEditProduct(product)}><Pencil size={13} /> Edit</button>
                              <button className="admin-delete-product" type="button" onClick={() => deleteProduct(product)} aria-label={`Delete ${product.name}`}><Trash2 size={13} /> Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div className="admin-data-panel" role="tabpanel">
                <div className="admin-panel-heading"><div><span className="kicker">Demo checkout</span><h2>Orders</h2></div><p>Test orders from checkout are stored locally in this browser.</p></div>
                {orders.length === 0 ? <p className="admin-empty">No test orders yet. Complete the demo checkout to create one.</p> : (
                  <div className="admin-data-table-wrap">
                    <table className="admin-data-table">
                      <thead><tr><th>Customer Name</th><th>Total</th><th>Status</th></tr></thead>
                      <tbody>{orders.map((order) => (
                        <tr key={order.id}>
                          <td>{order.customerName}<small>{new Date(order.createdAt).toLocaleString()}</small></td>
                          <td>{money(order.total)}</td>
                          <td>
                            <select value={order.status} onChange={(event) => updateOrderStatus(order.id, event.currentTarget.value as DemoOrderStatus)} aria-label={`Status for ${order.customerName}`}>
                              <option value="New">New</option>
                              <option value="Paid">Paid</option>
                              <option value="Shipped">Shipped</option>
                            </select>
                          </td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {authenticated && productEditor && (
          <div className="admin-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setProductEditor(null); }}>
            <section className="admin-product-modal" role="dialog" aria-modal="true" aria-labelledby="admin-product-modal-title">
              <div className="admin-product-modal-heading">
                <div><span className="kicker">Catalog entry</span><h2 id="admin-product-modal-title">{productEditor.mode === "create" ? "Create New Product" : "Edit Product"}</h2></div>
                <button className="admin-modal-close" type="button" onClick={() => setProductEditor(null)} aria-label="Close product form"><X size={18} /></button>
              </div>
              <form onSubmit={saveProduct} autoComplete="off" autoCorrect="off">
                <div className="admin-product-form-grid">
                  <label>Name<input type="text" name="catalog-item-title" autoComplete="off" autoCorrect="off" value={productDraft.name} onChange={(event) => updateProductDraft("name", event.currentTarget.value)} required /></label>
                  <label>Brand<input type="text" name="catalog-brand-text" autoComplete="off" autoCorrect="off" value={productDraft.brand} onChange={(event) => updateProductDraft("brand", event.currentTarget.value)} required /></label>
                  <label>Price<input type="text" name="catalog-price-text" autoComplete="off" autoCorrect="off" value={productDraft.price} onChange={(event) => updateProductDraft("price", event.currentTarget.value)} required /></label>
                  <label>Gender<select value={productDraft.gender} onChange={(event) => updateProductDraft("gender", event.currentTarget.value as CatalogProduct["gender"])}><option value="women">Women</option><option value="men">Men</option></select></label>
                  <label className="admin-form-wide">Image URL<input type="text" name="catalog-image-url-text" placeholder="https://… or /perfumes/image.webp" autoComplete="off" autoCorrect="off" value={productDraft.image} onChange={(event) => updateProductDraft("image", event.currentTarget.value)} required /></label>
                  <label className="admin-form-wide">Description<textarea rows={4} value={productDraft.description} onChange={(event) => updateProductDraft("description", event.currentTarget.value)} required /></label>
                </div>
                {editorError && <p className="admin-form-error" role="alert">{editorError}</p>}
                <div className="admin-product-form-actions">
                  <button className="admin-text-action" type="button" onClick={() => setProductEditor(null)}>Cancel</button>
                  <button className="button button-gold" type="submit">{productEditor.mode === "create" ? "Create Product" : "Save Changes"}</button>
                </div>
              </form>
            </section>
          </div>
        )}
      </main>
    </SiteLayout>
  );
}
