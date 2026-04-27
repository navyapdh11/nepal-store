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

const products = [
	// WOMEN
	{ 
		id: "w1", 
		name: "Hand-Woven Pashmina Shawl", 
		price: 15000, 
		category: "WOMEN", 
		image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?q=80&w=800&auto=format&fit=crop" 
	},
	{ 
		id: "w2", 
		name: "Modern Dhaka Kurta Set", 
		price: 8500, 
		category: "WOMEN", 
		image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop" 
	},
	{ 
		id: "w3", 
		name: "Himalayan Yak Wool Cardigan", 
		price: 12000, 
		category: "WOMEN", 
		image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=800&auto=format&fit=crop" 
	},
	{ 
		id: "w4", 
		name: "Silk Sari with Zari Work", 
		price: 25000, 
		category: "WOMEN", 
		image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop" 
	},

	// MEN
	{ 
		id: "m1", 
		name: "Classic Daura Suruwal Set", 
		price: 9500, 
		category: "MEN", 
		image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=800&auto=format&fit=crop" 
	},
	{ 
		id: "m2", 
		name: "Himalayan Trekking Shell", 
		price: 14500, 
		category: "MEN", 
		image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=800&auto=format&fit=crop" 
	},
	{ 
		id: "m3", 
		name: "Yak Wool Blend Blazer", 
		price: 18000, 
		category: "MEN", 
		image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop" 
	},
	{ 
		id: "m4", 
		name: "Dhaka Pattern Waistcoat", 
		price: 5500, 
		category: "MEN", 
		image: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=800&auto=format&fit=crop" 
	},

	// KIDS
	{ 
		id: "k1", 
		name: "Mini Pashmina Poncho", 
		price: 4500, 
		category: "KIDS", 
		image: "https://images.unsplash.com/photo-1519457431-75514b7230ed?q=80&w=800&auto=format&fit=crop" 
	},
	{ 
		id: "k2", 
		name: "Cotton Dhaka Print T-Shirt", 
		price: 1500, 
		category: "KIDS", 
		image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=800&auto=format&fit=crop" 
	},
	{ 
		id: "k3", 
		name: "Hand-Knitted Woolen Mittens", 
		price: 800, 
		category: "KIDS", 
		image: "https://images.unsplash.com/photo-1544605530-01f8ee6193e6?q=80&w=800&auto=format&fit=crop" 
	},

	// BABY
	{ 
		id: "b1", 
		name: "Organic Cotton Onesie", 
		price: 1200, 
		category: "BABY", 
		image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=800&auto=format&fit=crop" 
	},
	{ 
		id: "b2", 
		name: "Soft Woolen Baby Booties", 
		price: 950, 
		category: "BABY", 
		image: "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?q=80&w=800&auto=format&fit=crop" 
	}
];

app.get("/api/products", (req, res) => {
	const { category } = req.query;
	if (category) {
		return res.json(products.filter((p) => p.category === category));
	}
	res.json(products);
});

app.listen(port, () => {
	console.log(`NEPAL STORE API running at http://localhost:${port}`);
});
