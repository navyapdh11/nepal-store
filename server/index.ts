import express from "express";
import { z } from "zod";
import { AuthService } from "./auth.service.js";

const app = express();
const port = 3001;

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

const _ProductSchema = z.object({
	id: z.string(),
	name: z.string(),
	price: z.number(),
	category: z.string(),
	image: z.string(),
});

// Curated Photorealistic HD IDs from Unsplash (Fashion & Nepal)
const assetLibrary: Record<string, { id: string, name: string }[]> = {
	WOMEN: [
		{ id: "1606760227091-3dd870d97f1d", name: "Hand-Woven Pashmina Shawl" },
		{ id: "1583391733956-3750e0ff4e8b", name: "Modern Dhaka Kurta Set" },
		{ id: "1620799140408-edc6dcb6d633", name: "Himalayan Yak Wool Cardigan" },
		{ id: "1610030469983-98e550d6193c", name: "Silk Sari with Zari Work" },
		{ id: "1483985988355-763728e1935b", name: "Luxury Cashmere Wrap" },
		{ id: "1490481651871-ab68ff25d43d", name: "Embroidered Velvet Lehenga" },
		{ id: "1551163945-3f831309f481", name: "Artisan Cotton Tunic" },
		{ id: "1564485377539-4af72d1f6a2f", name: "Traditional Nepali Jewelry Set" }
	],
	MEN: [
		{ id: "1552374196-1ab2a1c593e8", name: "Classic Daura Suruwal Set" },
		{ id: "1551488831-00ddcb6c6bd3", name: "Himalayan Trekking Shell" },
		{ id: "1594938298603-c8148c4dae35", name: "Yak Wool Blend Blazer" },
		{ id: "1617137984095-74e4e5e3613f", name: "Dhaka Pattern Waistcoat" },
		{ id: "1507679799987-c7377f323bdc", name: "Bespoke Pashmina Suit" },
		{ id: "1534030347011-8815806bb8ce", name: "Outdoor Adventure Parka" },
		{ id: "1611625618313-68b8a05d6211", name: "Modern Fit Chinos" },
		{ id: "1516257984-b1b4d7574382", name: "Handcrafted Leather Boots" }
	],
	KIDS: [
		{ id: "1519457431-75514b7230ed", name: "Mini Pashmina Poncho" },
		{ id: "1518831959646-742c3a14ebf7", name: "Cotton Dhaka Print T-Shirt" },
		{ id: "1544605530-01f8ee6193e6", name: "Hand-Knitted Woolen Mittens" },
		{ id: "1515629560377-511400d418be", name: "Active Play Set" },
		{ id: "1602161274116-f28822005c2a", name: "Warm Fleece Hoodie" },
		{ id: "1514090501247-58209e242971", name: "Soft Cotton Sleepwear" }
	],
	BABY: [
		{ id: "1522771739844-6a9f6d5f14af", name: "Organic Cotton Onesie" },
		{ id: "1515488764276-beab7607c1e6", name: "Soft Woolen Baby Booties" },
		{ id: "1519689689343-c6466b1f8ac1", name: "Knit Cotton Blanket" },
		{ id: "1543157143431-275141e10fb1", name: "Teether & Toy Set" },
		{ id: "1511270339315-973072832184", name: "Gentle Skin Care Kit" }
	]
};

const generateCatalog = () => {
	const allProducts: any[] = [];
	Object.keys(assetLibrary).forEach(cat => {
		const templates = assetLibrary[cat];
		for (let i = 0; i < 100; i++) {
			const template = templates[i % templates.length];
			allProducts.push({
				id: `${cat.toLowerCase()}-${i}`,
				name: `${template.name} #${i + 1}`,
				price: Math.floor(Math.random() * 25000) + 1200,
				category: cat,
				image: `https://images.unsplash.com/photo-${template.id}?q=80&w=800&auto=format&fit=crop`
			});
		}
	});
	return allProducts;
};

const products = generateCatalog();

app.get("/api/products", (req, res) => {
	const { category, limit = 100, offset = 0 } = req.query;
	let filtered = products;
	if (category) {
		filtered = products.filter((p) => p.category === category);
	}
	const paginated = filtered.slice(Number(offset), Number(offset) + Number(limit));
	res.json(paginated);
});

app.listen(port, () => {
	console.log(`NEPAL STORE API running at http://localhost:${port}`);
});
