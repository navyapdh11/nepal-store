import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";

const PRODUCTS_PATH = join(process.cwd(), "public", "products.json");
const SECRET_KEY = process.env.JWT_SECRET || "fallback-change-me";

function readProducts(): any[] {
	return JSON.parse(readFileSync(PRODUCTS_PATH, "utf8"));
}

function writeProducts(products: any[]) {
	writeFileSync(PRODUCTS_PATH, JSON.stringify(products, null, "\t"));
}

function verifyAdmin(req: VercelRequest): boolean {
	const auth = req.headers.authorization;
	if (!auth) return false;
	try {
		const token = auth.split(" ")[1];
		const decoded = jwt.verify(token, SECRET_KEY) as any;
		return decoded.role === "ADMIN";
	} catch {
		return false;
	}
}

function productToApi(p: any) {
	return {
		...p,
		sizes: Array.isArray(p.sizes) ? p.sizes : JSON.parse(p.sizes || '["XS","S","M","L","XL"]'),
		colors: Array.isArray(p.colors) ? p.colors : JSON.parse(p.colors || '[{"name":"Default","hex":"#000"}]'),
	};
}

export default function handler(req: VercelRequest, res: VercelResponse) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
	if (req.method === "OPTIONS") return res.status(200).end();

	const { category, search, limit = "100", offset = "0", season } = req.query;

	// ─── GET /api/products ───
	if (req.method === "GET") {
		try {
			let products = readProducts();
			if (category) products = products.filter((p: any) => p.category === category);
			if (season) products = products.filter((p: any) => p.season === season);
			if (search && typeof search === "string") {
				const q = search.toLowerCase();
				products = products.filter((p: any) =>
					p.name.toLowerCase().includes(q) ||
					p.description.toLowerCase().includes(q) ||
					p.category.toLowerCase().includes(q)
				);
			}
			const paginated = products.slice(Number(offset), Number(offset) + Number(limit));
			res.status(200).json(paginated.map(productToApi));
		} catch (error) {
			res.status(500).json({ error: "Failed to load products" });
		}
		return;
	}

	// ─── Admin routes require auth ───
	if (!verifyAdmin(req)) {
		return res.status(401).json({ error: "Admin access required" });
	}

	// ─── GET /api/admin/stats ───
	if (req.url?.startsWith("/api/admin/stats")) {
		const products = readProducts();
		const active = products.filter((p: any) => p.isActive !== false);
		const cats: Record<string, number> = {};
		products.forEach((p: any) => { cats[p.category] = (cats[p.category] || 0) + 1; });
		const recent = [...products].sort((a: any, b: any) => (b.updatedAt || "").localeCompare(a.updatedAt || "")).slice(0, 10);
		return res.status(200).json({
			totalProducts: products.length,
			activeProducts: active.length,
			categories: Object.entries(cats).map(([category, count]) => ({ category, count })),
			recent: recent.map((p: any) => ({ id: p.id, name: p.name, category: p.category, updatedAt: p.updatedAt })),
		});
	}

	// ─── GET /api/admin/products ───
	if (req.url?.startsWith("/api/admin/products") && req.method === "GET") {
		try {
			const url = new URL(req.url, `http://${req.headers.host}`);
			const page = Number(url.searchParams.get("page") || "1");
			const pageSize = Number(url.searchParams.get("pageSize") || "20");
			const catFilter = url.searchParams.get("category");
			const searchTerm = url.searchParams.get("search");
			let products = readProducts();
			if (catFilter) products = products.filter((p: any) => p.category === catFilter);
			if (searchTerm) {
				const q = searchTerm.toLowerCase();
				products = products.filter((p: any) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
			}
			const skip = (page - 1) * pageSize;
			const pageProducts = products.slice(skip, skip + pageSize);
			return res.status(200).json({
				products: pageProducts.map(productToApi),
				total: products.length,
				page,
				totalPages: Math.ceil(products.length / pageSize),
			});
		} catch (error) {
			return res.status(500).json({ error: "Failed to load products" });
		}
	}

	// ─── GET /api/admin/products/:id ───
	const productIdMatch = req.url?.match(/\/api\/admin\/products\/([^/?]+)/);
	if (productIdMatch && req.method === "GET") {
		const products = readProducts();
		const product = products.find((p: any) => p.id === productIdMatch[1]);
		if (!product) return res.status(404).json({ error: "Product not found" });
		return res.status(200).json(productToApi(product));
	}

	// ─── PATCH /api/admin/products/:id ───
	if (productIdMatch && req.method === "PATCH") {
		try {
			const products = readProducts();
			const idx = products.findIndex((p: any) => p.id === productIdMatch[1]);
			if (idx === -1) return res.status(404).json({ error: "Product not found" });
			const updates = req.body;
			products[idx] = { ...products[idx], ...updates, updatedAt: new Date().toISOString() };
			if (updates.sizes && !Array.isArray(updates.sizes)) products[idx].sizes = JSON.stringify(updates.sizes);
			if (updates.colors && !Array.isArray(updates.colors)) products[idx].colors = JSON.stringify(updates.colors);
			writeProducts(products);
			return res.status(200).json(productToApi(products[idx]));
		} catch (error) {
			return res.status(400).json({ error: "Failed to update product" });
		}
	}

	// ─── DELETE /api/admin/products/:id ───
	if (productIdMatch && req.method === "DELETE") {
		try {
			const products = readProducts();
			const filtered = products.filter((p: any) => p.id !== productIdMatch[1]);
			if (filtered.length === products.length) return res.status(404).json({ error: "Product not found" });
			writeProducts(filtered);
			return res.status(200).json({ success: true });
		} catch (error) {
			return res.status(500).json({ error: "Failed to delete product" });
		}
	}

	// ─── POST /api/admin/products ───
	if (req.method === "POST") {
		try {
			const body = req.body;
			if (!body.name || !body.description || !body.price || !body.category || !body.image) {
				return res.status(400).json({ error: "name, description, price, category, and image are required" });
			}
			const products = readProducts();
			const newProduct = {
				id: `${body.category.toLowerCase()}-${products.length}`,
				name: body.name,
				description: body.description,
				price: Number(body.price),
				category: body.category,
				image: body.image,
				sizes: body.sizes ?? ["XS", "S", "M", "L", "XL"],
				colors: body.colors ?? [{ name: "Default", hex: "#000" }],
				isNew: body.isNew ?? false,
				rating: body.rating ?? "4.5",
				reviews: body.reviews ?? 0,
				season: body.season ?? null,
				isActive: body.isActive ?? true,
				updatedAt: new Date().toISOString(),
			};
			products.push(newProduct);
			writeProducts(products);
			return res.status(201).json(productToApi(newProduct));
		} catch (error) {
			return res.status(400).json({ error: "Failed to create product" });
		}
	}

	res.status(405).json({ error: "Method not allowed" });
}
