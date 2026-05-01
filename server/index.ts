import fs from "node:fs";
import path from "node:path";
import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { applySecurityMiddleware } from "./middleware/security.js";
import {
	requireAuth,
	requireAdmin,
	requireVendorOrAdmin,
	decodeToken,
	type AuthRequest,
} from "./middleware/auth.js";
import {
	registerSchema,
	loginSchema,
	updateProfileSchema,
	createVendorSchema,
	updateVendorSchema,
	createProductSchema,
	updateProductSchema,
	productFilterSchema,
	createOrderSchema,
	updateOrderStatusSchema,
	createReviewSchema,
	updateReviewHelpfulSchema,
	createAddressSchema,
	updateAddressSchema,
	createCouponSchema,
	applyCouponSchema,
	sendMessageSchema,
	searchSchema,
	createCategorySchema,
	updateCategorySchema,
} from "../src/lib/validation/schemas.js";

const app = express();
const port = process.env.PORT || 3001;
const prisma = new PrismaClient();

// Apply security middleware
applySecurityMiddleware(app);
app.use(express.json({ limit: "10mb" }));
app.use(express.static("public"));

// ─── Helpers ───

const getJwtSecret = (): string => {
	const secret = process.env.JWT_SECRET;
	if (!secret) throw new Error("JWT_SECRET not configured");
	return secret;
};

const signToken = (userId: string, role: string) =>
	jwt.sign({ userId, role }, getJwtSecret(), { expiresIn: "7d" });

const slugify = (text: string) =>
	text
		.toLowerCase()
		.replace(/[^\w\s-]/g, "")
		.replace(/[\s_]+/g, "-")
		.replace(/-+/g, "-")
		.trim();

const generateOrderNumber = () => {
	const now = new Date();
	const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
	const random = Math.floor(Math.random() * 9999)
		.toString()
		.padStart(4, "0");
	return `NP-${date}-${random}`;
};

const parseJsonField = (val: string | null) => {
	if (!val) return null;
	try {
		return JSON.parse(val);
	} catch {
		return val;
	}
};

const withPagination = (page: string | undefined, pageSize: string | undefined, defaultSize = 20) => {
	const p = Math.max(1, Number(page) || 1);
	const ps = Math.min(100, Math.max(1, Number(pageSize) || defaultSize));
	return { skip: (p - 1) * ps, take: ps, page: p, pageSize: ps };
};

const ensureUserVendor = async (userId: string) => {
	let vendor = await prisma.vendor.findUnique({ where: { userId } });
	if (!vendor) {
		const user = await prisma.user.findUnique({ where: { id: userId } });
		if (!user) return null;
		const storeName = user.name ? `${user.name}'s Store` : `Store-${userId.slice(0, 6)}`;
		vendor = await prisma.vendor.create({
			data: {
				userId,
				storeName,
				storeSlug: slugify(storeName),
			},
		});
	}
	return vendor;
};

// ============================================================================
// AUTH ROUTES
// ============================================================================

// POST /api/auth/register
app.post("/api/auth/register", async (req, res) => {
	try {
		const data = registerSchema.parse(req.body);
		const existing = await prisma.user.findUnique({ where: { email: data.email } });
		if (existing) return res.status(409).json({ error: "User already exists" });

		const hashedPassword = await bcrypt.hash(data.password, 12);
		const user = await prisma.user.create({
			data: {
				email: data.email,
				name: data.name,
				password: hashedPassword,
				phone: data.phone,
			},
		});

		const token = signToken(user.id, user.role);
		res.status(201).json({
			token,
			user: { id: user.id, email: user.email, name: user.name, role: user.role },
		});
	} catch (err: unknown) {
		if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
		res.status(400).json({ error: (err as Error).message });
	}
});

// POST /api/auth/login
app.post("/api/auth/login", async (req, res) => {
	try {
		const data = loginSchema.parse(req.body);
		const user = await prisma.user.findUnique({ where: { email: data.email } });
		if (!user || !user.password) return res.status(401).json({ error: "Invalid credentials" });

		const isValid = await bcrypt.compare(data.password, user.password);
		if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

		const token = signToken(user.id, user.role);
		res.json({
			token,
			user: { id: user.id, email: user.email, name: user.name, role: user.role },
		});
	} catch (err: unknown) {
		if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
		res.status(401).json({ error: (err as Error).message });
	}
});

// GET /api/auth/me (protected)
app.get("/api/auth/me", requireAuth as any, async (req: AuthRequest, res) => {
	try {
		const user = await prisma.user.findUnique({
			where: { id: req.user!.userId },
			select: {
				id: true, email: true, name: true, role: true, phone: true, avatar: true, createdAt: true,
			},
		});
		if (!user) return res.status(404).json({ error: "User not found" });
		res.json(user);
	} catch (err: unknown) {
		res.status(500).json({ error: (err as Error).message });
	}
});

// PUT /api/auth/profile (protected)
app.put("/api/auth/profile", requireAuth as any, async (req: AuthRequest, res) => {
	try {
		const data = updateProfileSchema.parse(req.body);
		const user = await prisma.user.update({
			where: { id: req.user!.userId },
			data,
			select: { id: true, email: true, name: true, role: true, phone: true, avatar: true, updatedAt: true },
		});
		res.json(user);
	} catch (err: unknown) {
		if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
		res.status(400).json({ error: (err as Error).message });
	}
});

// ============================================================================
// VENDOR ROUTES
// ============================================================================

// POST /api/vendors (create vendor store - requires auth)
app.post("/api/vendors", requireAuth as any, async (req: AuthRequest, res) => {
	try {
		const data = createVendorSchema.parse(req.body);
		const existingVendor = await prisma.vendor.findUnique({ where: { userId: req.user!.userId } });
		if (existingVendor) return res.status(409).json({ error: "You already have a vendor account" });

		const storeSlug = slugify(data.storeName);
		const slugExists = await prisma.vendor.findUnique({ where: { storeSlug } });
		if (slugExists) return res.status(409).json({ error: "Store name already taken" });

		const vendor = await prisma.vendor.create({
			data: { ...data, storeSlug, userId: req.user!.userId },
		});
		res.status(201).json(vendor);
	} catch (err: unknown) {
		if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
		res.status(400).json({ error: (err as Error).message });
	}
});

// GET /api/vendors (list all vendors with pagination)
app.get("/api/vendors", async (req, res) => {
	try {
		const { page, pageSize, skip, take } = withPagination(req.query.page as string, req.query.pageSize as string);
		const { search, verified, sort } = req.query;

		const where: any = {};
		if (search) where.OR = [{ storeName: { contains: search as string, mode: "insensitive" } }, { description: { contains: search as string, mode: "insensitive" } }];
		if (verified === "true") where.verified = true;

		const orderBy: any = {};
		if (sort === "rating") orderBy.rating = "desc";
		else if (sort === "sales") orderBy.totalSales = "desc";
		else if (sort === "followers") orderBy.followerCount = "desc";
		else orderBy.createdAt = "desc";

		const [vendors, total] = await Promise.all([
			prisma.vendor.findMany({ where, skip, take, orderBy, select: { id: true, storeName: true, storeSlug: true, logo: true, banner: true, city: true, province: true, rating: true, totalReviews: true, totalSales: true, followerCount: true, productCount: true, verified: true, createdAt: true } }),
			prisma.vendor.count({ where }),
		]);

		res.json({ vendors, total, page, pageSize, totalPages: Math.ceil(total / take) });
	} catch (err: unknown) {
		res.status(500).json({ error: (err as Error).message });
	}
});

// GET /api/vendors/:slug
app.get("/api/vendors/:slug", async (req, res) => {
	try {
		const vendor = await prisma.vendor.findUnique({ where: { storeSlug: req.params.slug } });
		if (!vendor) return res.status(404).json({ error: "Vendor not found" });
		res.json(vendor);
	} catch (err: unknown) {
		res.status(500).json({ error: (err as Error).message });
	}
});

