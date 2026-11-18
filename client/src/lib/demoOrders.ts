export const DEMO_ORDERS_STORAGE_KEY = "nuit-lumiere-demo-orders";

export type DemoOrderStatus = "New" | "Paid" | "Shipped";

export type DemoOrder = {
  id: string;
  customerName: string;
  total: number;
  status: DemoOrderStatus;
  createdAt: string;
};

export function readDemoOrders(): DemoOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(DEMO_ORDERS_STORAGE_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((order): order is DemoOrder =>
      order !== null && typeof order === "object" &&
      typeof order.id === "string" && typeof order.customerName === "string" &&
      typeof order.total === "number" &&
      (order.status === "New" || order.status === "Paid" || order.status === "Shipped") &&
      typeof order.createdAt === "string",
    );
  } catch {
    return [];
  }
}

export function writeDemoOrders(orders: DemoOrder[]): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(DEMO_ORDERS_STORAGE_KEY, JSON.stringify(orders));
    return true;
  } catch {
    return false;
  }
}

export function appendDemoOrder(order: DemoOrder): boolean {
  return writeDemoOrders([order, ...readDemoOrders()]);
}
