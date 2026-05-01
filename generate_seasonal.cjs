/**
 * Generate 200 real SEASONAL products with unique names, descriptions, HD Unsplash images
 * Run: node generate_seasonal.cjs
 */

const fs = require("fs");
const path = require("path");

// 20 real seasonal product archetypes with matching Unsplash images
const archetypes = [
	{ name: "Monsoon Rain Jacket", img: "photo-1544966503-7cc5ac882d5f", desc: "Lightweight waterproof shell designed for Nepal's monsoon season. Breathable mesh lining, sealed seams, and packable design for trekking in heavy rain." },
	{ name: "Solstice Winter Coat", img: "photo-1539533018447-63fcce2678e3", desc: "Insulated parka built for Himalayan winters. Down-filled core, faux-fur hood trim, and windproof outer shell for temperatures below -10°C." },
	{ name: "Spring Linen Blazer", img: "photo-1490481651871-ab68ff25d43d", desc: "Unstructured linen blazer perfect for Kathmandu's mild spring weather. Relaxed fit, natural cotton blend, and earth-tone dyes." },
	{ name: "Winter Down Vest", img: "photo-1543076447-218ad9e3f51a", desc: "Ultra-light down vest layering piece. 650-fill goose down, compressible design, and quilted channels for even warmth distribution." },
	{ name: "Autumn Windbreaker", img: "photo-1591047139829-d91aecb6caea", desc: "Crisp autumn windbreaker with adjustable hood. Water-resistant nylon, zippered pockets, and reflective trim for evening visibility." },
	{ name: "Summer Cotton Kaftan", img: "photo-1562577309-4932fdd64cd1", desc: "Flowing cotton kaftan for Nepal's hot summer months. Hand-block printed, loose fit, and breathable weave for maximum comfort." },
	{ name: "Monsoon Trek Poncho", img: "photo-1547234569-53fd724f2e1b", desc: "Full-coverage trekking poncho for monsoon expeditions. Ripstop nylon, extended length for backpack coverage, and stuff-sack included." },
	{ name: "Winter Cashmere Wrap", img: "photo-1520903442860-7f3cf0e852a5", desc: "Oversized cashmere wrap shawl for winter evenings. 100% Himalayan cashmere, hand-loomed in Kathmandu, naturally dyed." },
	{ name: "Spring Floral Dress", img: "photo-1595777457583-95e0e8a8f420", desc: "Light floral print dress for spring festivals in Nepal. Cotton-silk blend, A-line silhouette, and hand-embroidered border detail." },
	{ name: "Summer Hemp Shorts", img: "photo-1591195853828-11db59a44f6b", desc: "Eco-friendly hemp shorts for hot weather. Organic hemp-cotton blend, elastic waist, and deep side pockets for everyday wear." },
	{ name: "Autumn Wool Cardigan", img: "photo-1576566588028-414794448e77", desc: "Chunky-knit wool cardigan for autumn chill. Nepalese wool blend, wooden toggle buttons, and patch pockets for a heritage look." },
	{ name: "Winter Fleece-lined Trousers", img: "photo-1594633312681-425c7b569a45", desc: "Warm fleece-lined trousers for winter commuting. Stretch fabric exterior, soft fleece interior, and tapered fit for layering." },
	{ name: "Spring Rain Anorak", img: "photo-1544966503-7cc5ac882d5f", desc: "Pullover rain anorak for spring showers. Water-repellent coating, kangaroo pocket, and adjustable hem for customizable coverage." },
	{ name: "Summer Bamboo Shirt", img: "photo-1596755094514-8691829b4e45", desc: "Cool bamboo-fiber shirt for tropical heat. Moisture-wicking, UV-protective, and button-down collar for casual-to-smart styling." },
	{ name: "Monsoon Quick-dry Pants", img: "photo-1509631179647-017733169340", desc: "Technical quick-dry trousers for monsoon travel. Hydrophobic fabric, articulated knees, and zip-off legs for convertible styling." },
	{ name: "Winter Yak Wool Beanie", img: "photo-1576871337632-b9aef4c17ab9", desc: "Hand-knit yak wool beanie for extreme cold. Soft inner lining, folded cuff design, and traditional Nepalese color patterns." },
	{ name: "Autumn Suede Jacket", img: "photo-1551028719-00167b16eac5", desc: "Classic suede jacket for autumn layering. Soft nubuck finish, zip-front closure, and warm polyester lining for transitional weather." },
	{ name: "Summer Linen Wrap Skirt", img: "photo-1583846783903-6a7a2039570d", desc: "Flowing linen wrap skirt for summer comfort. Adjustable tie waist, midi length, and natural linen texture with hand-finished edges." },
	{ name: "Spring Lightweight Parka", img: "photo-1591047139829-d91aecb6caea", desc: "Packable spring parka for variable mountain weather. Ultralight nylon, compressible stuff sack, and DWR coating for light rain." },
	{ name: "Winter Thermal Base Layer", img: "photo-1571019614242-c5c5dee9f50b", desc: "Merino wool thermal base layer for winter expeditions. 18.5-micron merino, flatlock seams, and odor-resistant natural fiber." },
];