// GET /api/vendors/:id
app.get("/api/vendors/:id", async (req, res) => {
	try {
		const vendor = await prisma.vendor.findUnique({ where: { id: req.params.id } });
		if (!vendor) return res.status(404).json({ error: "Vendor not found" });
		res.json(vendor);
	} catch (err: unknown) {
		res.status(500).json({ error: (err as Error).message });
	}
});

// PUT /api/vendors/:id (update - vendor only)
app.put("/api/vendors/:id", requireAuth as any, async (req: AuthRequest, res) => {
	try {
		const vendor = await prisma.vendor.findUnique({ where: { id: req.params.id } });
		if (!vendor) return res.status(404).json({ error: "Vendor not found" });
		if (vendor.userId !== req.user!.userId && req.user!.role !== "ADMIN") {
			return res.status(403).json({ error: "You can only update your own vendor" });
		}

		const data = updateVendorSchema.parse(req.body);
		const updateData: any = { ...data };
		if (data.storeName && data.storeName !== vendor.storeName) {
			const newSlug = slugify(data.storeName);
			const slugExists = await prisma.vendor.findFirst({ where: { storeSlug: newSlug, id: { not: req.params.id } } });
			if (slugExists) return res.status(409).json({ error: "Store name already taken" });
			updateData.storeSlug = newSlug;
		}

		const updated = await prisma.vendor.update({ where: { id: req.params.id }, data: updateData });
		res.json(updated);
	} catch (err: unknown) {
		if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
		res.status(400).json({ error: (err as Error).message });
	}
});

// POST /api/vendors/:id/follow (follow vendor - requires auth)
app.post("/api/vendors/:id/follow", requireAuth as any, async (req: AuthRequest, res) => {
	try {
		const vendor = await prisma.vendor.findUnique({ where: { id: req.params.id } });
		if (!vendor) return res.status(404).json({ error: "Vendor not found" });

		const updated = await prisma.vendor.update({
			where: { id: req.params.id },
			data: { followerCount: { increment: 1 } },
		});
		res.json({ followerCount: updated.followerCount });
	} catch (err: unknown) {
		res.status(500).json({ error: (err as Error).message });
	}
});

// GET /api/vendors/:id/stats
app.get("/api/vendors/:id/stats", async (req, res) => {
	try {
		const vendor = await prisma.vendor.findUnique({ where: { id: req.params.id } });
		if (!vendor) return res.status(404).json({ error: "Vendor not found" });

		const [productCount, totalSales, avgRating] = await Promise.all([
			prisma.product.count({ where: { vendorId: req.params.id, isActive: true } }),
			prisma.order.count({ where: { vendorId: req.params.id } }),
			prisma.review.aggregate({ where: { vendorId: req.params.id }, _avg: { rating: true } }),
		]);

		res.json({
			productCount: vendor.productCount || productCount,
			totalSales: vendor.totalSales || totalSales,
			avgRating: Number(avgRating._avg.rating?.toFixed(1)) || vendor.rating,
			totalReviews: vendor.totalReviews,
			followerCount: vendor.followerCount,
		});
	} catch (err: unknown) {
		res.status(500).json({ error: (err as Error).message });
	}
});

// GET /api/vendors/:id/products
app.get("/api/vendors/:id/products", async (req, res) => {
	try {
		const { page, pageSize, skip, take } = withPagination(req.query.page as string, req.query.pageSize as string);
		const vendor = await prisma.vendor.findUnique({ where: { id: req.params.id } });
		if (!vendor) return res.status(404).json({ error: "Vendor not found" });

		const where: any = { vendorId: req.params.id };
		const isActive = req.query.isActive;
		if (isActive === "true") where.isActive = true;
		else if (isActive === "false") where.isActive = false;

		const [products, total] = await Promise.all([
			prisma.product.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
			prisma.product.count({ where }),
		]);

		res.json({
			products: products.map(p => ({ ...p, images: parseJsonField(p.images), sizes: parseJsonField(p.sizes), colors: parseJsonField(p.colors), tags: parseJsonField(p.tags) })),
			total,
			page,
			pageSize,
			totalPages: Math.ceil(total / take),
		});
	} catch (err: unknown) {
		res.status(500).json({ error: (err as Error).message });
	}
});

// ============================================================================
// CATEGORY ROUTES
// ============================================================================

// GET /api/categories (full tree)
app.get("/api/categories", async (req, res) => {
	try {
		const categories = await prisma.category.findMany({
			where: { isActive: true },
			orderBy: [{ level: "asc" }, { sortOrder: "asc" }],
		});

		// Build tree
		const tree: any[] = [];
		const map = new Map<string, any>();
		categories.forEach(c => {
			map.set(c.id, { ...c, children: [] });
		});
		categories.forEach(c => {
			const node = map.get(c.id);
			if (c.parentId && map.has(c.parentId)) {
				map.get(c.parentId).children.push(node);
			} else {
				tree.push(node);
			}
		});

		res.json({ categories: tree });
	} catch (err: unknown) {
		res.status(500).json({ error: (err as Error).message });
	}
});

// GET /api/categories/:slug
app.get("/api/categories/:slug", async (req, res) => {
	try {
		const category = await prisma.category.findUnique({
			where: { slug: req.params.slug },
			include: { children: true },
		});
		if (!category) return res.status(404).json({ error: "Category not found" });
		res.json(category);
	} catch (err: unknown) {
		res.status(500).json({ error: (err as Error).message });
	}
});

// POST /api/categories (admin only)
app.post("/api/categories", requireAdmin as any, async (req: AuthRequest, res) => {
	try {
		const data = createCategorySchema.parse(req.body);
		if (data.parentId) {
			const parent = await prisma.category.findUnique({ where: { id: data.parentId } });
			if (!parent) return res.status(400).json({ error: "Parent category not found" });
			data.level = (parent.level || 0) + 1;
		}
		const category = await prisma.category.create({ data });
		res.status(201).json(category);
	} catch (err: unknown) {
		if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
		res.status(400).json({ error: (err as Error).message });
	}
});

// PUT /api/categories/:id (admin only)
app.put("/api/categories/:id", requireAdmin as any, async (req: AuthRequest, res) => {
	try {
		const data = updateCategorySchema.parse(req.body);
		const category = await prisma.category.update({ where: { id: req.params.id }, data });
		res.json(category);
	} catch (err: unknown) {
		if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
		res.status(400).json({ error: (err as Error).message });
	}
});

// ============================================================================
// PRODUCT ROUTES (PUBLIC)
// ============================================================================

// GET /api/products (with filters)
app.get("/api/products", async (req, res) => {
	try {
		const parsed = productFilterSchema.safeParse({
			category: req.query.category,
			categoryId: req.query.categoryId,
			vendorId: req.query.vendorId,
			search: req.query.search,
			minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
			maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
			minRating: req.query.minRating ? Number(req.query.minRating) : undefined,
			freeShipping: req.query.freeShipping === "true",
			isFlashSale: req.query.isFlashSale === "true",
			isFeatured: req.query.isFeatured === "true",
			brand: req.query.brand,
			sort: req.query.sort,
			page: req.query.page ? Number(req.query.page) : undefined,
			pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
		});

		const filter = parsed.success ? parsed.data : {
			sort: "newest" as const,
			page: 1,
			pageSize: 20,
		};

		const { skip, take, page, pageSize } = withPagination(String(filter.page), String(filter.pageSize));

		const where: any = { isActive: true };
		if (filter.category) where.category = filter.category;
		if (filter.categoryId) where.categoryId = filter.categoryId;
		if (filter.vendorId) where.vendorId = filter.vendorId;
		if (filter.brand) where.brand = filter.brand;
		if (filter.freeShipping) where.freeShipping = true;
		if (filter.isFlashSale) { where.isFlashSale = true; where.flashSaleEnd = { gte: new Date() }; }
		if (filter.isFeatured) where.isFeatured = true;
		if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
			where.price = {};
			if (filter.minPrice !== undefined) where.price.gte = filter.minPrice;
			if (filter.maxPrice !== undefined) where.price.lte = filter.maxPrice;
		}
		if (filter.minRating !== undefined) where.rating = { gte: filter.minRating };
		if (filter.search) {
			where.OR = [
				{ name: { contains: filter.search, mode: "insensitive" } },
				{ description: { contains: filter.search, mode: "insensitive" } },
				{ brand: { contains: filter.search, mode: "insensitive" } },
			];
		}

		const orderBy: any = {};
		switch (filter.sort) {
			case "price_asc": orderBy.price = "asc"; break;
			case "price_desc": orderBy.price = "desc"; break;
			case "rating": orderBy.rating = "desc"; break;
			case "popular": orderBy.sold = "desc"; break;
			case "sold": orderBy.sold = "desc"; break;
			default: orderBy.createdAt = "desc";
		}

		const [products, total] = await Promise.all([
			prisma.product.findMany({ where, skip, take, orderBy }),
			prisma.product.count({ where }),
		]);

		res.json({
			products: products.map(p => ({ ...p, images: parseJsonField(p.images), sizes: parseJsonField(p.sizes), colors: parseJsonField(p.colors), tags: parseJsonField(p.tags) })),
			total,
			page,
			pageSize,
			totalPages: Math.ceil(total / take),
		});
	} catch (err: unknown) {
		res.status(500).json({ error: (err as Error).message });
	}
});

