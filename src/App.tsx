import { Player } from "@remotion/player";
import { Suspense, useEffect, useState, useRef, useMemo } from "react";
import { AuthView } from "./components/AuthView";
import { Dashboard } from "./components/Dashboard";
import { Header } from "./components/Header";
import { NudgeBar } from "./components/NudgeBar";
import { PricingMatrix } from "./components/enterprise/PricingMatrix";
import { QuotingEngine } from "./components/enterprise/QuotingEngine";
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
					</div>
				</div>
			</div>
		</div>
	);
};

function App() {
	const [view, setView] = useState<string>("WOMEN");
	const [products, setProducts] = useState<Product[]>([]);
	const [displayCount, setDisplayCount] = useState(12);
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
	const [cartCount, setCartCount] = useState(0);
	const { user, login, logout, isAuthenticated } = useAuth();

	const isEnterpriseView = ["Corporate Matrix", "Government Tiers", "Industrial Quoting", "Sanitization Logs", "Audit Trails", "Infrastructure Guard", "High-Throughput Analytics"].includes(view);

	useEffect(() => {
		const shopCategories = ["WOMEN", "MEN", "SPORTS", "TRADITIONAL", "SEASONAL", "KIDS", "BABY", "ACCESSORIES", "HOME", "SALE"];
		if (shopCategories.includes(view)) {
			const fetchProducts = async () => {
				setProducts([]);
				try {
					const res = await fetch(`/api/products?category=${view}&limit=100`);
					const data = await res.json();
					if (Array.isArray(data)) setProducts(data);
				} catch (err) {
					const fallbackRes = await fetch("/products.json");
					const fallbackData = await fallbackRes.json();
					if (Array.isArray(fallbackData)) {
						setProducts(fallbackData.filter(p => p.category === view));
					}
				}
				setDisplayCount(12);
			};
			fetchProducts();
		}
	}, [view]);

	const visibleProducts = useMemo(() => products.slice(0, displayCount), [products, displayCount]);

	const renderContent = () => {
		if (view === "ACCOUNT") {
			return isAuthenticated && user ? (
				<Dashboard user={user} onLogout={logout} />
			) : (
				<AuthView onLoginSuccess={login} />
			);
		}

		if (isEnterpriseView) {
			return (
				<div className="enterprise-container">
					<PricingMatrix />
					<QuotingEngine />
				</div>
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
							inputProps={{ title: "NEPAL STORE", subtitle: `PREMIUM ${view} COLLECTION 2026` }}
							autoPlay
							loop
						/>
					</Suspense>
				</section>

				<section className="featured-collections-v2">
					<div className="section-intro">
						<h2 className="reveal-text">Explore {view}</h2>
						<p className="subtitle">Sophisticated artifacts engineered for high-fidelity living.</p>
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
							<button className="load-more-btn glass-card-dark" onClick={() => setDisplayCount(c => c + 12)}>
								DISCOVER MORE
							</button>
						</div>
					)}
				</section>
			</>
		);
	};

	return (
		<div className="app-v2">
			<Header cartCount={cartCount} onCategoryChange={setView} />
			<NudgeBar category={view} />
			<main className="content-area">{renderContent()}</main>
			<footer className="footer-v2 glass">
				<div className="footer-grid">
					<div className="footer-col">
						<h4>NEPAL STORE ENTERPRISE</h4>
						<p>Revolutionizing national infrastructure with 2026 Spatial UX.</p>
					</div>
					<div className="footer-col">
						<h4>COLLECTIONS</h4>
						<span onClick={() => setView("WOMEN")}>Women</span>
						<span onClick={() => setView("MEN")}>Men</span>
						<span onClick={() => setView("SPORTS")}>Sports</span>
						<span onClick={() => setView("TRADITIONAL")}>Traditional</span>
					</div>
					<div className="footer-col">
						<h4>ENTERPRISE</h4>
						<span onClick={() => setView("Corporate Matrix")}>Pricing Matrix</span>
						<span onClick={() => setView("Industrial Quoting")}>Quoting Engine</span>
						<span onClick={() => setView("Sanitization Logs")}>Sanitization Logs</span>
					</div>
				</div>
				<div className="footer-bottom">
					<p>&copy; 2026 NEPAL STORE. AUDIT TRAIL ENABLED.</p>
				</div>
			</footer>
			{selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAdd={() => setCartCount(c => c + 1)} />}
		</div>
	);
}

export default App;
