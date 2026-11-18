import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertOrder, InsertProduct, InsertUser, Order, Product, ProductSnapshot, orders, products, users } from "../drizzle/schema";
import { seedProducts } from "../shared/catalog";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;
let seedTask: Promise<void> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) {
      const value = user[field] ?? null;
      values[field] = value;
      updateSet[field] = value;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  } else {
    values.lastSignedIn = new Date();
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  }
  const configuredAdminEmail = (process.env.NUIT_ADMIN_EMAIL ?? "").trim().toLowerCase();
  if (user.openId === ENV.ownerOpenId || (configuredAdminEmail && user.email?.trim().toLowerCase() === configuredAdminEmail)) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function ensureSeedProducts(): Promise<void> {
  if (!seedTask) {
    seedTask = (async () => {
      const db = await getDb();
      if (!db) return;
      const first = await db.select({ slug: products.slug }).from(products).limit(1);
      if (first.length > 0) return;
      await db.insert(products).values(seedProducts.map((product) => ({ ...product, active: 1 })));
    })().catch((error) => {
      seedTask = null;
      throw error;
    });
  }
  await seedTask;
}

export async function listProducts(activeOnly = true): Promise<Product[]> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await ensureSeedProducts();
  return activeOnly
    ? db.select().from(products).where(eq(products.active, 1)).orderBy(products.name)
    : db.select().from(products).orderBy(products.name);
}

export async function saveProduct(product: InsertProduct, originalSlug?: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  if (originalSlug && originalSlug !== product.slug) {
    await db.update(products).set({
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      gender: product.gender,
      description: product.description,
      image: product.image,
      price: product.price,
      active: product.active,
      updatedAt: new Date(),
    }).where(eq(products.slug, originalSlug));
    return;
  }
  await db.insert(products).values(product).onDuplicateKeyUpdate({ set: {
    name: product.name,
    brand: product.brand,
    gender: product.gender,
    description: product.description,
    image: product.image,
    price: product.price,
    active: product.active,
    updatedAt: new Date(),
  } });
}

export async function createOrder(order: InsertOrder): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(orders).values(order);
}

export async function getOrder(id: string): Promise<Order | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return order;
}

export async function listOrders(): Promise<Order[]> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db.select().from(orders).orderBy(desc(orders.createdAt)).limit(500);
}

export async function updateOrderStatus(id: string, status: Order["status"]): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, id));
}

export async function updateLiqPayStatus(id: string, status: string, paid: boolean): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const [current] = await db.select({ paymentStatus: orders.paymentStatus, status: orders.status }).from(orders).where(eq(orders.id, id)).limit(1);
  if (!current || (current.paymentStatus === "success" && !paid)) return;
  await db.update(orders).set({
    paymentStatus: status.slice(0, 64),
    ...(paid && current.status === "pending_payment" ? { status: "processing" as const } : {}),
    updatedAt: new Date(),
  }).where(eq(orders.id, id));
}

export async function checkOrderAmount(id: string, amount: number, currency: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const [order] = await db.select({ total: orders.total, currency: orders.currency }).from(orders).where(and(eq(orders.id, id), eq(orders.currency, currency))).limit(1);
  return !!order && order.total === amount;
}

export type { ProductSnapshot };