// Color palettes per season
const seasonalColors = {
	Monsoon: [
		{ name: "Storm Gray", hex: "#4a5568" },
		{ name: "Rain Blue", hex: "#2b6cb0" },
		{ name: "Moss", hex: "#386641" },
	],
	Winter: [
		{ name: "Charcoal", hex: "#2d3748" },
		{ name: "Snow", hex: "#f7fafc" },
		{ name: "Plum", hex: "#553c7b" },
	],
	Spring: [
		{ name: "Sage", hex: "#68d391" },
		{ name: "Blush", hex: "#fbb6ce" },
		{ name: "Cream", hex: "#fefcbf" },
	],
	Summer: [
		{ name: "Turmeric", hex: "#d69e2e" },
		{ name: "Coral", hex: "#fc8181" },
		{ name: "Ivory", hex: "#fffff0" },
	],
	Autumn: [
		{ name: "Rust", hex: "#c05621" },
		{ name: "Olive", hex: "#698041" },
		{ name: "Amber", hex: "#dd6b20" },
	],
};

const seasonMap = ["Monsoon", "Winter", "Spring", "Summer", "Autumn"];

function getSeason(index) {
	return seasonMap[index % seasonMap.length];
}

function getSeasonColors(season) {
	return seasonalColors[season] || seasonalColors.Spring;
}

const productsPath = path.join(__dirname, "public", "products.json");
const products = JSON.parse(fs.readFileSync(productsPath, "utf-8"));

// Remove existing SEASONAL products
const nonSeasonal = products.filter(p => p.category !== "SEASONAL");

const seasonalProducts = [];
for (let i = 0; i < 200; i++) {
	const arch = archetypes[i % archetypes.length];
	const season = getSeason(Math.floor(i / 40));
	const vol = Math.floor(i / archetypes.length) + 1;
	const colors = getSeasonColors(season);
	const basePrice = 2500 + Math.floor((i * 137 + i * i * 3) % 18000);

	seasonalProducts.push({
		id: `seasonal-${i}`,
		name: `${arch.name}${vol > 1 ? ` Vol. ${vol}` : ""}`,
		description: arch.desc,
		price: basePrice,
		category: "SEASONAL",
		image: `https://images.unsplash.com/${arch.img}?q=80&w=800&auto=format&fit=crop&sig=seasonal-${i}`,
		sizes: ["XS", "S", "M", "L", "XL"],
		colors: colors,
		isNew: i < 20,
		rating: (4 + ((i * 7) % 10) / 10).toFixed(1),
		reviews: 50 + ((i * 31) % 350),
		season: season,
	});
}

const allProducts = [...nonSeasonal, ...seasonalProducts];
fs.writeFileSync(productsPath, JSON.stringify(allProducts, null, "\t"));
console.log(`Generated ${seasonalProducts.length} SEASONAL products. Total: ${allProducts.length}`);
console.log(`Seasons: ${JSON.stringify(seasonMap)}`);
console.log(`Archetypes: ${archetypes.length} unique types`);