// GET /api/products/:id
app.get("/api/products/:id", async (req, res) => {
	try {
		const product = await prisma.product.findUnique({
			where: { id: req.params.id },
			include: { vendor: true, categoryRel: true },
		});
		if (!product) return res.status(404).json({ error: "Product not found" });
		if (!product.isActive) return res.status(404).json({ error: "Product not available" });
		res.json({ ...product, images: parseJsonField(product.images), sizes: parseJsonField(product.sizes), colors: parseJsonField(product.colors), tags: parseJsonField(product.tags) });
	} catch (err: unknown) {
		res.status(500).json({ error: (err as Error).message });
	}
});

// GET /api/products/featured
app.get("/api/products/featured", async (req, res) => {
	try {
		const limit = Math.min(100, Number(req.query.limit) || 20);
		const products = await prisma.product.findMany({
			where: { isFeatured: true, isActive: true },
			take: limit,
			orderBy: { rating: "desc" },
		});
		res.json({
			products: products.map(p => ({ ...p, images: parseJsonField(p.images), sizes: parseJsonField(p.sizes), colors: parseJsonField(p.colors), tags: parseJsonField(p.tags) })),
		});
	} catch (err: unknown) {
		res.status(500).json({ error: (err as Error).message });
	}
});

// GET /api/products/flash-sale
app.get("/api/products/flash-sale", async (req, res) => {
	try {
		const now = new Date();
		const products = await prisma.product.findMany({
			where: { isFlashSale: true, isActive: true, flashSaleEnd: { gte: now } },
			take: Math.min(100, Number(req.query.limit) || 20),
			orderBy: { flashSaleEnd: "asc" },
		});
		res.json({
			products: products.map(p => ({ ...p, images: parseJsonField(p.images), sizes: parseJsonField(p.sizes), colors: parseJsonField(p.colors), tags: parseJsonField(p.tags) })),
		});
	} catch (err: unknown) {
		res.status(500).json({ error: (err as Error).message });
	}
});

// GET /api/products/trending
app.get("/api/products/trending", async (req, res) => {
	try {
		const limit = Math.min(100, Number(req.query.limit) || 20);
		const products = await prisma.product.findMany({
			where: { isActive: true },
			take: limit,
			orderBy: { sold: "desc" },
		});
		res.json({
			products: products.map(p => ({ ...p, images: parseJsonField(p.images), sizes: parseJsonField(p.sizes), colors: parseJsonField(p.colors), tags: parseJsonField(p.tags) })),
		});
	} catch (err: unknown) {
		res.status(500).json({ error: (err as Error).message });
	}
});

// GET /api/products/new-arrivals
app.get("/api/products/new-arrivals", async (req, res) => {
	try {
		const limit = Math.min(100, Number(req.query.limit) || 20);
		const products = await prisma.product.findMany({
			where: { isActive: true },
			take: limit,
			orderBy: { createdAt: "desc" },
		});
		res.json({
			products: products.map(p => ({ ...p, images: parseJsonField(p.images), sizes: parseJsonField(p.sizes), colors: parseJsonField(p.colors), tags: parseJsonField(p.tags) })),
		});
	} catch (err: unknown) {
		res.status(500).json({ error: (err as Error).message });
	}
});

// ============================================================================
// PRODUCT ROUTES (VENDOR/ADMIN)
// ============================================================================

// POST /api/products (create - vendor/admin)
app.post("/api/products", requireVendorOrAdmin as any, async (req: AuthRequest, res) => {
	try {
		const data = createProductSchema.parse(req.body);
		let vendorId: string | null = null;

		if (req.user!.role === "ADMIN") {
			vendorId = data.categoryId || null;
		} else {
			const vendor = await ensureUserVendor(req.user!.userId);
			if (!vendor) return res.status(403).json({ error: "Could not resolve vendor" });
			vendorId = vendor.id;
		}

		const product = await prisma.product.create({
			data: {
				name: data.name,
				slug: slugify(data.name),
				description: data.description,
				shortDesc: data.shortDesc,
				price: data.price,
				originalPrice: data.originalPrice,
				category: data.category,
				categoryId: data.categoryId,
				vendorId,
				images: JSON.stringify(data.images),
				mainImage: data.mainImage,
				sizes: JSON.stringify(data.sizes),
				colors: JSON.stringify(data.colors),
				brand: data.brand,
				sku: data.sku,
				stock: data.stock,
				tags: data.tags ? JSON.stringify(data.tags) : null,
				freeShipping: data.freeShipping,
				shippingFrom: data.shippingFrom,
				shippingDays: data.shippingDays,
				isFlashSale: data.isFlashSale,
				flashSaleEnd: data.flashSaleEnd ? new Date(data.flashSaleEnd) : null,
			},
		});

		// Update vendor product count
		if (vendorId) {
			await prisma.vendor.update({ where: { id: vendorId }, data: { productCount: { increment: 1 } } });
		}

		res.status(201).json({ ...product, images: parseJsonField(product.images), sizes: parseJsonField(product.sizes), colors: parseJsonField(product.colors), tags: parseJsonField(product.tags) });
	} catch (err: unknown) {
		if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
		res.status(400).json({ error: (err as Error).message });
	}
});

// PUT /api/products/:id (update - vendor/admin)
app.put("/api/products/:id", requireVendorOrAdmin as any, async (req: AuthRequest, res) => {
	try {
		const product = await prisma.product.findUnique({ where: { id: req.params.id } });
		if (!product) return res.status(404).json({ error: "Product not found" });

		if (req.user!.role !== "ADMIN" && product.vendorId) {
			const vendor = await prisma.vendor.findUnique({ where: { userId: req.user!.userId } });
			if (!vendor || vendor.id !== product.vendorId) {
				return res.status(403).json({ error: "You can only update your own products" });
			}
		}

		const data = updateProductSchema.parse(req.body);
		const updateData: any = {};

		if (data.name !== undefined) { updateData.name = data.name; updateData.slug = slugify(data.name); }
		if (data.description !== undefined) updateData.description = data.description;
		if (data.shortDesc !== undefined) updateData.shortDesc = data.shortDesc;
		if (data.price !== undefined) updateData.price = data.price;
		if (data.originalPrice !== undefined) updateData.originalPrice = data.originalPrice;
		if (data.category !== undefined) updateData.category = data.category;
		if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
		if (data.images !== undefined) updateData.images = JSON.stringify(data.images);
		if (data.mainImage !== undefined) updateData.mainImage = data.mainImage;
		if (data.sizes !== undefined) updateData.sizes = JSON.stringify(data.sizes);
		if (data.colors !== undefined) updateData.colors = JSON.stringify(data.colors);
		if (data.brand !== undefined) updateData.brand = data.brand;
		if (data.sku !== undefined) updateData.sku = data.sku;
		if (data.stock !== undefined) updateData.stock = data.stock;
		if (data.tags !== undefined) updateData.tags = JSON.stringify(data.tags);
		if (data.freeShipping !== undefined) updateData.freeShipping = data.freeShipping;
		if (data.shippingFrom !== undefined) updateData.shippingFrom = data.shippingFrom;
		if (data.shippingDays !== undefined) updateData.shippingDays = data.shippingDays;
		if (data.isFlashSale !== undefined) updateData.isFlashSale = data.isFlashSale;
		if (data.flashSaleEnd !== undefined) updateData.flashSaleEnd = data.flashSaleEnd ? new Date(data.flashSaleEnd) : null;

		// Additional fields not in the Zod schema
		const { isFeatured, isActive } = req.body;
		if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
		if (isActive !== undefined) updateData.isActive = isActive;

		const updated = await prisma.product.update({ where: { id: req.params.id }, data: updateData });
		res.json({ ...updated, images: parseJsonField(updated.images), sizes: parseJsonField(updated.sizes), colors: parseJsonField(updated.colors), tags: parseJsonField(updated.tags) });
	} catch (err: unknown) {
		if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
		res.status(400).json({ error: (err as Error).message });
	}
});

