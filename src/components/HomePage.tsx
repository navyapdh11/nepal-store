import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Breadcrumb } from "./Breadcrumb";
import "./HomePage.css";

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

const categories = [
	{ key: "women", label: "Women", img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop" },
	{ key: "men", label: "Men", img: "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=600&auto=format&fit=crop" },
	{ key: "traditional", label: "Traditional", img: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=600&auto=format&fit=crop" },
	{ key: "sports", label: "Sports", img: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop" },
	{ key: "seasonal", label: "Seasonal", img: "https://images.unsplash.com/photo-1490481651871-ab68ff25d43d?q=80&w=600&auto=format&fit=crop" },
	{ key: "kids", label: "Kids", img: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?q=80&w=600&auto=format&fit=crop" },
	{ key: "baby", label: "Baby", img: "https://images.unsplash.com/photo-1522771930-78848d9293e8?q=80&w=600&auto=format&fit=crop" },
	{ key: "accessories", label: "Accessories", img: "https://images.unsplash.com/photo-1606760227091-3dd870d57081?q=80&w=600&auto=format&fit=crop" },
	{ key: "home", label: "Home & Living", img: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=600&auto=format&fit=crop" },
	{ key: "sale", label: "Sale", img: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=600&auto=format&fit=crop" },
];

export const HomePage = ({ onProductClick }: { onProductClick: (p: Product) => void }) => {
	const [featured, setFeatured] = useState<Product[]>([]);

	useEffect(() => {
		const fetchFeatured = async () => {
			try {
				const res = await fetch("/api/products?limit=8");
				const data = await res.json();
				setFeatured(Array.isArray(data) ? data.slice(0, 8) : []);
			} catch {
				setFeatured([]);
			}
		};
		fetchFeatured();
	}, []);

	return (
		<div className="home-page">
			<Helmet>
				<title>NEPAL STORE | Authentic Nepalese Fashion — Cashmere, Dhaka & Traditional Wear</title>
				<meta
					name="description"
					content="Shop authentic Nepalese clothing online — handcrafted cashmere pashminas, Dhaka textiles, traditional wear, and modern fashion. Direct from Kathmandu artisans. Free shipping over रू 5,000."
				/>
			</Helmet>

			<Breadcrumb items={[{ label: "Home" }]} />

			{/* Hero */}
			<section className="home-hero">
				<div
					className="home-hero-bg"
					style={{
						backgroundImage:
							"url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1920&auto=format&fit=crop)",
					}}
				/>
				<div className="home-hero-content">
					<h1 className="font-display text-gradient">Handcrafted in the Himalayas</h1>
					<p className="lead">
						Authentic Nepalese fashion — cashmere, Dhaka textiles, and contemporary wear.
						Direct from 200+ artisan families in Kathmandu.
					</p>
					<div className="hero-ctas">
						<Link to="/women" className="hero-btn primary">Shop Women</Link>
						<Link to="/men" className="hero-btn secondary">Shop Men</Link>
					</div>
				</div>
			</section>

			{/* Category Grid */}
			<section className="home-categories">
				<h2 className="font-display section-title">Explore Collections</h2>
				<div className="category-grid">
					{categories.map((cat) => (
						<Link key={cat.key} to={`/${cat.key}`} className="category-tile">
							<div className="category-tile-img" style={{ backgroundImage: `url(${cat.img})` }} />
							<div className="category-tile-overlay">
								<h3>{cat.label}</h3>
							</div>
						</Link>
					))}
				</div>
			</section>

			{/* Featured Products */}
			{featured.length > 0 && (
				<section className="home-featured">
					<h2 className="font-display section-title">Featured</h2>
					<div className="featured-grid">
						{featured.map((product) => (
							<article
								key={product.id}
								className="featured-card"
								onClick={() => onProductClick(product)}
							>
								<img
									src={product.image}
									alt={product.name}
									loading="lazy"
									width="300"
									height="375"
									style={{ aspectRatio: "4/5", objectFit: "cover" }}
								/>
								<div className="featured-info">
									<h4>{product.name}</h4>
									<span className="featured-price">रू{product.price.toLocaleString()}</span>
								</div>
							</article>
						))}
					</div>
				</section>
			)}

			{/* Brand story teaser */}
			<section className="home-story">
				<div className="story-content">
					<h2 className="font-display">Rooted in Nepal, Worn Worldwide</h2>
					<p>
						For over a decade, we've partnered with artisan families across the Kathmandu Valley to bring
						handcrafted cashmere, Dhaka textiles, and traditional garments to customers in 40+ countries.
					</p>
					<Link to="/about" className="story-link">Read our story →</Link>
				</div>
			</section>
		</div>
	);
};
