import fs from "node:fs";
import path from "node:path";
import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { applySecurityMiddleware } from "./middleware/security.js";
import { requireAuth, type AuthRequest } from "./middleware/auth.js";

const app = express();
const port = process.env.PORT || 3001;
const prisma = new PrismaClient();

// Apply security middleware
applySecurityMiddleware(app);
app.use(express.json({ limit: "10mb" }));
app.use(express.static("public"));

// ─── Auth Routes ───
app.post("/api/auth/register", async (req, res) => {
	try {
		const { email, password, name } = req.body;
		if (!email || !password || password.length < 6 || !name) {
			return res.status(400).json({ error: "Name, email, and 6+ char password required." });
		}
		const existing = await prisma.user.findUnique({ where: { email } });
		if (existing) return res.status(409).json({ error: "User already exists" });
		const hashedPassword = await bcrypt.hash(password, 12);
		const user = await prisma.user.create({ data: { email, name, password: hashedPassword } });
		const secret = process.env.JWT_SECRET;
		if (!secret) throw new Error("JWT_SECRET not configured");
		const token = jwt.sign({ userId: user.id, role: user.role }, secret, { expiresIn: "1h" });
		res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
	} catch (err: unknown) {
		res.status(400).json({ error: (err as Error).message });
	}
});

app.post("/api/auth/login", async (req, res) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) return res.status(401).json({ error: "Email and password required" });
		const user = await prisma.user.findUnique({ where: { email } });
		if (!user || !user.password) return res.status(401).json({ error: "Invalid credentials" });
		const isValid = await bcrypt.compare(password, user.password);
		if (!isValid) return res.status(401).json({ error: "Invalid credentials" });
		const secret = process.env.JWT_SECRET;
		if (!secret) throw new Error("JWT_SECRET not configured");
		const token = jwt.sign({ userId: user.id, role: user.role }, secret, { expiresIn: "1h" });
		res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
	} catch (err: unknown) {
		res.status(401).json({ error: (err as Error).message });
	}
});

// ─── Public Product Routes ───
app.get("/api/products", async (req, res) => {
	try {
		const { category, limit = "100", offset = "0", search, season } = req.query;
		const where: any = { isActive: true };
		if (category) where.category = category as string;
		if (season) where.season = season as string;
		if (search && typeof search === "string") {
			where.OR = [
				{ name: { contains: search } },
				{ description: { contains: search } },
				{ category: { contains: search } },
			];
		}
		const products = await prisma.product.findMany({
			where,
			take: Number(limit),
			skip: Number(offset),
			orderBy: { isNew: "desc" },
		});
		res.json(products.map(p => ({
			...p,
			sizes: JSON.parse(p.sizes),
			colors: JSON.parse(p.colors),
		})));
	} catch (err: unknown) {
		res.status(500).json({ error: (err as Error).message });
	}
});

// Get single product
app.get("/api/products/:id", async (req, res) => {
	try {
		const product = await prisma.product.findUnique({ where: { id: req.params.id } });
		if (!product) return res.status(404).json({ error: "Product not found" });
		res.json({ ...product, sizes: JSON.parse(product.sizes), colors: JSON.parse(product.colors) });
	} catch (err: unknown) {
		res.status(500).json({ error: (err as Error).message });
	}
});

// ─── Admin Product CRUD (requires admin role) ───
const requireAdmin = async (req: AuthRequest, res: any, next: any) => {
	try {
		const authHeader = req.headers.authorization;
		const token = authHeader?.split(" ")[1];
		if (!token) return res.status(401).json({ error: "Unauthorized" });
		const secret = process.env.JWT_SECRET;
		if (!secret) return res.status(500).json({ error: "Server configuration error" });
		const decoded = jwt.verify(token, secret) as { userId: string; role: string };
		const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
		if (!user || user.role !== "ADMIN") return res.status(403).json({ error: "Admin access required" });
		req.user = { userId: user.id };
		next();
	} catch {
		res.status(401).json({ error: "Invalid token" });
	}
};

// GET /api/admin/products — List all products (admin)
app.get("/api/admin/products", requireAdmin as any, async (req: AuthRequest, res) => {
	try {
		const { category, search, page = "1", pageSize = "20" } = req.query;
		const where: any = {};
		if (category) where.category = category as string;
		if (search && typeof search === "string") {
			where.OR = [
				{ name: { contains: search } },
				{ description: { contains: search } },
			];
		}
		const skip = (Number(page) - 1) * Number(pageSize);
		const [products, total] = await Promise.all([
			prisma.product.findMany({ where, skip, take: Number(pageSize), orderBy: { updatedAt: "desc" } }),
			prisma.product.count({ where }),
		]);
		res.json({
			products: products.map(p => ({ ...p, sizes: JSON.parse(p.sizes), colors: JSON.parse(p.colors) })),
			total,
			page: Number(page),
			totalPages: Math.ceil(total / Number(pageSize)),
		});
	} catch (err: unknown) {
		res.status(500).json({ error: (err as Error).message });
	}
});

