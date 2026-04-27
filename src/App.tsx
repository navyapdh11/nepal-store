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

interface Color {
	name: string;
	hex: string;
}

interface Product {
	id: string;
	name: string;
	description: string;
	price: number;
	category: string;
	image: string;
	sizes: string[];
	colors: Color[];
	isNew: boolean;
	rating: string;
	reviews: number;
}

const ProductModal = ({ product, onClose, onAdd }: { product: Product; onClose: () => void, onAdd: () => void }) => {
	const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
	const [selectedColor, setSelectedColor] = useState(product.colors[0]);
	const [added, setAdded] = useState(false);

	const handleAdd = () => {
		setAdded(true);
		onAdd();
		setTimeout(() => setAdded(false), 2000);
	};

	return (
		<div className="modal-overlay glass-deep" onClick={onClose}>
			<div className="modal-content bento-card-3d hd-lighting" onClick={e => e.stopPropagation()}>
				<button className="close-btn" onClick={onClose}>✕</button>
				<div className="modal-grid">
					<div className="modal-image-container">
						<img src={product.image} alt={product.name} className="modal-image" />
						{product.isNew && <div className="badge-new">NEW</div>}
					</div>
					<div className="modal-details">
						<div className="modal-header">
							<h2>{product.name}</h2>
							<p className="modal-price">रू {product.price.toLocaleString()}</p>
						</div>
						
						<div className="modal-rating">
							<span className="stars">★★★★☆ {product.rating}</span>
							<span className="reviews">({product.reviews} Reviews)</span>
						</div>

						<p className="modal-description">{product.description}</p>

						{product.colors && product.colors.length > 0 && (
							<div className="selector-group">
								<h4>COLOR: <span className="selected-value">{selectedColor?.name}</span></h4>
								<div className="color-swatches">
									{product.colors.map(c => (
										<button 
											key={c.hex} 
											className={`color-swatch ${selectedColor?.hex === c.hex ? 'active' : ''}`}
											style={{ backgroundColor: c.hex }}
											onClick={() => setSelectedColor(c)}
											title={c.name}
										/>
									))}
								</div>
							</div>
						)}

						{product.sizes && product.sizes.length > 0 && (
							<div className="selector-group">
								<h4>SIZE: <span className="selected-value">{selectedSize}</span></h4>
								<div className="size-buttons">
									{product.sizes.map(s => (
										<button 
											key={s} 
											className={`size-btn ${selectedSize === s ? 'active' : ''}`}
											onClick={() => setSelectedSize(s)}
										>
											{s}
										</button>
									))}
								</div>
							</div>
						)}

						<div className="modal-actions">
							<button className={`add-to-cart-btn ${added ? 'added' : ''}`} onClick={handleAdd}>
								{added ? 'ADDED ✓' : 'ADD TO BAG'}
							</button>
							<button className="wishlist-btn">♡</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

const BentoCard = ({ product, index, onClick }: { product: Product; index: number; onClick: (p: Product) => void }) => {
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
			style={{ gridArea: getSpan(index), animationDelay: `${index * 0.05}s` } as any}
			onMouseMove={handleMouseMove}
			onClick={() => onClick(product)}
		>
			<div className="image-container">
				<img 
					src={product.image} 
					alt={product.name} 
					className="product-image-hd" 
					loading="lazy"
					onLoad={(e) => (e.currentTarget.style.opacity = "1")}
					style={{ opacity: 0, transition: "opacity 0.8s ease" }}
				/>
				<div className="image-overlay" />
				{product.isNew && <div className="badge-new-small">NEW</div>}
			</div>
			<div className="product-info-glass">
				<h3>{product.name}</h3>
				<div className="info-bottom">
					<p className="price">रू {product.price.toLocaleString()}</p>
					<div className="colors-preview">
						{product.colors && product.colors.slice(0, 3).map(c => (
							<span key={c.hex} className="color-dot" style={{ backgroundColor: c.hex }} />
						))}
						{product.colors && product.colors.length > 3 && <span className="color-plus">+</span>}
					</div>
				</div>
			</div>
		</div>
	);
};

function App() {
	const [category, setCategory] = useState("WOMEN");
	const [products, setProducts] = useState<Product[]>([]);
	const [displayCount, setDisplayCount] = useState(12);
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
	const [cartCount, setCartCount] = useState(0);
	const { user, login, logout, isAuthenticated } = useAuth();

	useEffect(() => {
		if (category !== "ACCOUNT") {
			const fetchProducts = async () => {
				setProducts([]); // Clear existing for cleaner transition
				try {
					const res = await fetch(`/api/products?category=${category}&limit=100`);
					if (!res.ok) throw new Error("API Offline");
					const data = await res.json();
					if (Array.isArray(data)) {
						setProducts(data);
					} else {
						throw new Error("Invalid Format");
					}
				} catch (err) {
					console.log("API not available, using high-fidelity static fallback...");
					try {
						const fallbackRes = await fetch("/products.json");
						const fallbackData = await fallbackRes.json();
						if (Array.isArray(fallbackData)) {
							const filtered = fallbackData.filter(p => p.category === category);
							setProducts(filtered);
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
				<section className="hero-section main-hero reveal-anim">
					<Suspense fallback={<div className="hero-skeleton" />}>
						<Player
							component={HeroBanner}
							durationInFrames={300}
							compositionWidth={1920}
							compositionHeight={1080}
							fps={30}
							style={{ width: "100%", aspectRatio: "21/9" }}
							inputProps={{ title: "NEPAL STORE", subtitle: `PREMIUM ${category} 2026` }}
							autoPlay
							loop
						/>
					</Suspense>
				</section>

				<section className="featured-collections-v2">
					<div className="section-intro">
						<h2 className="reveal-text">Explore {category}</h2>
						<p className="subtitle">50+ Photorealistic artifacts engineered for the modern Nepalese athlete.</p>
					</div>
					
					<div className="bento-grid-v2">
						{visibleProducts.length > 0
							? visibleProducts.map((product, i) => (
									<BentoCard key={product.id} product={product} index={i} onClick={setSelectedProduct} />
							  ))
							: Array.from({ length: 12 }).map((_, i) => (
									<div key={i} className="bento-skeleton glass-card pulse-anim" />
							  ))}
					</div>

					{displayCount < products.length && (
						<div className="load-more-container">
							<button className="load-more-btn glass-card-dark" onClick={loadMore}>
								DISCOVER MORE
							</button>
						</div>
					)}
				</section>
				
				{selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAdd={() => setCartCount(c => c + 1)} />}
			</>
		);
	};

	return (
		<div className="app-v2">
			<Header cartCount={cartCount} />
			<div className="sticky-nav-v2 glass">
				<Navigation onCategoryChange={setCategory} />
			</div>
			<NudgeBar category={category} />
			<main className="content-area">{renderContent()}</main>
			<footer className="footer-v2 glass">
				<div className="footer-grid">
					<div className="footer-col">
						<h4>NEPAL STORE</h4>
						<p>Revolutionizing retail with 2026 Spatial UX and AI Orchestration.</p>
					</div>
					<div className="footer-col">
						<h4>COLLECTIONS</h4>
						<span>Women</span>
						<span>Men</span>
						<span>Sports</span>
						<span>Kids</span>
					</div>
					<div className="footer-col">
						<h4>LEGAL</h4>
						<span>Privacy</span>
						<span>Terms</span>
						<span>Ethics</span>
					</div>
				</div>
				<div className="footer-bottom">
					<p>&copy; 2026 NEPAL STORE. HIGH FIDELITY PHOTOREALISM ENABLED.</p>
				</div>
			</footer>
		</div>
	);
}

export default App;