// DELETE /api/products/:id (delete - vendor/admin)
app.delete("/api/products/:id", requireVendorOrAdmin as any, async (req: AuthRequest, res) => {
	try {
		const product = await prisma.product.findUnique({ where: { id: req.params.id } });
		if (!product) return res.status(404).json({ error: "Product not found" });

		if (req.user!.role !== "ADMIN" && product.vendorId) {
			const vendor = await prisma.vendor.findUnique({ where: { userId: req.user!.userId } });
			if (!vendor || vendor.id !== product.vendorId) {
				return res.status(403).json({ error: "You can only delete your own products" });
			}
		}

		await prisma.product.delete({ where: { id: req.params.id } });

		if (product.vendorId) {
			await prisma.vendor.update({ where: { id: product.vendorId }, data: { productCount: { decrement: 1 } } });
		}

		res.json({ success: true });
	} catch (err: unknown) {
		res.status(500).json({ error: (err as Error).message });
	}
});

// GET /api/admin/products (admin: all products with filters)
app.get("/api/admin/products", requireAdmin as any, async (req: AuthRequest, res) => {
	try {
		const { page, pageSize, skip, take } = withPagination(req.query.page as string, req.query.pageSize as string);
		const where: any = {};
		if (req.query.category) where.category = req.query.category;
		if (req.query.search) where.OR = [{ name: { contains: req.query.search as string, mode: "insensitive" } }, { description: { contains: req.query.search as string, mode: "insensitive" } }];
		if (req.query.isActive === "true") where.isActive = true;
		else if (req.query.isActive === "false") where.isActive = false;
		if (req.query.vendorId) where.vendorId = req.query.vendorId;

		const [products, total] = await Promise.all([
			prisma.product.findMany({ where, skip, take, orderBy: { updatedAt: "desc" }, include: { vendor: { select: { storeName: true, storeSlug: true } } } }),
			prisma.product.count({ where }),
		]);

		res.json({
			products: products.map(p => ({ ...p, images: parseJsonField(p.images), sizes: parseJsonField(p.sizes), colors: parseJsonField(p.colors), tags: parseJsonField(p.tags) })),
			total,
			page,
			pageSize,
			totalPages: Math.ceil(total / take),
		});
	} catch (err: unknown) {
		res.status(500).json({ error: (err as Error).message });
	}
});

// ============================================================================
// ORDER ROUTES
// ============================================================================

// POST /api/orders (create order - requires auth)
app.post("/api/orders", requireAuth as any, async (req: AuthRequest, res) => {
	try {
		const data = createOrderSchema.parse(req.body);

		let shippingAddressJson = "{}";
		if (data.shippingAddress) {
			shippingAddressJson = JSON.stringify(data.shippingAddress);
		} else if (data.shippingAddressId) {
			const addr = await prisma.shippingAddress.findUnique({ where: { id: data.shippingAddressId } });
			if (!addr) return res.status(404).json({ error: "Address not found" });
			shippingAddressJson = JSON.stringify({ name: addr.name, phone: addr.phone, address: addr.address, city: addr.city, province: addr.province, zip: addr.zip });
		} else {
			const defaultAddr = await prisma.shippingAddress.findFirst({ where: { userId: req.user!.userId, isDefault: true } });
			if (defaultAddr) {
				shippingAddressJson = JSON.stringify({ name: defaultAddr.name, phone: defaultAddr.phone, address: defaultAddr.address, city: defaultAddr.city, province: defaultAddr.province, zip: defaultAddr.zip });
			} else {
				return res.status(400).json({ error: "Shipping address required" });
			}
		}

		// Calculate totals
		let subtotal = 0;
		const orderItems = [];
		for (const item of data.items) {
			const product = await prisma.product.findUnique({ where: { id: item.productId } });
			if (!product) return res.status(404).json({ error: `Product ${item.productId} not found` });
			if (!product.isActive) return res.status(400).json({ error: `Product ${product.name} is not available` });
			if (product.stock < item.quantity) return res.status(400).json({ error: `Insufficient stock for ${product.name}` });

			const itemSubtotal = product.price * item.quantity;
			subtotal += itemSubtotal;
			orderItems.push({
				productId: item.productId,
				name: product.name,
				image: product.mainImage,
				price: product.price,
				quantity: item.quantity,
				size: item.size,
				color: item.color,
				subtotal: itemSubtotal,
			});
		}

		// Apply coupon
		let discount = 0;
		if (data.couponCode) {
			const coupon = await prisma.storeCoupon.findFirst({
				where: { code: data.couponCode.toUpperCase(), isActive: true, validFrom: { lte: new Date() }, validUntil: { gte: new Date() } },
			});
			if (coupon) {
				if (subtotal >= coupon.minOrder) {
					if (coupon.discountType === "PERCENTAGE") {
						discount = Math.min(subtotal * (coupon.discountValue / 100), coupon.maxDiscount || subtotal);
					} else {
						discount = Math.min(coupon.discountValue, subtotal);
					}
					await prisma.storeCoupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } });
				}
			}
		}

		const shippingCost = 0;
		const tax = 0;
		const total = subtotal - discount + shippingCost + tax;

		// Determine vendorId for the order (use first item's product vendor)
		const firstProduct = await prisma.product.findUnique({ where: { id: data.items[0].productId } });
		const vendorId = firstProduct?.vendorId || null;

		const order = await prisma.order.create({
			data: {
				userId: req.user!.userId,
				vendorId,
				orderNumber: generateOrderNumber(),
				status: "PENDING",
				subtotal,
				shippingCost,
				tax,
				discount,
				total,
				paymentMethod: data.paymentMethod,
				shippingAddress: shippingAddressJson,
				notes: data.notes,
				items: { create: orderItems },
			},
			include: { items: true },
		});

		// Update product stock and sold count
		for (const item of data.items) {
			await prisma.product.update({
				where: { id: item.productId },
				data: { stock: { decrement: item.quantity }, sold: { increment: item.quantity } },
			});
		}

		res.status(201).json(order);
	} catch (err: unknown) {
		if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
		res.status(400).json({ error: (err as Error).message });
	}
});

// GET /api/orders (user's orders - requires auth)
app.get("/api/orders", requireAuth as any, async (req: AuthRequest, res) => {
	try {
		const { page, pageSize, skip, take } = withPagination(req.query.page as string, req.query.pageSize as string);
		const where: any = { userId: req.user!.userId };
		if (req.query.status) where.status = req.query.status;

		const [orders, total] = await Promise.all([
			prisma.order.findMany({ where, skip, take, orderBy: { createdAt: "desc" }, include: { items: { select: { id: true, name: true, image: true, price: true, quantity: true, subtotal: true } } } }),
			prisma.order.count({ where }),
		]);

		res.json({ orders, total, page, pageSize, totalPages: Math.ceil(total / take) });
	} catch (err: unknown) {
		res.status(500).json({ error: (err as Error).message });
	}
});

