import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Breadcrumb } from "./Breadcrumb";
import { BentoCard } from "./BentoCard";
import { RemotionHero } from "./RemotionHero";
import { useProductModal } from "../context/ProductModalContext.tsx";
import { useCart } from "../context/CartContext.tsx";
import "./CategoryPage.css";

interface Product {
	id: string;
	name: string;
	description: string;
	price: number;
	category: string;
	image: string;
	sizes: string[];
	colors: { name: string; hex: string }[];
	isNew?: boolean;
	rating?: string;
	reviews?: number;
}

const categoryMeta: Record<string, { title: string; subtitle: string; seo: string; heroImg: string }> = {
	women: {
		title: "Women's Collection",
		subtitle: "Handcrafted cashmere, Dhaka textiles, and contemporary silhouettes — designed in Kathmandu.",
		seo: "Shop women's Nepalese fashion — cashmere pashminas, Dhaka kurtas, silk saris, and modern wear. Authentic Himalayan craftsmanship with free shipping over रू 5,000.",
		heroImg: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop",
	},
	men: {
		title: "Men's Collection",
		subtitle: "Daura Suruwal, cashmere knits, and sharp contemporary menswear from Nepal.",
		seo: "Shop men's Nepalese fashion — Daura Suruwal, cashmere sweaters, Dhaka topis, and modern menswear. Handcrafted in Kathmandu.",
		heroImg: "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=1200&auto=format&fit=crop",
	},
	sports: {
		title: "Active & Sports",
		subtitle: "Performance wear inspired by Himalayan endurance.",
		seo: "Active and sports wear from Nepal — performance fabrics, moisture-wicking designs, and mountain-tested durability.",
		heroImg: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1200&auto=format&fit=crop",
	},
	traditional: {
		title: "Traditional Heritage",
		subtitle: "Handcrafted garments celebrating centuries of Nepali textile artistry.",
		seo: "Authentic traditional Nepalese clothing — Daura Suruwal, Gunyo Cholo, Dhaka topis, and handwoven heritage garments from Kathmandu artisans.",
		heroImg: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1200&auto=format&fit=crop",
	},
	seasonal: {
		title: "Seasonal Picks",
		subtitle: "Curated for every season — from monsoon layers to winter cashmere.",
		seo: "Seasonal Nepalese fashion picks — winter cashmere, monsoon wraps, summer cotton. Curated collections from Kathmandu.",
		heroImg: "https://images.unsplash.com/photo-1490481651871-ab68ff25d43d?q=80&w=1200&auto=format&fit=crop",
	},
	kids: {
		title: "Kids & Youth",
		subtitle: "Comfortable, colorful, and crafted with care for the next generation.",
		seo: "Kids and youth clothing from Nepal — colorful tees, traditional outfits, and comfortable everyday wear for children.",
		heroImg: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?q=80&w=1200&auto=format&fit=crop",
	},
	baby: {
		title: "Baby Essentials",
		subtitle: "Soft, safe, and beautifully handcrafted for little ones.",
		seo: "Baby clothing and essentials from Nepal — soft cashmere booties, organic cotton onesies, and handcrafted baby gifts.",
		heroImg: "https://images.unsplash.com/photo-1522771930-78848d9293e8?q=80&w=1200&auto=format&fit=crop",
	},
	accessories: {
		title: "Accessories",
		subtitle: "Pashmina scarves, Dhaka bags, and handcrafted jewelry.",
		seo: "Nepalese accessories — cashmere scarves, pashmina shawls, Dhaka bags, handmade jewelry, and traditional crafts from Kathmandu.",
		heroImg: "https://images.unsplash.com/photo-1606760227091-3dd870d57081?q=80&w=1200&auto=format&fit=crop",
	},
	home: {
		title: "Home & Living",
		subtitle: "Handwoven textiles, artisan décor, and Himalayan comfort for your space.",
		seo: "Nepalese home décor — handwoven rugs, Dhaka cushions, cashmere throws, and artisan-crafted living essentials.",
		heroImg: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=1200&auto=format&fit=crop",
	},
	sale: {
		title: "Sale — Up to 50% Off",
		subtitle: "Limited-time offers on premium collections. While stocks last.",
		seo: "Sale on Nepalese fashion — up to 50% off cashmere, Dhaka textiles, and traditional wear. Limited stock, free shipping over रू 5,000.",
		heroImg: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=1200&auto=format&fit=crop",
	},
};

