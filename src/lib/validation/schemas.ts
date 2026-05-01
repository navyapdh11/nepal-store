import { z } from "zod";

// ─── Auth Schemas ───
export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
});

// ─── Vendor Schemas ───
export const createVendorSchema = z.object({
  storeName: z.string().min(3, "Store name must be at least 3 characters"),
  description: z.string().max(2000).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  banner: z.string().url().optional(),
  logo: z.string().url().optional(),
});

export const updateVendorSchema = z.object({
  storeName: z.string().min(3).optional(),
  description: z.string().max(2000).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  banner: z.string().url().optional(),
  logo: z.string().url().optional(),
});

// ─── Product Schemas ───
export const createProductSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  shortDesc: z.string().max(200).optional(),
  price: z.number().positive("Price must be positive"),
  originalPrice: z.number().positive().optional(),
  category: z.string(),
  categoryId: z.string().optional(),
  images: z.array(z.string().url()).min(1, "At least one image required"),
  mainImage: z.string().url(),
  sizes: z.array(z.string()).default(["XS", "S", "M", "L", "XL"]),
  colors: z.array(z.object({ name: z.string(), hex: z.string() })).default([{ name: "Default", hex: "#000" }]),
  brand: z.string().optional(),
  sku: z.string().optional(),
  stock: z.number().int().nonnegative().default(0),
  tags: z.array(z.string()).optional(),
  freeShipping: z.boolean().default(false),
  shippingFrom: z.string().optional(),
  shippingDays: z.string().optional(),
  isFlashSale: z.boolean().default(false),
  flashSaleEnd: z.string().datetime().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const productFilterSchema = z.object({
  category: z.string().optional(),
  categoryId: z.string().optional(),
  vendorId: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  minRating: z.number().min(0).max(5).optional(),
  freeShipping: z.boolean().optional(),
  isFlashSale: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  brand: z.string().optional(),
  tags: z.array(z.string()).optional(),
  sort: z.enum(["newest", "price_asc", "price_desc", "rating", "popular", "sold"]).default("newest"),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
});

// ─── Order Schemas ───
export const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
    size: z.string().optional(),
    color: z.string().optional(),
  })).min(1, "At least one item required"),
  shippingAddressId: z.string().optional(),
  shippingAddress: z.object({
    name: z.string().min(2),
    phone: z.string().min(10),
    address: z.string().min(5),
    city: z.string(),
    province: z.string(),
    zip: z.string().optional(),
  }).optional(),
  paymentMethod: z.enum(["COD", "eSewa", "Khalti", "Stripe"]).default("COD"),
  couponCode: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]),
  trackingNumber: z.string().optional(),
  trackingUrl: z.string().url().optional(),
});

export const orderFilterSchema = z.object({
  status: z.string().optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
});

// ─── Review Schemas ───
export const createReviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).optional(),
  comment: z.string().min(10).max(2000),
  images: z.array(z.string().url()).optional(),
});

export const updateReviewHelpfulSchema = z.object({
  reviewId: z.string(),
});

// ─── Address Schemas ───
export const createAddressSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  address: z.string().min(5),
  city: z.string(),
  province: z.string(),
  zip: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export const updateAddressSchema = createAddressSchema.partial();

// ─── Coupon Schemas ───
export const createCouponSchema = z.object({
  code: z.string().min(3).max(50).toUpperCase(),
  description: z.string().max(500),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().positive(),
  minOrder: z.number().nonnegative().default(0),
  maxDiscount: z.number().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  validFrom: z.string().datetime(),
  validUntil: z.string().datetime(),
});

export const applyCouponSchema = z.object({
  code: z.string(),
  orderTotal: z.number().positive(),
});

// ─── Message Schemas ───
export const sendMessageSchema = z.object({
  receiverId: z.string(),
  content: z.string().min(1).max(5000),
});

export const messageFilterSchema = z.object({
  otherUserId: z.string(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(50),
});

// ─── Search Schema ───
export const searchSchema = z.object({
  q: z.string().min(1).max(200),
  category: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  minRating: z.number().optional(),
  freeShipping: z.boolean().optional(),
  sort: z.enum(["relevance", "newest", "price_asc", "price_desc", "rating", "popular"]).default("relevance"),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
});

// ─── Category Schemas ───
export const createCategorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  parentId: z.string().optional(),
  icon: z.string().optional(),
  level: z.number().int().min(0).max(3).default(0),
  sortOrder: z.number().int().default(0),
});

export const updateCategorySchema = createCategorySchema.partial();

// ─── Type Exports ───
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateVendorInput = z.infer<typeof createVendorSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductFilter = z.infer<typeof productFilterSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