// GET /api/orders/:id (order detail - requires auth)
app.get("/api/orders/:id", requireAuth as any, async (req: AuthRequest, res) => {
	try {
		const order = await prisma.order.findUnique({
			where: { id: req.params.id },
			include: { items: true, vendor: { select: { storeName: true, storeSlug: true } } },
		});
		if (!order) return res.status(404).json({ error: "Order not found" });
		if (order.userId !== req.user!.userId && req.user!.role !== "ADMIN") {
			return res.status(403).json({ error: "You can only view your own orders" });
		}
		res.json(order);
	} catch (err: unknown) {
		res.status(500).json({ error: (err as Error).message });
	}
});

// PUT /api/orders/:id/status (update status - vendor/admin)
app.put("/api/orders/:id/status", requireVendorOrAdmin as any, async (req: AuthRequest, res) => {
	try {
		const order = await prisma.order.findUnique({ where: { id: req.params.id } });
		if (!order) return res.status(404).json({ error: "Order not found" });

		if (req.user!.role !== "ADMIN" && order.vendorId) {
			const vendor = await prisma.vendor.findUnique({ where: { userId: req.user!.userId } });
			if (!vendor || vendor.id !== order.vendorId) {
				return res.status(403).json({ error: "You can only update your own orders" });
			}
		}

		const data = updateOrderStatusSchema.parse(req.body);
		const updated = await prisma.order.update({
			where: { id: req.params.id },
			data: { status: data.status, trackingNumber: data.trackingNumber, trackingUrl: data.trackingUrl },
			include: { items: true },
		});

		// Update vendor sales count on delivery
		if (data.status === "DELIVERED" && order.vendorId) {
			await prisma.vendor.update({ where: { id: order.vendorId }, data: { totalSales: { increment: 1 } } });
		}

		res.json(updated);
	} catch (err: unknown) {
		if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
		res.status(400).json({ error: (err as Error).message });
	}
});

// GET /api/vendors/:id/orders (vendor's orders)
app.get("/api/vendors/:id/orders", requireVendorOrAdmin as any, async (req: AuthRequest, res) => {
	try {
		const vendor = await prisma.vendor.findUnique({ where: { id: req.params.id } });
		if (!vendor) return res.status(404).json({ error: "Vendor not found" });
		if (req.user!.role !== "ADMIN" && vendor.userId !== req.user!.userId) {
			return res.status(403).json({ error: "You can only view your own orders" });
		}

		const { page, pageSize, skip, take } = withPagination(req.query.page as string, req.query.pageSize as string);
		const where: any = { vendorId: req.params.id };
		if (req.query.status) where.status = req.query.status;

		const [orders, total] = await Promise.all([
			prisma.order.findMany({ where, skip, take, orderBy: { createdAt: "desc" }, include: { items: { select: { id: true, name: true, image: true, price: true, quantity: true, subtotal: true } }, user: { select: { id: true, name: true, email: true } } } }),
			prisma.order.count({ where }),
		]);

		res.json({ orders, total, page, pageSize, totalPages: Math.ceil(total / take) });
	} catch (err: unknown) {
		res.status(500).json({ error: (err as Error).message });
	}
});

// ============================================================================
// REVIEW ROUTES
// ============================================================================

// POST /api/reviews (create - requires auth)
app.post("/api/reviews", requireAuth as any, async (req: AuthRequest, res) => {
	try {
		const data = createReviewSchema.parse(req.body);

		// Check if user already reviewed this product
		const existing = await prisma.review.findFirst({ where: { userId: req.user!.userId, productId: data.productId } });
		if (existing) return res.status(409).json({ error: "You already reviewed this product" });

		// Check if user bought this product
		const purchased = await prisma.order.findFirst({
			where: { userId: req.user!.userId, items: { some: { productId: data.productId } }, status: "DELIVERED" },
		});

		const product = await prisma.product.findUnique({ where: { id: data.productId } });
		if (!product) return res.status(404).json({ error: "Product not found" });

		const review = await prisma.review.create({
			data: {
				userId: req.user!.userId,
				productId: data.productId,
				vendorId: product.vendorId,
				rating: data.rating,
				title: data.title,
				comment: data.comment,
				images: data.images ? JSON.stringify(data.images) : null,
				isVerified: !!purchased,
			},
		});

		// Update product rating
		const avgRating = await prisma.review.aggregate({ where: { productId: data.productId }, _avg: { rating: true }, _count: true });
		await prisma.product.update({
			where: { id: data.productId },
			data: { rating: Number(avgRating._avg.rating?.toFixed(1)) || 0, reviewCount: avgRating._count },
		});

		res.status(201).json(review);
	} catch (err: unknown) {
		if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
		res.status(400).json({ error: (err as Error).message });
	}
});

// GET /api/reviews/product/:productId
app.get("/api/reviews/product/:productId", async (req, res) => {
	try {
		const { page, pageSize, skip, take } = withPagination(req.query.page as string, req.query.pageSize as string);
		const rating = req.query.rating ? Number(req.query.rating) : undefined;

		const where: any = { productId: req.params.productId };
		if (rating) where.rating = rating;

		const [reviews, total] = await Promise.all([
			prisma.review.findMany({
				where, skip, take, orderBy: { createdAt: "desc" },
				include: { user: { select: { id: true, name: true, avatar: true } } },
			}),
			prisma.review.count({ where }),
		]);

		const parsedReviews = reviews.map(r => ({ ...r, images: parseJsonField(r.images) }));

		res.json({ reviews: parsedReviews, total, page, pageSize, totalPages: Math.ceil(total / take) });
	} catch (err: unknown) {
		res.status(500).json({ error: (err as Error).message });
	}
});

// GET /api/reviews/vendor/:vendorId
app.get("/api/reviews/vendor/:vendorId", async (req, res) => {
	try {
		const { page, pageSize, skip, take } = withPagination(req.query.page as string, req.query.pageSize as string);
		const [reviews, total, avgRating] = await Promise.all([
			prisma.review.findMany({
				where: { vendorId: req.params.vendorId },
				skip, take, orderBy: { createdAt: "desc" },
				include: { user: { select: { id: true, name: true, avatar: true } }, product: { select: { id: true, name: true, mainImage: true } } },
			}),
			prisma.review.count({ where: { vendorId: req.params.vendorId } }),
			prisma.review.aggregate({ where: { vendorId: req.params.vendorId }, _avg: { rating: true } }),
		]);

		res.json({
			reviews: reviews.map(r => ({ ...r, images: parseJsonField(r.images) })),
			total,
			page,
			pageSize,
			totalPages: Math.ceil(total / take),
			avgRating: Number(avgRating._avg.rating?.toFixed(1)) || 0,
		});
	} catch (err: unknown) {
		res.status(500).json({ error: (err as Error).message });
	}
});

// PUT /api/reviews/:id/helpful (mark helpful)
app.put("/api/reviews/:id/helpful", async (req, res) => {
	try {
		const review = await prisma.review.findUnique({ where: { id: req.params.id } });
		if (!review) return res.status(404).json({ error: "Review not found" });

		const updated = await prisma.review.update({
			where: { id: req.params.id },
			data: { helpful: { increment: 1 } },
		});
		res.json({ helpful: updated.helpful });
	} catch (err: unknown) {
		res.status(500).json({ error: (err as Error).message });
	}
});

// DELETE /api/reviews/:id (delete - author/admin)
app.delete("/api/reviews/:id", requireAuth as any, async (req: AuthRequest, res) => {
	try {
		const review = await prisma.review.findUnique({ where: { id: req.params.id } });
		if (!review) return res.status(404).json({ error: "Review not found" });
		if (review.userId !== req.user!.userId && req.user!.role !== "ADMIN") {
			return res.status(403).json({ error: "You can only delete your own reviews" });
		}

		await prisma.review.delete({ where: { id: req.params.id } });

		// Recalculate product rating
		const avgRating = await prisma.review.aggregate({ where: { productId: review.productId }, _avg: { rating: true }, _count: true });
		await prisma.product.update({
			where: { id: review.productId },
			data: { rating: Number(avgRating._avg.rating?.toFixed(1)) || 0, reviewCount: avgRating._count },
		});

		res.json({ success: true });
	} catch (err: unknown) {
		res.status(500).json({ error: (err as Error).message });
	}
});

