import fs from "node:fs";
import path from "node:path";
import express from "express";
import { AuthService } from "./auth.service.js";

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

// Auth Routes
app.post("/api/auth/register", (req, res) => {
	try {
		const result = AuthService.register(req.body);
		res.json(result);
	} catch (err: unknown) {
		res.status(400).json({ error: (err as Error).message });
	}
});

app.post("/api/auth/login", (req, res) => {
	try {
		const { email, password } = req.body;
		const result = AuthService.login(email, password);
		res.json(result);
	} catch (err: unknown) {
		res.status(401).json({ error: (err as Error).message });
	}
});

let products: any[] = [];
try {
	const data = fs.readFileSync(
		path.join(process.cwd(), "../public/products.json"),
		"utf-8",
	);
	products = JSON.parse(data);
} catch (_e) {
	try {
		const data = fs.readFileSync(
			path.join(process.cwd(), "public/products.json"),
			"utf-8",
		);
		products = JSON.parse(data);
	} catch (_e2) {
		console.log("Could not load products.json");
	}
}

app.get("/api/products", (req, res) => {
	const { category, limit = 100, offset = 0 } = req.query;
	let filtered = products;
	if (category) {
		filtered = products.filter((p) => p.category === category);
	}
	const paginated = filtered.slice(
		Number(offset),
		Number(offset) + Number(limit),
	);
	res.json(paginated);
});

app.listen(port, () => {
	console.log(
		`NEPAL STORE API running at http://localhost:${port} with ${products.length} products`,
	);
});
