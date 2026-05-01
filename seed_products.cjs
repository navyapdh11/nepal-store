/**
 * Seed Product model from products.json into Prisma SQLite database
 * Run: node seed_products.cjs
 */

const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();
const productsPath = path.join(__dirname, "public", "products.json");
const products = JSON.parse(fs.readFileSync(productsPath, "utf-8"));

async function main() {
	// Clear existing products
	await prisma.product.deleteMany();
	console.log("Cleared existing products.");

	// Insert all products
	let inserted = 0;
	for (const p of products) {
		await prisma.product.create({
			data: {
				name: p.name,
				description: p.description,
				price: p.price,
				category: p.category,
				image: p.image,
				sizes: JSON.stringify(p.sizes),
				colors: JSON.stringify(p.colors),
				isNew: p.isNew ?? false,
				rating: p.rating ?? "4.5",
				reviews: p.reviews ?? 0,
				season: p.season ?? null,
				isActive: true,
			},
		});
		inserted++;
	}

	console.log(`Inserted ${inserted} products into Prisma database.`);
	
	// Verify counts by category
	const counts = await prisma.product.groupBy({
		by: ["category"],
		_count: { id: true },
	});
	console.log("Category counts:", JSON.stringify(counts, null, 2));
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