// ============================================================================
// WISHLIST ROUTES
// ============================================================================

// POST /api/wishlist/add (requires auth)
app.post("/api/wishlist/add", requireAuth as any, async (req: AuthRequest, res) => {
	try {
		const { productId } = req.body;
		if (!productId) return res.status(400).json({ error: "productId is required" });

		const product = await prisma.product.findUnique({ where: { id: productId } });
		if (!product) return res.status(404).json({ error: "Product not found" });

		const existing = await prisma.wishlist.findUnique({
			where: { userId_productId: { userId: req.user!.userId, productId } },
		});
		if (existing) return res.status(409).json({ error: "Product already in wishlist" });

		const item = await prisma.wishlist.create({
			data: { userId: req.user!.userId, productId },
			include: { product: true },
		});
		res.status(201).json(item);
	} catch (err: unknown) {
		res.status(400).json({ error: (err as Error).message });
	}
});

// DELETE /api/wishlist/:productId (requires auth)
app.delete("/api/wishlist/:productId", requireAuth as any, async (req: AuthRequest, res) => {
	try {
		const existing = await prisma.wishlist.findUnique({
			where: { userId_productId: { userId: req.user!.userId, productId: req.params.productId } },
		});
		if (!existing) return res.status(404).json({ error: "Item not found in wishlist" });

		await prisma.wishlist.delete({ where: { userId_productId: { userId: req.user!.userId, productId: req.params.productId } } });
		res.json({ success: true });
	} catch (err: unknown) {
		res.status(500).json({ error: (err as Error).message });
	}
});

// GET /api/wishlist (user's wishlist - requires auth)
app.get("/api/wishlist", requireAuth as any, async (req: AuthRequest, res) => {
	try {
		const { page, pageSize, skip, take } = withPagination(req.query.page as string, req.query.pageSize as string);
		const [items, total] = await Promise.all([
			prisma.wishlist.findMany({
				where: { userId: req.user!.userId },
				skip, take, orderBy: { createdAt: "desc" },
				include: { product: true },
			}),
			prisma.wishlist.count({ where: { userId: req.user!.userId } }),
		]);

		res.json({ items, total, page, pageSize, totalPages: Math.ceil(total / take) });
	} catch (err: unknown) {
		res.status(500).json({ error: (err as Error).message });
	}
});

// ============================================================================
// ADDRESS ROUTES
// ============================================================================

// POST /api/addresses (create - requires auth)
app.post("/api/addresses", requireAuth as any, async (req: AuthRequest, res) => {
	try {
		const data = createAddressSchema.parse(req.body);

		// If setting as default, unset other defaults
		if (data.isDefault) {
			await prisma.shippingAddress.updateMany({ where: { userId: req.user!.userId, isDefault: true }, data: { isDefault: false } });
		}

		const address = await prisma.shippingAddress.create({
			data: { ...data, userId: req.user!.userId },
		});
		res.status(201).json(address);
	} catch (err: unknown) {
		if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
		res.status(400).json({ error: (err as Error).message });
	}
});

// GET /api/addresses (user's addresses)
app.get("/api/addresses", requireAuth as any, async (req: AuthRequest, res) => {
	try {
		const addresses = await prisma.shippingAddress.findMany({
			where: { userId: req.user!.userId },
			orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
		});
		res.json({ addresses });
	} catch (err: unknown) {
		res.status(500).json({ error: (err as Error).message });
	}
});

// PUT /api/addresses/:id (update)
app.put("/api/addresses/:id", requireAuth as any, async (req: AuthRequest, res) => {
	try {
		const address = await prisma.shippingAddress.findUnique({ where: { id: req.params.id } });
		if (!address) return res.status(404).json({ error: "Address not found" });
		if (address.userId !== req.user!.userId) return res.status(403).json({ error: "You can only update your own addresses" });

		const data = updateAddressSchema.parse(req.body);

		// If setting as default, unset others
		if (data.isDefault) {
			await prisma.shippingAddress.updateMany({ where: { userId: req.user!.userId, isDefault: true }, data: { isDefault: false } });
		}

		const updated = await prisma.shippingAddress.update({ where: { id: req.params.id }, data });
		res.json(updated);
	} catch (err: unknown) {
		if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
		res.status(400).json({ error: (err as Error).message });
	}
});

// DELETE /api/addresses/:id
app.delete("/api/addresses/:id", requireAuth as any, async (req: AuthRequest, res) => {
	try {
		const address = await prisma.shippingAddress.findUnique({ where: { id: req.params.id } });
		if (!address) return res.status(404).json({ error: "Address not found" });
		if (address.userId !== req.user!.userId) return res.status(403).json({ error: "You can only delete your own addresses" });

		await prisma.shippingAddress.delete({ where: { id: req.params.id } });
		res.json({ success: true });
	} catch (err: unknown) {
		res.status(500).json({ error: (err as Error).message });
	}
});

// PUT /api/addresses/:id/default (set default)
app.put("/api/addresses/:id/default", requireAuth as any, async (req: AuthRequest, res) => {
	try {
		const address = await prisma.shippingAddress.findUnique({ where: { id: req.params.id } });
		if (!address) return res.status(404).json({ error: "Address not found" });
		if (address.userId !== req.user!.userId) return res.status(403).json({ error: "You can only modify your own addresses" });

		await prisma.$transaction([
			prisma.shippingAddress.updateMany({ where: { userId: req.user!.userId, isDefault: true }, data: { isDefault: false } }),
			prisma.shippingAddress.update({ where: { id: req.params.id }, data: { isDefault: true } }),
		]);

		res.json({ success: true });
	} catch (err: unknown) {
		res.status(500).json({ error: (err as Error).message });
	}
});

// ============================================================================
// COUPON ROUTES
// ============================================================================

// POST /api/vendors/:id/coupons (create - vendor)
app.post("/api/vendors/:id/coupons", requireVendorOrAdmin as any, async (req: AuthRequest, res) => {
	try {
		const vendor = await prisma.vendor.findUnique({ where: { id: req.params.id } });
		if (!vendor) return res.status(404).json({ error: "Vendor not found" });
		if (req.user!.role !== "ADMIN" && vendor.userId !== req.user!.userId) {
			return res.status(403).json({ error: "You can only create coupons for your own store" });
		}

		const data = createCouponSchema.parse(req.body);
		const existing = await prisma.storeCoupon.findUnique({ where: { code: data.code } });
		if (existing) return res.status(409).json({ error: "Coupon code already exists" });

		const coupon = await prisma.storeCoupon.create({
			data: { ...data, vendorId: req.params.id },
		});
		res.status(201).json(coupon);
	} catch (err: unknown) {
		if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
		res.status(400).json({ error: (err as Error).message });
	}
});

// GET /api/vendors/:id/coupons (vendor's coupons)
app.get("/api/vendors/:id/coupons", requireVendorOrAdmin as any, async (req: AuthRequest, res) => {
	try {
		const vendor = await prisma.vendor.findUnique({ where: { id: req.params.id } });
		if (!vendor) return res.status(404).json({ error: "Vendor not found" });
		if (req.user!.role !== "ADMIN" && vendor.userId !== req.user!.userId) {
			return res.status(403).json({ error: "You can only view your own coupons" });
		}

		const coupons = await prisma.storeCoupon.findMany({
			where: { vendorId: req.params.id },
			orderBy: { validUntil: "desc" },
		});
		res.json({ coupons });
	} catch (err: unknown) {
		res.status(500).json({ error: (err as Error).message });
	}
});

