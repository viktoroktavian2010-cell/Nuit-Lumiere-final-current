import { int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type ProductSnapshot = {
  slug: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  quantity: number;
};

export const products = mysqlTable("products", {
  slug: varchar("slug", { length: 128 }).primaryKey(),
  name: varchar("name", { length: 180 }).notNull(),
  brand: varchar("brand", { length: 120 }).notNull(),
  gender: mysqlEnum("gender", ["men", "women"]).default("women").notNull(),
  description: text("description").notNull(),
  image: varchar("image", { length: 1000 }).notNull(),
  price: int("price").notNull(),
  active: int("active").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const orders = mysqlTable("orders", {
  id: varchar("id", { length: 64 }).primaryKey(),
  customerName: varchar("customerName", { length: 180 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 40 }).notNull(),
  address: varchar("address", { length: 1000 }).notNull(),
  countryCode: varchar("countryCode", { length: 2 }).default("UA").notNull(),
  shippingMethod: mysqlEnum("shippingMethod", ["nova_poshta", "ukrposhta"]).notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["liqpay"]).default("liqpay").notNull(),
  paymentStatus: varchar("paymentStatus", { length: 64 }).default("pending").notNull(),
  status: mysqlEnum("status", ["pending_payment", "processing", "shipped", "cancelled"]).default("pending_payment").notNull(),
  currency: varchar("currency", { length: 3 }).default("UAH").notNull(),
  total: int("total").notNull(),
  items: json("items").$type<ProductSnapshot[]>().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
