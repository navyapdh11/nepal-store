import fs from "node:fs";
import path from "node:path";
import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthService } from "./auth.service.js";
import { applySecurityMiddleware } from "./middleware/security.js";
import { requireAuth, type AuthRequest } from "./middleware/auth.js";

const app = express();
const port = process.env.PORT || 3001;
const prisma = new PrismaClient();

// Apply security middleware
applySecurityMiddleware(app);

app.use(express.json());

// Serve products.json and traditional.json as static files
app.use(express.static("public"));

// Auth Routes
app.post("/api/auth/register", async (req, res) => {
	try {
		const { email, password, name } = req.body;
		if (!email || !password || password.length < 6 || !name) {
			return res.status(400).json({ error: "Name, email, and 6+ char password required." });
		}

		const existing = await prisma.user.findUnique({ where: { email } });
		if (existing) {
			return res.status(409).json({ error: "User already exists" });
		}

		const hashedPassword = await bcrypt.hash(password, 12);
		const user = await prisma.user.create({
			data: { email, name, password: hashedPassword },
		});

		const secret = process.env.JWT_SECRET;
		if (!secret) throw new Error("JWT_SECRET not configured");
		const token = jwt.sign({ userId: user.id }, secret, { expiresIn: "1h" });

		res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
	} catch (err: unknown) {
		res.status(400).json({ error: (err as Error).message });
	}
});

app.post("/api/auth/login", async (req, res) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			return res.status(401).json({ error: "Email and password required" });
		}

		const user = await prisma.user.findUnique({ where: { email } });
		if (!user || !user.password) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		const isValid = await bcrypt.compare(password, user.password);
		if (!isValid) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		const secret = process.env.JWT_SECRET;
		if (!secret) throw new Error("JWT_SECRET not configured");
		const token = jwt.sign({ userId: user.id }, secret, { expiresIn: "1h" });

		res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
	} catch (err: unknown) {
		res.status(401).json({ error: (err as Error).message });
	}
});

let products: any[] = [];
try {
	const data = fs.readFileSync(
		path.join(process.cwd(), "public/products.json"),
		"utf-8",
	);
	products = JSON.parse(data);
} catch (_e) {
	console.log("Could not load products.json");
}

app.get("/api/products", (req, res) => {
	const { category, limit = 100, offset = 0, search } = req.query;
	let filtered = products;

	if (category) {
		filtered = products.filter((p) => p.category === category);
	}
	if (search && typeof search === "string") {
		const q = search.toLowerCase();
		filtered = filtered.filter(
			(p) =>
				p.name.toLowerCase().includes(q) ||
				p.description.toLowerCase().includes(q) ||
				p.category.toLowerCase().includes(q),
		);
	}
	const paginated = filtered.slice(
		Number(offset),
		Number(offset) + Number(limit),
	);
	res.json(paginated);
});

// Protected route example
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
	console.log(
		`NEPAL STORE API running at http://localhost:${port} with ${products.length} products`,
	);
});