// POST /api/coupons/apply (validate + calculate discount)
app.post("/api/coupons/apply", async (req, res) => {
	try {
		const data = applyCouponSchema.parse(req.body);
		const coupon = await prisma.storeCoupon.findFirst({
			where: { code: data.code.toUpperCase(), isActive: true, validFrom: { lte: new Date() }, validUntil: { gte: new Date() } },
			include: { vendor: { select: { storeName: true } } },
		});

		if (!coupon) return res.status(404).json({ error: "Coupon not found or expired" });
		if (data.orderTotal < coupon.minOrder) {
			return res.status(400).json({ error: `Minimum order amount is ${coupon.minOrder}`, minOrder: coupon.minOrder });
		}
		if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
			return res.status(400).json({ error: "Coupon usage limit reached" });
		}

		let discount = 0;
		if (coupon.discountType === "PERCENTAGE") {
			discount = Math.min(data.orderTotal * (coupon.discountValue / 100), coupon.maxDiscount || data.orderTotal);
		} else {
			discount = Math.min(coupon.discountValue, data.orderTotal);
		}

		res.json({
			code: coupon.code,
			description: coupon.description,
			discountType: coupon.discountType,
			discountValue: coupon.discountValue,
			discount: Number(discount.toFixed(2)),
			total: Number((data.orderTotal - discount).toFixed(2)),
			vendor: coupon.vendor.storeName,
		});
	} catch (err: unknown) {
		if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
		res.status(400).json({ error: (err as Error).message });
	}
});

// GET /api/coupons/:code
app.get("/api/coupons/:code", async (req, res) => {
	try {
		const coupon = await prisma.storeCoupon.findUnique({
			where: { code: req.params.code.toUpperCase() },
			include: { vendor: { select: { storeName: true, storeSlug: true } } },
		});
		if (!coupon) return res.status(404).json({ error: "Coupon not found" });
		res.json(coupon);
	} catch (err: unknown) {
		res.status(500).json({ error: (err as Error).message });
	}
});

// ============================================================================
// MESSAGE ROUTES
// ============================================================================

// POST /api/messages (send - requires auth)
app.post("/api/messages", requireAuth as any, async (req: AuthRequest, res) => {
	try {
		const data = sendMessageSchema.parse(req.body);
		if (data.receiverId === req.user!.userId) return res.status(400).json({ error: "Cannot message yourself" });

		const receiver = await prisma.user.findUnique({ where: { id: data.receiverId } });
		if (!receiver) return res.status(404).json({ error: "User not found" });

		const message = await prisma.message.create({
			data: { senderId: req.user!.userId, receiverId: data.receiverId, content: data.content },
		});
		res.status(201).json(message);
	} catch (err: unknown) {
		if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
		res.status(400).json({ error: (err as Error).message });
	}
});

// GET /api/messages/:otherUserId (conversation with user)
app.get("/api/messages/:otherUserId", requireAuth as any, async (req: AuthRequest, res) => {
	try {
		const { page, pageSize, skip, take } = withPagination(req.query.page as string, req.query.pageSize as string);
		const otherUserId = req.params.otherUserId;

		const messages = await prisma.message.findMany({
			where: {
				AND: [
					{ OR: [{ senderId: req.user!.userId, receiverId: otherUserId }, { senderId: otherUserId, receiverId: req.user!.userId }] },
				],
			},
			skip,
			take,
			orderBy: { createdAt: "desc" },
		});

		res.json({ messages: messages.reverse(), page, pageSize, totalPages: Math.ceil(1000 / take) });
	} catch (err: unknown) {
		res.status(500).json({ error: (err as Error).message });
	}
});

// GET /api/messages/inbox (all conversations list)
app.get("/api/messages/inbox", requireAuth as any, async (req: AuthRequest, res) => {
	try {
		// Get all messages where user is sender or receiver
		const messages = await prisma.message.findMany({
			where: { OR: [{ senderId: req.user!.userId }, { receiverId: req.user!.userId }] },
			orderBy: { createdAt: "desc" },
		});

		// Group by other user
		const conversations = new Map<string, { user: { id: string; name: string | null; avatar: string | null }; lastMessage: any; unreadCount: number }>();

		for (const msg of messages) {
			const otherUserId = msg.senderId === req.user!.userId ? msg.receiverId : msg.senderId;
			if (!conversations.has(otherUserId)) {
				const user = await prisma.user.findUnique({ where: { id: otherUserId }, select: { id: true, name: true, avatar: true } });
				conversations.set(otherUserId, { user: user as any, lastMessage: msg, unreadCount: 0 });
			}
			if (msg.receiverId === req.user!.userId && !msg.isRead) {
				conversations.get(otherUserId)!.unreadCount++;
			}
		}

		res.json({ conversations: Array.from(conversations.values()) });
	} catch (err: unknown) {
		res.status(500).json({ error: (err as Error).message });
	}
});

// PUT /api/messages/:id/read (mark as read)
app.put("/api/messages/:id/read", requireAuth as any, async (req: AuthRequest, res) => {
	try {
		const message = await prisma.message.findUnique({ where: { id: req.params.id } });
		if (!message) return res.status(404).json({ error: "Message not found" });
		if (message.receiverId !== req.user!.userId) return res.status(403).json({ error: "You can only mark your own messages as read" });

		const updated = await prisma.message.update({
			where: { id: req.params.id },
			data: { isRead: true },
		});
		res.json(updated);
	} catch (err: unknown) {
		res.status(500).json({ error: (err as Error).message });
	}
});

// ============================================================================
// SEARCH ROUTES
// ============================================================================

// GET /api/search (full-text search across products, vendors, categories)
app.get("/api/search", async (req, res) => {
	try {
		const parsed = searchSchema.safeParse({
			q: req.query.q,
			category: req.query.category,
			minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
			maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
			minRating: req.query.minRating ? Number(req.query.minRating) : undefined,
			freeShipping: req.query.freeShipping === "true",
			sort: req.query.sort,
			page: req.query.page ? Number(req.query.page) : undefined,
			pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
		});

		if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });

		const { q, category, minPrice, maxPrice, minRating, freeShipping, sort, page, pageSize } = parsed.data;
		const { skip, take } = withPagination(String(page), String(pageSize));

		const productWhere: any = { isActive: true };
		if (q) {
			productWhere.OR = [
				{ name: { contains: q, mode: "insensitive" } },
				{ description: { contains: q, mode: "insensitive" } },
				{ brand: { contains: q, mode: "insensitive" } },
				{ tags: { contains: q } },
			];
		}
		if (category) productWhere.category = category;
		if (minPrice !== undefined || maxPrice !== undefined) {
			productWhere.price = {};
			if (minPrice !== undefined) productWhere.price.gte = minPrice;
			if (maxPrice !== undefined) productWhere.price.lte = maxPrice;
		}
		if (minRating !== undefined) productWhere.rating = { gte: minRating };
		if (freeShipping) productWhere.freeShipping = true;

		const productOrderBy: any = {};
		switch (sort) {
			case "price_asc": productOrderBy.price = "asc"; break;
			case "price_desc": productOrderBy.price = "desc"; break;
			case "rating": productOrderBy.rating = "desc"; break;
			case "popular": productOrderBy.sold = "desc"; break;
			case "newest": productOrderBy.createdAt = "desc"; break;
			default: productOrderBy.rating = "desc";
		}

		const [products, vendors, categories] = await Promise.all([
			prisma.product.findMany({ where: productWhere, skip, take, orderBy: productOrderBy, include: { vendor: { select: { storeName: true, storeSlug: true } } } }),
			q ? prisma.vendor.findMany({ where: { OR: [{ storeName: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] }, take: 5 }) : Promise.resolve([]),
			q ? prisma.category.findMany({ where: { OR: [{ name: { contains: q, mode: "insensitive" } }], isActive: true }, take: 5 }) : Promise.resolve([]),
		]);

		res.json({
			products: products.map(p => ({ ...p, images: parseJsonField(p.images), sizes: parseJsonField(p.sizes), colors: parseJsonField(p.colors), tags: parseJsonField(p.tags) })),
			vendors,
			categories,
			totalProducts: products.length,
			totalVendors: vendors.length,
			totalCategories: categories.length,
		});
	} catch (err: unknown) {
		res.status(500).json({ error: (err as Error).message });
	}
});

