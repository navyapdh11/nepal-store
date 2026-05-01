/**
 * Regenerate products.json with relevant HD Unsplash images
 * that actually match each product's name and description.
 * 
 * Run: node fix_images.cjs
 */

const fs = require("fs");
const path = require("path");

const IMAGE_MAP = {
	"Cashmere Knit": ["photo-1434387477352-7c9a1823ff74", "photo-1576566588028-414794448e77"],
	"Silk Sari": ["photo-1610030469983-98e550d6193c", "photo-1583391733956-3750e0ff4e8b"],
	"Dhaka Kurta": ["photo-1594938298603-c8148c4dae35", "photo-1585487306809-c56a5974c672"],
	"Yak Wool Wrap": ["photo-1509631179647-017733169340", "photo-1543076447-218ad9e3f51a"],
	"Daura Suruwal": ["photo-1594938298603-c8148c4dae35", "photo-1617137968427-85924c800a22"],
	"Merino Tee": ["photo-1617137968427-85924c800a22", "photo-1602810318209-96c57c5dfc8f"],
	"Oxford Shirt": ["photo-1596755094514-8691829b4e45", "photo-1602810318209-96c57c5dfc8f"],
	"Trekking Jacket": ["photo-1517836357463-d25dfeac3438", "photo-1617137968427-85924c800a22"],
	"Nike Tech": ["photo-1571019614242-c5c5dee9f50b", "photo-1517836357463-d25dfeac3438"],
	"Adidas Ultra": ["photo-1517836357463-d25dfeac3438", "photo-1518458028785-8fbcd101ebb9"],
	"Nike Pro": ["photo-1571019614242-c5c5dee9f50b", "photo-1518458028785-8fbcd101ebb9"],
	"Adidas Prime": ["photo-1518458028785-8fbcd101ebb9", "photo-1517836357463-d25dfeac3438"],
	"Monsoon Shell": ["photo-1544966503-7cc5ac882d5f", "photo-1509631179647-017733169340"],
	"Solstice Coat": ["photo-1539533018447-63fcce2678e3", "photo-1543076447-218ad9e3f51a"],
	"Spring Linen": ["photo-1490481651871-ab68ff25d43d", "photo-1564257151042-82156e3e303a"],
	"Winter Down": ["photo-1539533018447-63fcce2678e3", "photo-1543076447-218ad9e3f51a"],
	"Graphic Tee": ["photo-1519238263530-99bdd11df2ea", "photo-1503919545889-aefc7767b549"],
	"Warm Hoodie": ["photo-1543852786-1cf6624b9987", "photo-1519238263530-99bdd11df2ea"],
	"Comfort Joggers": ["photo-1503919545889-aefc7767b549", "photo-1543852786-1cf6624b9987"],
	"Soft Onesie": ["photo-1522771930-78848d9293e8", "photo-1515488042361-ee00e0ddd4e4"],
	"Knit Booties": ["photo-1555252333-9f8e92e65df9", "photo-1522771930-78848d9293e8"],
	"Cotton Blanket": ["photo-1555252333-9f8e92e65df9", "photo-1515488042361-ee00e0ddd4e4"],
	"Ceramic Set": ["photo-1556228453-efd6c1ff04f6", "photo-1586023492125-27b2c045efd7"],
	"Woven Rug": ["photo-1555041469-a586c61ea9bc", "photo-1556228453-efd6c1ff04f6"],
	"Temple Incense": ["photo-1586023492125-27b2c045efd7", "photo-1556228453-efd6c1ff04f6"],
	"Archived Piece": ["photo-1472851294608-062f824d29cc", "photo-1483985988355-763728e1935b"],
	"Seasonal Special": ["photo-1483985988355-763728e1935b", "photo-1469334031218-e382a7189089"],
	"Flash Deal": ["photo-1472851294608-062f824d29cc", "photo-1483985988355-763728e1935b"],
};

const CATEGORY_DEFAULTS = {
	WOMEN: "photo-1483985988355-763728e1935b",
	MEN: "photo-1617137968427-85924c800a22",
	SPORTS: "photo-1571019614242-c5c5dee9f50b",
	TRADITIONAL: "photo-1594938298603-c8148c4dae35",
	SEASONAL: "photo-1490481651871-ab68ff25d43d",
	KIDS: "photo-1519238263530-99bdd11df2ea",
	BABY: "photo-1522771930-78848d9293e8",
	ACCESSORIES: "photo-1606760227091-3dd870d57081",
	HOME: "photo-1556228453-efd6c1ff04f6",
	SALE: "photo-1472851294608-062f824d29cc",
};

function getImageForProduct(product) {
	const name = product.name || "";
	for (const [keyword, photos] of Object.entries(IMAGE_MAP)) {
		if (name.includes(keyword)) {
			const idx = parseInt(product.id?.split("-").pop() || "0", 10);
			const photoId = photos[idx % photos.length];
			return `https://images.unsplash.com/${photoId}?q=80&w=800&auto=format&fit=crop&sig=${product.id}`;
		}
	}
	const defaultPhoto = CATEGORY_DEFAULTS[product.category] || CATEGORY_DEFAULTS.WOMEN;
	return `https://images.unsplash.com/${defaultPhoto}?q=80&w=800&auto=format&fit=crop&sig=${product.id}`;
}

const productsPath = path.join(__dirname, "public", "products.json");
const products = JSON.parse(fs.readFileSync(productsPath, "utf-8"));

let updated = 0;
products.forEach((p) => {
	const newImage = getImageForProduct(p);
	if (newImage !== p.image) {
		p.image = newImage;
		updated++;
	}
});

fs.writeFileSync(productsPath, JSON.stringify(products, null, "\t"));
console.log(`Updated ${updated} of ${products.length} product images.`);
