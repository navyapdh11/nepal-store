import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
	try {
		// Read products.json from public directory
		const filePath = join(process.cwd(), "public", "products.json");
		const fileData = readFileSync(filePath, "utf8");
		let products = JSON.parse(fileData);

		const { category, limit = 100, offset = 0 } = req.query;

		if (category) {
			products = products.filter((p: any) => p.category === category);
		}

		const paginated = products.slice(
			Number(offset),
			Number(offset) + Number(limit),
		);

		// Enable CORS and caching
		res.setHeader("Access-Control-Allow-Origin", "*");
		res.setHeader("Cache-Control", "s-maxage=86400");
		res.status(200).json(paginated);
	} catch (error) {
		console.error("API Error: ", error);
		res.status(500).json({ error: "Failed to load products" });
	}
}