// GET /api/search/suggestions (autocomplete suggestions)
app.get("/api/search/suggestions", async (req, res) => {
	try {
		const q = req.query.q as string;
		if (!q || q.length < 2) return res.json({ suggestions: [] });

		const [products, vendors, categories] = await Promise.all([
			prisma.product.findMany({
				where: { isActive: true, name: { contains: q, mode: "insensitive" } },
				take: 5,
				select: { id: true, name: true, mainImage: true, price: true },
			}),
			prisma.vendor.findMany({
				where: { storeName: { contains: q, mode: "insensitive" } },
				take: 3,
				select: { id: true, storeName: true, storeSlug: true, logo: true },
			}),
			prisma.category.findMany({
				where: { name: { contains: q, mode: "insensitive" }, isActive: true },
				take: 3,
				select: { id: true, name: true, slug: true, icon: true },
			}),
		]);

		res.json({
			suggestions: {
				products,
				vendors,
				categories,
			},
		});
	} catch (err: unknown) {
		res.status(500).json({ error: (err as Error).message });
	}
});

// ============================================================================
// STATS / ANALYTICS ROUTES
// ============================================================================

// GET /api/stats/platform (platform-wide stats)
app.get("/api/stats/platform", requireAdmin as any, async (req: AuthRequest, res) => {
	try {
		const [totalUsers, totalVendors, totalProducts, totalOrders, totalReviews] = await Promise.all([
			prisma.user.count(),
			prisma.vendor.count(),
			prisma.product.count({ where: { isActive: true } }),
			prisma.order.count(),
			prisma.review.count(),
		]);

		const [revenue, avgOrderValue] = await Promise.all([
			prisma.order.aggregate({ where: { status: { not: "CANCELLED" } }, _sum: { total: true } }),
			prisma.order.aggregate({ where: { status: { not: "CANCELLED" } }, _avg: { total: true } }),
		]);

		const topProducts = await prisma.product.findMany({
			where: { isActive: true },
			take: 10,
			orderBy: { sold: "desc" },
			select: { id: true, name: true, sold: true, rating: true, price: true, mainImage: true },
		});

		const topVendors = await prisma.vendor.findMany({
			take: 10,
			orderBy: { totalSales: "desc" },
			select: { id: true, storeName: true, storeSlug: true, logo: true, totalSales: true, rating: true, followerCount: true, productCount: true },
		});

		const categoryBreakdown = await prisma.category.findMany({
			where: { isActive: true },
			select: { id: true, name: true, slug: true, productCount: true },
			orderBy: { productCount: "desc" },
		});

		const recentOrders = await prisma.order.findMany({
			take: 10,
			orderBy: { createdAt: "desc" },
			select: { id: true, orderNumber: true, status: true, total: true, createdAt: true, user: { select: { name: true } } },
		});

		res.json({
			totalUsers,
			totalVendors,
			totalProducts,
			totalOrders,
			totalReviews,
			revenue: revenue._sum.total || 0,
			avgOrderValue: Number(avgOrderValue._avg.total?.toFixed(2)) || 0,
			topProducts,
			topVendors,
			categoryBreakdown,
			recentOrders,
		});
	} catch (err: unknown) {
		res.status(500).json({ error: (err as Error).message });
	}
});

// GET /api/vendors/:id/analytics (vendor analytics)
app.get("/api/vendors/:id/analytics", requireVendorOrAdmin as any, async (req: AuthRequest, res) => {
	try {
		const vendor = await prisma.vendor.findUnique({ where: { id: req.params.id } });
		if (!vendor) return res.status(404).json({ error: "Vendor not found" });
		if (req.user!.role !== "ADMIN" && vendor.userId !== req.user!.userId) {
			return res.status(403).json({ error: "You can only view your own analytics" });
		}

		const [totalProducts, totalOrders, totalReviews, avgRating] = await Promise.all([
			prisma.product.count({ where: { vendorId: req.params.id } }),
			prisma.order.count({ where: { vendorId: req.params.id } }),
			prisma.review.count({ where: { vendorId: req.params.id } }),
			prisma.review.aggregate({ where: { vendorId: req.params.id }, _avg: { rating: true } }),
		]);

		// Revenue from orders
		const revenue = await prisma.order.aggregate({
			where: { vendorId: req.params.id, status: { not: "CANCELLED" } },
			_sum: { total: true },
		});

		// Order status breakdown
		const ordersByStatus = await prisma.order.groupBy({
			by: ["status"],
			where: { vendorId: req.params.id },
			_count: { id: true },
		});

		// Top products by sold count
		const topProducts = await prisma.product.findMany({
			where: { vendorId: req.params.id, isActive: true },
			take: 10,
			orderBy: { sold: "desc" },
			select: { id: true, name: true, sold: true, rating: true, reviewCount: true, price: true, stock: true },
		});

		// Recent orders
		const recentOrders = await prisma.order.findMany({
			where: { vendorId: req.params.id },
			take: 10,
			orderBy: { createdAt: "desc" },
			select: { id: true, orderNumber: true, status: true, total: true, createdAt: true, user: { select: { name: true } } },
		});

		// Monthly revenue (last 6 months)
		const sixMonthsAgo = new Date();
		sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
		const monthlyRevenue = await prisma.order.findMany({
			where: { vendorId: req.params.id, status: { not: "CANCELLED" }, createdAt: { gte: sixMonthsAgo } },
			select: { total: true, createdAt: true },
			orderBy: { createdAt: "asc" },
		});

		const monthlyTotals: Record<string, number> = {};
		monthlyRevenue.forEach(o => {
			const key = `${o.createdAt.getFullYear()}-${String(o.createdAt.getMonth() + 1).padStart(2, "0")}`;
			monthlyTotals[key] = (monthlyTotals[key] || 0) + o.total;
		});

		res.json({
			vendor: { storeName: vendor.storeName, storeSlug: vendor.storeSlug, logo: vendor.logo },
			stats: {
				totalProducts,
				totalOrders,
				totalReviews,
				avgRating: Number(avgRating._avg.rating?.toFixed(1)) || 0,
				totalRevenue: revenue._sum.total || 0,
				followerCount: vendor.followerCount,
			},
			ordersByStatus: ordersByStatus.map(o => ({ status: o.status, count: o._count.id })),
			topProducts,
			recentOrders,
			monthlyRevenue: monthlyTotals,
		});
	} catch (err: unknown) {
		res.status(500).json({ error: (err as Error).message });
	}
});

// ============================================================================
// LEGACY ROUTES (backward compatibility)
// ============================================================================

// GET /api/account (legacy protected user route)
app.get("/api/account", requireAuth as any, async (req: AuthRequest, res) => {
	try {
		const user = await prisma.user.findUnique({
			where: { id: req.user!.userId },
			select: { id: true, email: true, name: true, role: true, phone: true, avatar: true, createdAt: true },
		});
		if (!user) return res.status(404).json({ error: "User not found" });
		res.json(user);
	} catch (err: unknown) {
		res.status(500).json({ error: (err as Error).message });
	}
});

// GET /api/admin/stats (legacy admin dashboard stats)
app.get("/api/admin/stats", requireAdmin as any, async (req: AuthRequest, res) => {
	try {
		const totalProducts = await prisma.product.count();
		const activeProducts = await prisma.product.count({ where: { isActive: true } });
		const categoryCounts = await prisma.product.groupBy({ by: ["category"], _count: { id: true } });
		const recentProducts = await prisma.product.findMany({ take: 10, orderBy: { updatedAt: "desc" } });
		res.json({
			totalProducts,
			activeProducts,
			categories: categoryCounts.map(c => ({ category: c.category, count: c._count.id })),
			recent: recentProducts.map(p => ({ id: p.id, name: p.name, category: p.category, updatedAt: p.updatedAt })),
		});
	} catch (err: unknown) {
		res.status(500).json({ error: (err as Error).message });
	}
});

// ============================================================================
// SERVER START
// ============================================================================

app.listen(port, () => {
	console.log(`NEPAL STORE API running at http://localhost:${port}`);
});
