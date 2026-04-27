import { Player } from "@remotion/player";
import { Suspense, useEffect, useState, useRef, useMemo } from "react";
import { AuthView } from "./components/AuthView";
import { Dashboard } from "./components/Dashboard";
import { Header } from "./components/Header";
import { Navigation } from "./components/Navigation";
import { NudgeBar } from "./components/NudgeBar";
import { useAuth } from "./lib/auth";
import { HeroBanner } from "./remotion/compositions/HeroBanner";
import "./App.css";

interface Product {
	id: string;
	name: string;
	price: number;
	category: string;
	image: string;
}

const BentoCard = ({ product, index }: { product: Product; index: number }) => {
	const cardRef = useRef<HTMLDivElement>(null);

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!cardRef.current) return;
		const rect = cardRef.current.getBoundingClientRect();
		const x = ((e.clientX - rect.left) / rect.width) * 100;
		const y = ((e.clientY - rect.top) / rect.height) * 100;
		cardRef.current.style.setProperty("--mouse-x", `${x}%`);
		cardRef.current.style.setProperty("--mouse-y", `${y}%`);
	};

	const getSpan = (i: number) => {
		const mod = i % 10;
		if (mod === 0) return "grid-column: span 2; grid-row: span 2;";
		if (mod === 3 || mod === 7) return "grid-column: span 2;";
		return "";
	};

	return (
		<div 
			ref={cardRef}
			className="bento-item bento-card-3d hd-lighting glass-card" 
			style={{ gridArea: getSpan(index) } as any}
			onMouseMove={handleMouseMove}
		>
			<div className="image-container">
				<img 
					src={product.image} 
					alt={product.name} 
					className="product-image-hd" 
					loading="lazy"
				/>
				<div className="image-overlay" />
			</div>
			<div className="product-info-glass">
				<h3>{product.name}</h3>
				<p className="price">रू {product.price.toLocaleString()}</p>
				<button className="add-to-cart-minimal">ADD TO BAG</button>
			</div>
		</div>
	);
};

function App() {
	const [category, setCategory] = useState("WOMEN");
	const [products, setProducts] = useState<Product[]>([]);
	const [displayCount, setDisplayCount] = useState(12);
	const { user, login, logout, isAuthenticated } = useAuth();

	useEffect(() => {
		if (category !== "ACCOUNT") {
			const fetchProducts = async () => {
				try {
					const res = await fetch(`/api/products?category=${category}&limit=100`);
					const data = await res.json();
					if (Array.isArray(data)) {
						setProducts(data);
					} else {
						throw new Error("Invalid API response");
					}
				} catch (err) {
					console.log("API not available, using static fallback...");
					try {
						const fallbackRes = await fetch("/products.json");
						const fallbackData = await fallbackRes.json();
						if (Array.isArray(fallbackData)) {
							setProducts(fallbackData.filter(p => p.category === category));
						}
					} catch (fallbackErr) {
						console.error("Critical: Could not load products", fallbackErr);
						setProducts([]);
					}
				}
				setDisplayCount(12);
			};
			fetchProducts();
		}
	}, [category]);

	const visibleProducts = useMemo(() => products.slice(0, displayCount), [products, displayCount]);

	const loadMore = () => setDisplayCount(prev => prev + 12);

	const renderContent = () => {
		if (category === "ACCOUNT") {
			return isAuthenticated && user ? (
				<Dashboard user={user} onLogout={logout} />
			) : (
				<AuthView onLoginSuccess={login} />
			);
		}

		return (
			<>
				<section className="hero-section main-hero">
					<Suspense fallback={<div className="hero-skeleton" />}>
						<Player
							component={HeroBanner}
							durationInFrames={300}
							compositionWidth={1920}
							compositionHeight={1080}
							fps={30}
							style={{ width: "100%", aspectRatio: "21/9" }}
							inputProps={{ title: "NEPAL STORE", subtitle: `PREMIUM ${category} COLLECTION 2026` }}
							autoPlay
							loop
						/>
					</Suspense>
				</section>

				<section className="featured-collections-v2">
					<div className="section-intro">
						<h2 className="reveal-text">Explore {category}</h2>
						<p className="subtitle">100+ Hand-curated photorealistic items for your lifestyle.</p>
					</div>
					
					<div className="bento-grid-v2">
						{visibleProducts.length > 0
							? visibleProducts.map((product, i) => (
									<BentoCard key={product.id} product={product} index={i} />
							  ))
							: Array.from({ length: 8 }).map((_, i) => (
									<div key={i} className="bento-skeleton glass-card" />
							  ))}
					</div>

					{displayCount < products.length && (
						<div className="load-more-container">
							<button className="load-more-btn glass" onClick={loadMore}>
								EXPLORE MORE ARTIFACTS
							</button>
						</div>
					)}
				</section>
			</>
		);
	};

	return (
		<div className="app-v2">
			<Header />
			<div className="sticky-nav-v2 glass">
				<Navigation onCategoryChange={setCategory} />
			</div>
			<NudgeBar category={category} />
			<main className="content-area">{renderContent()}</main>
			<footer className="footer-v2 glass">
				<div className="footer-grid">
					<div className="footer-col">
						<h4>NEPAL STORE</h4>
						<p>Redefining Nepalese retail through AI and Spatial Design.</p>
					</div>
					<div className="footer-col">
						<h4>COLLECTIONS</h4>
						<span>Women</span>
						<span>Men</span>
						<span>Kids</span>
						<span>Baby</span>
					</div>
				</div>
				<div className="footer-bottom">
					<p>&copy; 2026 NEPAL STORE. ALL ASSETS PHOTOREALISTIC HD.</p>
				</div>
			</footer>
		</div>
	);
}

export default App;
