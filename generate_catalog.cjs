const fs = require("node:fs");

const categories = [
	"WOMEN",
	"MEN",
	"SPORTS",
	"TRADITIONAL",
	"SEASONAL",
	"KIDS",
	"BABY",
	"HOME",
	"SALE",
];

const assetPool = {
	fashion: [
		"1483985988355-763728e1935b",
		"1490481651871-ab68ff25d43d",
		"1551163945-3f831309f481",
		"1564485377539-4af72d1f6a2f",
		"1606760227091-3dd870d97f1d",
		"1583391733956-3750e0ff4e8b",
		"1620799140408-edc6dcb6d633",
		"1610030469983-98e550d6193c",
		"1515886657613-9f3515b0c78f",
		"1520002181023-b6d2744bfc54",
	],
	sports: [
		"1542291026-7eec264c27ff",
		"1595950653106-6c9ebd614d3a",
		"1460353581641-37badd45213b",
		"1523275335684-37898b6baf30",
		"1556906781-9a412961c28c",
		"1606107557195-0e29a4b5b4aa",
		"1608231387042-66d1773070a5",
		"1511746310427-ed40124696c1",
	],
	traditional: [
		"1582991040332-9f635b6c0b39",
		"1605648911177-df7d9d40c0df",
		"1514222139775-d4242c7e009a",
		"1540206351-d636b49e2124",
		"1519414442741-f58b0f44a594",
	],
	seasonal: [
		"1516331138075-f3adc1e149cd",
		"1486308533570-ce280144f6d3",
		"1551488831-00ddcb6c6bd3",
		"1515462277125-26967f5999da",
		"1543332163484-2f7181067524",
	],
	lifestyle: [
		"1513694203232-719a280e022f",
		"1583847268964-b28ce7f3ce19",
		"1538688423619-a81d3f23454b",
		"1505691909968-25611af0cf92",
	],
};

const productMeta = {
	WOMEN: ["Cashmere Knit", "Silk Sari", "Dhaka Kurta", "Yak Wool Wrap"],
	MEN: ["Merino Tee", "Daura Suruwal", "Oxford Shirt", "Trekking Jacket"],
	SPORTS: ["Nike Tech", "Adidas Ultra", "Nike Pro", "Adidas Prime"],
	TRADITIONAL: [
		"Dhaka Topi",
		"Haku Patasi",
		"Copper Singing Bowl",
		"Hand-Carved Idol",
	],
	SEASONAL: ["Monsoon Shell", "Solstice Coat", "Spring Linen", "Winter Down"],
	KIDS: ["Graphic Tee", "Warm Hoodie", "Comfort Joggers"],
	BABY: ["Soft Onesie", "Knit Booties", "Cotton Blanket"],
	HOME: ["Ceramic Set", "Woven Rug", "Temple Incense"],
	SALE: ["Archived Piece", "Seasonal Special", "Flash Deal"],
};

const allProducts = [];
categories.forEach((cat) => {
	let images = assetPool.fashion;
	if (cat === "SPORTS") images = assetPool.sports;
	if (cat === "TRADITIONAL") images = assetPool.traditional;
	if (cat === "SEASONAL") images = assetPool.seasonal;
	if (cat === "HOME") images = assetPool.lifestyle;

	const names = productMeta[cat];

	for (let i = 0; i < 50; i++) {
		const baseName = names[i % names.length];
		const imgId = images[i % images.length];
		allProducts.push({
			id: `${cat.toLowerCase()}-${i}`,
			name: `${baseName} Vol. ${i + 1}`,
			description: `A masterclass in 2026 spatial design and materials. This ${baseName} embodies the spirit of Nepal with hyper-realistic textures and optimized comfort. Built for high-fidelity living.`,
			price: Math.floor(Math.random() * 18000) + 2500,
			category: cat,
			image: `https://images.unsplash.com/photo-${imgId}?q=80&w=800&auto=format&fit=crop&sig=${cat}-${i}`,
			sizes: ["XS", "S", "M", "L", "XL"],
			colors: [
				{ name: "Obsidian", hex: "#0a0a0a" },
				{ name: "Summit", hex: "#fff" },
				{ name: "Earth", hex: "#4a3728" },
			],
			isNew: i < 10,
			rating: (4.5 + Math.random() * 0.5).toFixed(1),
			reviews: Math.floor(Math.random() * 400) + 100,
		});
	}
});

fs.writeFileSync("public/products.json", JSON.stringify(allProducts, null, 2));
console.log(`Success: Generated ${allProducts.length} High-Fidelity products.`);
