/**
 * Generate 50 ACCESSORIES products and append to products.json
 * Run: node generate_accessories.cjs
 */

const fs = require("fs");
const path = require("path");

const accessoryNames = [
	"Pashmina Scarf", "Dhaka Bag", "Cashmere Shawl", "Woven Bracelet", "Silver Ring",
	"Hemp Belt", "Yak Wool Hat", "Linen Wallet", "Silk Tie", "Beaded Necklace",
	"Leather Pouch", "Embroidered Clutch", "Bamboo Earrings", "Copper Bangle", "Prayer Flag Set",
	"Singing Bowl", "Felt Slippers", "Wool Socks", "Cotton Headband", "Allo Purse",
	"Handwoven Wrap", "Dhaka Pocket Square", "Cashmere Gloves", "Silver Anklet", "Turquoise Pendant",
	"Leather Journal", "Beaded Bracelet", "Silk Hairpin", "Wool Mittens", "Ceramic Pendant",
	"Embroidered Scarf", "Cashmere Beanie", "Hemp Tote", "Silver Cufflinks", "Bamboo Sunglasses",
	"Felt Coaster Set", "Allo Wallet", "Dhaka Scarf", "Yak Wool Socks", "Linen Bandana",
	"Silver Toe Ring", "Wool Headwrap", "Cotton Apron", "Beaded Belt", "Copper Ring",
	"Silk Scrunchie", "Pashmina Wrap", "Leather Keychain", "Wooden Comb", "Prayer Mala"
];

const accessoryImages = [
	"photo-1606760227091-3dd870d57081", // scarf
	"photo-1590874103328-eac38a683ce8", // bag
	"photo-1520903442860-7f3cf0e852a5", // shawl
	"photo-1573408391685-789e6e94da58", // bracelet
	"photo-1515562141207-7a88fb7ce338", // jewelry
	"photo-1535632066927-ab7c9ab60908", // handmade jewelry
	"photo-1602173572773-421a61b9368e", // artisan jewelry
	"photo-1591561954557-3a11fc5475e8", // woven bag
];

const colors = [
	{ name: "Obsidian", hex: "#0a0a0a" },
	{ name: "Summit", hex: "#fff" },
	{ name: "Earth", hex: "#4a3728" },
	{ name: "Crimson", hex: "#8b0000" },
	{ name: "Saffron", hex: "#d4a017" },
];

const productsPath = path.join(__dirname, "public", "products.json");
const products = JSON.parse(fs.readFileSync(productsPath, "utf-8"));

const accessories = accessoryNames.map((name, i) => ({
	id: `accessories-${i}`,
	name: `${name} Vol. ${i + 1}`,
	description: `Handcrafted ${name.toLowerCase()} made by artisan partners in the Kathmandu Valley. Features traditional Nepalese techniques with contemporary design. Premium materials sourced locally — perfect for gifting or personal use.`,
	price: Math.floor(1500 + Math.random() * 12000),
	category: "ACCESSORIES",
	image: `https://images.unsplash.com/${accessoryImages[i % accessoryImages.length]}?q=80&w=800&auto=format&fit=crop&sig=accessories-${i}`,
	sizes: ["One Size"],
	colors: colors.slice(0, 3),
	isNew: i < 10,
	rating: (4 + Math.random()).toFixed(1),
	reviews: Math.floor(50 + Math.random() * 400),
}));

products.push(...accessories);
fs.writeFileSync(productsPath, JSON.stringify(products, null, "\t"));
console.log(`Added ${accessories.length} ACCESSORIES products. Total: ${products.length}`);
