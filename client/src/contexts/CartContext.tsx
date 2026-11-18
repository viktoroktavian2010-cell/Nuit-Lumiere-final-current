import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type CartLine = { slug: string; quantity: number };
type CartContextValue = {
  items: CartLine[];
  add: (slug: string) => void;
  remove: (slug: string) => void;
  increment: (slug: string) => void;
  decrement: (slug: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "nuit-lumiere-cart-v1";
const CartContext = createContext<CartContextValue | null>(null);

function readStoredCart(): CartLine[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((line): line is CartLine =>
      line && typeof line.slug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(line.slug)
      && Number.isInteger(line.quantity) && line.quantity > 0 && line.quantity <= 99
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>(readStoredCart);
  const commit = useCallback((next: CartLine[]) => {
    setItems(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* storage can be disabled */ }
  }, []);
  const add = useCallback((slug: string) => commit(items.some((line) => line.slug === slug)
    ? items.map((line) => line.slug === slug ? { ...line, quantity: Math.min(99, line.quantity + 1) } : line)
    : [...items, { slug, quantity: 1 }]), [commit, items]);
  const remove = useCallback((slug: string) => commit(items.filter((line) => line.slug !== slug)), [commit, items]);
  const increment = useCallback((slug: string) => commit(items.map((line) => line.slug === slug ? { ...line, quantity: Math.min(99, line.quantity + 1) } : line)), [commit, items]);
  const decrement = useCallback((slug: string) => commit(items.map((line) => line.slug === slug ? { ...line, quantity: Math.max(1, line.quantity - 1) } : line)), [commit, items]);
  const clear = useCallback(() => commit([]), [commit]);
  const value = useMemo(() => ({ items, add, remove, increment, decrement, clear }), [items, add, remove, increment, decrement, clear]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider");
  return value;
}