export const CategoryPage = () => {
	const { category } = useParams<{ category: string }>();
	const meta = categoryMeta[category ?? ""];
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [visible, setVisible] = useState(12);
	const [sortBy, setSortBy] = useState("default");
	const { openProduct } = useProductModal();
	const { addItem } = useCart();

	useEffect(() => {
		setLoading(true);
		setVisible(12);

		const fetchProducts = async () => {
			try {
				if (category === "traditional") {
					const res = await fetch("/traditional.json");
					const data = await res.json();
					setProducts(Array.isArray(data) ? data : []);
				} else {
					const cat = category?.toUpperCase();
					const res = await fetch(`/api/products?category=${cat}&limit=200`);
					const data = await res.json();
					setProducts(Array.isArray(data) ? data : []);
				}
			} catch {
				setProducts([]);
			} finally {
				setLoading(false);
			}
		};

		fetchProducts();
	}, [category]);

	const sorted = [...products].sort((a, b) => {
		if (sortBy === "price-asc") return a.price - b.price;
		if (sortBy === "price-desc") return b.price - a.price;
		if (sortBy === "rating") return Number(b.rating ?? 0) - Number(a.rating ?? 0);
		if (sortBy === "newest") return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
		return 0;
	});

	const shown = sorted.slice(0, visible);

	const loadMore = useCallback(() => {
		setVisible((v) => Math.min(v + 12, products.length));
	}, [products.length]);

	const handleProductClick = useCallback((product: Product) => {
		openProduct(product);
	}, [openProduct]);

	const handleQuickAdd = useCallback((product: Product) => {
		addItem({
			id: product.id,
			name: product.name,
			price: product.price,
			image: product.image,
			size: product.sizes[0],
			color: product.colors[0],
			quantity: 1,
		});
	}, [addItem]);

	if (!meta || !category) {
		return (
			<div className="not-found">
				<h1>Category Not Found</h1>
				<p>Go back to the <Link to="/">homepage</Link>.</p>
			</div>
		);
	}

	return (
		<div className="category-page">
			<Helmet>
				<title>{meta.title} — NEPAL STORE | Premium Nepalese Fashion</title>
				<meta name="description" content={meta.seo} />
				<meta property="og:title" content={meta.title} />
				<meta property="og:description" content={meta.seo} />
				<meta property="og:image" content={meta.heroImg} />
				<meta property="og:type" content="website" />
				<script type="application/ld+json">
					{JSON.stringify({
						"@context": "https://schema.org",
						"@type": "CollectionPage",
						name: meta.title,
						description: meta.seo,
						url: `https://nepal-store.onrender.com/${category}`,
					})}
				</script>
			</Helmet>

			<Breadcrumb items={[{ label: "Home", href: "/" }, { label: meta.title }]} />

			{/* Remotion animated hero */}
			<section className="category-hero">
				<RemotionHero title={meta.title} subtitle={meta.subtitle} backgroundImage={meta.heroImg} />
			</section>

			<section className="category-toolbar">
				<p className="product-count">{products.length} products</p>
				<div className="sort-controls">
					<label htmlFor="sort">Sort by:</label>
					<select id="sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort products">
						<option value="default">Featured</option>
						<option value="price-asc">Price: Low to High</option>
						<option value="price-desc">Price: High to Low</option>
						<option value="rating">Top Rated</option>
						<option value="newest">Newest</option>
					</select>
				</div>
			</section>

			<section className="category-grid">
				{loading
					? Array.from({ length: 8 }).map((_, i) => <div key={i} className="bento-skeleton skeleton pulse-anim" />)
					: shown.map((product, i) => (
							<BentoCard key={product.id} product={product} index={i} onClick={handleProductClick} />
						))}
			</section>

			{!loading && visible < products.length && (
				<div className="load-more-wrap">
					<button type="button" className="load-more-btn" onClick={loadMore}>
						Discover More
					</button>
				</div>
			)}

			{!loading && products.length === 0 && (
				<div className="empty-state">
					<p>No products found in this category.</p>
					<Link to="/">Browse all collections</Link>
				</div>
			)}

			{/* Quick add */}
			{!loading && products.length > 0 && (
				<div className="quick-add-wrap">
					<button type="button" className="quick-add-btn" onClick={() => handleQuickAdd(products[0])}>
						Quick Add: "{products[0].name}" — रू{products[0].price.toLocaleString()}
					</button>
				</div>
			)}

			{/* SEO content section */}
			<section className="category-seo-content">
				<h2>Why Choose NEPAL STORE for {meta.title.toLowerCase()}?</h2>
				<p>
					Every piece in our {category} collection is handcrafted by artisan partners across the Kathmandu Valley.
					We use premium materials — Himalayan cashmere (12-16 micron), handwoven Dhaka fabric, and organic cotton —
					to create garments that honor centuries of Nepali textile tradition while embracing contemporary design.
				</p>
				<p>
					Free shipping on orders over रू 5,000. 14-day returns. Every purchase supports 200+ artisan families.
				</p>
			</section>

			{/* Internal links */}
			<nav className="category-cross-links" aria-label="Explore more collections">
				<h3>Explore More</h3>
				<div className="cross-link-grid">
					{Object.entries(categoryMeta)
						.filter(([key]) => key !== category)
						.slice(0, 6)
						.map(([key, m]) => (
							<Link key={key} to={`/${key}`} className="cross-link-card">
								<div className="cross-link-img" style={{ backgroundImage: `url(${m.heroImg})` }} />
								<span>{m.title}</span>
							</Link>
						))}
				</div>
			</nav>
		</div>
	);
};