// GET /api/admin/products/:id — Get single product (admin)
app.get("/api/admin/products/:id", requireAdmin as any, async (req: AuthRequest, res) => {
	try {
		const product = await prisma.product.findUnique({ where: { id: req.params.id } });
		if (!product) return res.status(404).json({ error: "Product not found" });
		res.json({ ...product, sizes: JSON.parse(product.sizes), colors: JSON.parse(product.colors) });
	} catch (err: unknown) {
		res.status(500).json({ error: (err as Error).message });
	}
});

// POST /api/admin/products — Create product (admin)
app.post("/api/admin/products", requireAdmin as any, async (req: AuthRequest, res) => {
	try {
		const { name, description, price, category, image, sizes, colors, isNew, rating, reviews, season } = req.body;
		if (!name || !description || !price || !category || !image) {
			return res.status(400).json({ error: "name, description, price, category, and image are required" });
		}
		const product = await prisma.product.create({
			data: {
				name,
				description,
				price: Number(price),
				category,
				image,
				sizes: JSON.stringify(sizes ?? ["XS", "S", "M", "L", "XL"]),
				colors: JSON.stringify(colors ?? [{ name: "Default", hex: "#000" }]),
				isNew: isNew ?? false,
				rating: rating ?? "4.5",
				reviews: reviews ?? 0,
				season: season ?? null,
			},
		});
		res.status(201).json({ ...product, sizes: JSON.parse(product.sizes), colors: JSON.parse(product.colors) });
	} catch (err: unknown) {
		res.status(400).json({ error: (err as Error).message });
	}
});

// PATCH /api/admin/products/:id — Update product (admin)
app.patch("/api/admin/products/:id", requireAdmin as any, async (req: AuthRequest, res) => {
	try {
		const { name, description, price, category, image, sizes, colors, isNew, rating, reviews, season, isActive } = req.body;
		const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
		if (!existing) return res.status(404).json({ error: "Product not found" });
		const updated = await prisma.product.update({
			where: { id: req.params.id },
			data: {
				...(name !== undefined && { name }),
				...(description !== undefined && { description }),
				...(price !== undefined && { price: Number(price) }),
				...(category !== undefined && { category }),
				...(image !== undefined && { image }),
				...(sizes !== undefined && { sizes: JSON.stringify(sizes) }),
				...(colors !== undefined && { colors: JSON.stringify(colors) }),
				...(isNew !== undefined && { isNew }),
				...(rating !== undefined && { rating }),
				...(reviews !== undefined && { reviews }),
				...(season !== undefined && { season }),
				...(isActive !== undefined && { isActive }),
			},
		});
		res.json({ ...updated, sizes: JSON.parse(updated.sizes), colors: JSON.parse(updated.colors) });
	} catch (err: unknown) {
		res.status(400).json({ error: (err as Error).message });
	}
});

// DELETE /api/admin/products/:id — Delete product (admin)
app.delete("/api/admin/products/:id", requireAdmin as any, async (req: AuthRequest, res) => {
	try {
		const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
		if (!existing) return res.status(404).json({ error: "Product not found" });
		await prisma.product.delete({ where: { id: req.params.id } });
		res.json({ success: true });
	} catch (err: unknown) {
		res.status(500).json({ error: (err as Error).message });
	}
});

// GET /api/admin/stats — Admin dashboard stats
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
			recent: recentProducts.map(p => ({
				id: p.id,
				name: p.name,
				category: p.category,
				updatedAt: p.updatedAt,
			})),
		});
	} catch (err: unknown) {
		res.status(500).json({ error: (err as Error).message });
	}
});

// ─── Protected user route ───
app.get("/api/account", requireAuth as any, async (req: AuthRequest, res) => {
	try {
		const user = await prisma.user.findUnique({
			where: { id: req.user?.userId },
			select: { id: true, email: true, name: true, role: true, createdAt: true },
		});
		if (!user) return res.status(404).json({ error: "User not found" });
		res.json(user);
	} catch (err: unknown) {
		res.status(500).json({ error: (err as Error).message });
	}
});

app.listen(port, () => {
	console.log(`NEPAL STORE API running at http://localhost:${port}`);
});
