import { randomUUID } from "node:crypto";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { createLiqPayCheckout, liqpayReadiness } from "./liqpay";
import { z } from "zod";
import { seedCatalogProducts, type CatalogProduct } from "../shared/catalog";
import { supabaseServer } from "./supabase";

const productInput = z.object({
  slug: z.string().trim().min(2).max(128).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().trim().min(2).max(180),
  brand: z.string().trim().min(1).max(120),
  gender: z.enum(["men", "women"]),
  description: z.string().trim().min(5).max(2000),
  image: z.string().trim().min(1).max(1000).refine((value) => value.startsWith("/perfumes/") || /^https:\/\//i.test(value), "Use a local product image or HTTPS image URL"),
  price: z.number().int().min(1).max(10_000_000),
  active: z.boolean(),
});

export const appRouter = router({
  auth: router({
    me: publicProcedure.query(({ ctx }) => ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = { path: "/", httpOnly: true, secure: true, sameSite: "none" as const };
      ctx.res.clearCookie("webdev_app_session", { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  catalog: router({
    list: publicProcedure.query(async () => {
      if (supabaseServer) {
        const { data, error } = await supabaseServer
          .from("products")
          .select("slug,name,brand,gender,description,image_url,price,in_stock")
          .eq("in_stock", true)
          .order("name");
        if (!error && data) {
          return data.map((product): CatalogProduct => ({
            slug: product.slug,
            name: product.name,
            brand: product.brand,
            gender: product.gender as CatalogProduct["gender"],
            description: product.description,
            image: product.image_url,
            price: Number(product.price),
            active: 1,
          }));
        }
        console.warn("[Catalog] Supabase unavailable; trying the existing database.", error);
      }
      try {
        const products = await db.listProducts(true);
        return products.length ? products : seedCatalogProducts;
      } catch (error) {
        console.warn("[Catalog] Database unavailable; using original seed products.", error);
        return seedCatalogProducts;
      }
    }),
  }),
  checkout: router({
    readiness: publicProcedure.query(() => liqpayReadiness()),
    createOrder: publicProcedure.input(z.object({
      name: z.string().trim().min(2).max(180),
      email: z.string().trim().email().max(320),
      phone: z.string().trim().min(7).max(40).regex(/^[+0-9() .-]+$/),
      address: z.string().trim().min(5).max(1000),
      shippingMethod: z.enum(["nova_poshta", "ukrposhta"]),
      lines: z.array(z.object({ slug: z.string().min(2).max(128), quantity: z.number().int().min(1).max(99) })).min(1).max(50),
    })).mutation(async ({ input }) => {
      const catalog = await db.listProducts(true);
      const bySlug = new Map(catalog.map((product) => [product.slug, product]));
      const quantities = new Map<string, number>();
      for (const line of input.lines) quantities.set(line.slug, (quantities.get(line.slug) ?? 0) + line.quantity);
      if (Array.from(quantities.values()).some((quantity) => quantity > 99)) throw new Error("Please reduce item quantities before checkout.");
      const items = Array.from(quantities.entries()).map(([slug, quantity]) => {
        const product = bySlug.get(slug);
        if (!product) throw new Error("A product in your bag is no longer available.");
        return { slug, name: product.name, brand: product.brand, image: product.image, price: product.price, quantity };
      });
      const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const id = randomUUID();
      await db.createOrder({
        id,
        customerName: input.name,
        customerEmail: input.email.toLowerCase(),
        customerPhone: input.phone,
        address: input.address,
        countryCode: "UA",
        shippingMethod: input.shippingMethod,
        paymentMethod: "liqpay",
        paymentStatus: "pending",
        status: "pending_payment",
        currency: "UAH",
        total,
        items,
      });
      const checkout = createLiqPayCheckout({ orderId: id, amount: total, description: `Nuit Lumiere order ${id}` });
      return { id, total, currency: "UAH" as const, checkout, paymentReady: Boolean(checkout) };
    }),
    status: publicProcedure.input(z.object({ orderId: z.string().uuid() })).query(async ({ input }) => {
      const order = await db.getOrder(input.orderId);
      if (!order) return null;
      return { id: order.id, total: order.total, currency: order.currency, status: order.status, paymentStatus: order.paymentStatus, updatedAt: order.updatedAt };
    }),
  }),
  admin: router({
    me: adminProcedure.query(({ ctx }) => ({ id: ctx.user.id, name: ctx.user.name, email: ctx.user.email })),
    products: adminProcedure.query(async () => db.listProducts(false)),
    saveProduct: adminProcedure.input(productInput.extend({ originalSlug: z.string().trim().min(2).max(128).optional() })).mutation(async ({ input }) => {
      const { originalSlug, ...product } = input;
      await db.saveProduct({ ...product, active: product.active ? 1 : 0 }, originalSlug);
      return { success: true } as const;
    }),
    orders: adminProcedure.query(async () => db.listOrders()),
    updateOrderStatus: adminProcedure.input(z.object({
      id: z.string().uuid(),
      status: z.enum(["processing", "shipped", "cancelled"]),
    })).mutation(async ({ input }) => {
      await db.updateOrderStatus(input.id, input.status);
      return { success: true } as const;
    }),
  }),
});

export type AppRouter = typeof appRouter;
