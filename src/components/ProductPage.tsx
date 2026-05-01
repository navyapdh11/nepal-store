import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Breadcrumb } from "./Breadcrumb";
import { useCart } from "../context/CartContext.tsx";
import "./ProductPage.css";

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

export const ProductPage = () => {
	const { category, productId } = useParams<{ category: string; productId: string }>();
	const [product, setProduct] = useState<Product | null>(null);
	const [loading, setLoading] = useState(true);
	const [selectedSize, setSelectedSize] = useState("");
	const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string } | null>(null);
	const [added, setAdded] = useState(false);
	const { addItem } = useCart();

	useEffect(() => {
		setLoading(true);
		const fetchProduct = async () => {
			try {
				const catUpper = category?.toUpperCase();
				const res = await fetch(`/api/products?category=${catUpper}&limit=200`);
				const data = await res.json();
				const found = Array.isArray(data) ? data.find((p: Product) => p.id === productId) : null;
				setProduct(found ?? null);
				if (found) {
					setSelectedSize(found.sizes[0] ?? "");
					setSelectedColor(found.colors[0] ?? null);
				}
			} catch {
				setProduct(null);
			} finally {
				setLoading(false);
			}
		};
		fetchProduct();
	}, [category, productId]);

	const handleAdd = () => {
		if (!product) return;
		setAdded(true);
		addItem({
			id: product.id,
			name: product.name,
			price: product.price,
			image: product.image,
			size: selectedSize,
			color: selectedColor ?? undefined,
			quantity: 1,
		});
		setTimeout(() => setAdded(false), 2000);
	};

	if (loading) return <div className="product-page-loading"><p>Loading...</p></div>;
	if (!product) {
		return (
			<div className="not-found">
				<h1>Product Not Found</h1>
				<p>
					Go back to <Link to={`/${category}`}>this category</Link> or <Link to="/">browse all</Link>.
				</p>
			</div>
		);
	}

	const catLabel = product.category.toLowerCase();

	return (
		<div className="product-page">
			<Helmet>
				<title>{product.name} — NEPAL STORE | Premium Nepalese Fashion</title>
				<meta name="description" content={`${product.description} रू${product.price.toLocaleString()} — ${product.category}. Free shipping over रू 5,000.`} />
				<meta property="og:title" content={product.name} />
				<meta property="og:description" content={product.description} />
				<meta property="og:image" content={product.image} />
				<meta property="og:type" content="product" />
				<meta property="product:price:amount" content={String(product.price)} />
				<meta property="product:price:currency" content="NPR" />
				<meta name="twitter:card" content="summary_large_image" />
				<script type="application/ld+json">
					{JSON.stringify({
						"@context": "https://schema.org",
						"@type": "Product",
						name: product.name,
						description: product.description,
						image: product.image,
						brand: { "@type": "Brand", name: "NEPAL STORE" },
						offers: {
							"@type": "Offer",
							price: product.price,
							priceCurrency: "NPR",
							availability: "https://schema.org/InStock",
							seller: { "@type": "Organization", name: "NEPAL STORE" },
						},
						aggregateRating: product.rating
							? {
									"@type": "AggregateRating",
									ratingValue: product.rating,
									reviewCount: product.reviews ?? 0,
								}
							: undefined,
					})}
				</script>
				<script type="application/ld+json">
					{JSON.stringify({
						"@context": "https://schema.org",
						"@type": "BreadcrumbList",
						itemListElement: [
							{ "@type": "ListItem", position: 1, name: "Home", item: "https://nepal-store.onrender.com/" },
							{ "@type": "ListItem", position: 2, name: product.category, item: `https://nepal-store.onrender.com/${catLabel}` },
							{ "@type": "ListItem", position: 3, name: product.name, item: `https://nepal-store.onrender.com/${catLabel}/${product.id}` },
						],
					})}
				</script>
			</Helmet>

			<Breadcrumb
				items={[
					{ label: "Home", href: "/" },
					{ label: product.category, href: `/${catLabel}` },
					{ label: product.name },
				]}
			/>

			<div className="product-layout">
				<div className="product-image-section">
					<img
						src={product.image}
						alt={product.name}
						width="600"
						height="750"
						style={{ aspectRatio: "4/5", objectFit: "cover", width: "100%" }}
					/>
				</div>

				<div className="product-details">
					{product.isNew && <span className="new-badge-inline">NEW</span>}
					<h1 className="font-display">{product.name}</h1>

					{product.rating && (
						<div className="product-rating">
							<span>★ {product.rating}</span>
							{product.reviews && <span>({product.reviews} reviews)</span>}
						</div>
					)}

					<div className="product-price">रू{product.price.toLocaleString()}</div>

					<p className="product-description">{product.description}</p>

					{/* Size selector */}
					<div className="selector-group">
						<h4>Size</h4>
						<div className="size-options">
							{product.sizes.map((s) => (
								<button
									key={s}
									type="button"
									className={`size-btn ${selectedSize === s ? "selected" : ""}`}
									onClick={() => setSelectedSize(s)}
								>
									{s}
								</button>
							))}
						</div>
					</div>

					{/* Color selector */}
					<div className="selector-group">
						<h4>Color</h4>
						<div className="color-options">
							{product.colors.map((c) => (
								<button
									key={c.name}
									type="button"
									className={`color-btn ${selectedColor?.name === c.name ? "selected" : ""}`}
									onClick={() => setSelectedColor(c)}
									style={{ backgroundColor: c.hex }}
									aria-label={c.name}
									title={c.name}
								/>
							))}
						</div>
						{selectedColor && <span className="selected-color-name">{selectedColor.name}</span>}
					</div>

					<button type="button" className="add-to-bag-btn" onClick={handleAdd}>
						{added ? "✓ Added to Bag" : "Add to Bag"}
					</button>

					<div className="product-perks">
						<div className="perk">🚚 Free shipping over रू 5,000</div>
						<div className="perk">↩️ 14-day returns</div>
						<div className="perk">🇳🇵 Handcrafted in Kathmandu</div>
					</div>
				</div>
			</div>
		</div>
	);
};
