import { Player } from "@remotion/player";
import { Suspense, useEffect, useState, useRef, useMemo, useCallback } from "react";
import { AuthView } from "./components/AuthView";
import { Dashboard } from "./components/Dashboard";
import { Header } from "./components/Header";
import { NudgeBar } from "./components/NudgeBar";
import { PricingMatrix } from "./components/enterprise/PricingMatrix";
import { QuotingEngine } from "./components/enterprise/QuotingEngine";
import { SanitizationLogs, AuditTrails } from "./components/enterprise/EnterpriseViews";
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

/* ——— Product Modal ——— */
const ProductModal = ({ product, onClose, onAdd }: { product: Product; onClose: () => void; onAdd: () => void }) => {
	const [selectedSize, setSelectedSize] = useState(product.sizes[0] ?? "M");
	const [selectedColor, setSelectedColor] = useState(product.colors[0] ?? { name: "", hex: "#000" });
	const [added, setAdded] = useState(false);

	const handleAdd = () => {
		setAdded(true);
		onAdd();
		setTimeout(() => setAdded(false), 2000);
	};

	return (
		<div className="modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
			<div className="modal-content" onClick={e => e.stopPropagation()}>
				<button type="button" className="close-btn" onClick={onClose} aria-label="Close Modal">✕</button>
				<div className="modal-grid">
					<div className="modal-image-container">
						<img src={product.image} alt={product.name} className="modal-image" loading="lazy" />
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
								<h4>Color — <span className="selected-value">{selectedColor?.name}</span></h4>
								<div className="color-swatches">
									{product.colors.map(c => (
										<button
											key={c.hex}
											type="button"
											className={`color-swatch ${selectedColor?.hex === c.hex ? "active" : ""}`}
											style={{ backgroundColor: c.hex }}
											onClick={() => setSelectedColor(c)}
											title={c.name}
											aria-label={`Select color ${c.name}`}
										/>
									))}
								</div>
							</div>
						)}
						{product.sizes && product.sizes.length > 0 && (
							<div className="selector-group">
								<h4>Size — <span className="selected-value">{selectedSize}</span></h4>
								<div className="size-buttons">
									{product.sizes.map(s => (
										<button
											key={s}
											type="button"
											className={`size-btn ${selectedSize === s ? "active" : ""}`}
											onClick={() => setSelectedSize(s)}
											aria-label={`Select size ${s}`}
										>
											{s}
										</button>
									))}
								</div>
							</div>
						)}
						<div className="modal-actions">
							<button type="button" className={`add-to-cart-btn ${added ? "added" : ""}`} onClick={handleAdd}>
								{added ? "Added ✓" : "Add to Bag"}
							</button>
							<button type="button" className="wishlist-btn" aria-label="Add to Wishlist">♡</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

/* ——— Bento Card with 3D Tilt ——— */
const BentoCard = ({ product, index, onClick }: { product: Product; index: number; onClick: (p: Product) => void }) => {
	const cardRef = useRef<HTMLDivElement>(null);

	const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
		if (!cardRef.current) return;
		const rect = cardRef.current.getBoundingClientRect();
		const x = ((e.clientX - rect.left) / rect.width) * 100;
		const y = ((e.clientY - rect.top) / rect.height) * 100;
		const centerX = rect.width / 2;
		const centerY = rect.height / 2;
		const rotateX = ((e.clientY - rect.top - centerY) / centerY) * -5;
		const rotateY = ((e.clientX - rect.left - centerX) / centerX) * 5;
		cardRef.current.style.setProperty("--mouse-x", `${x}%`);
		cardRef.current.style.setProperty("--mouse-y", `${y}%`);
		cardRef.current.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
	}, []);

	const handleMouseLeave = useCallback(() => {
		if (!cardRef.current) return;
		cardRef.current.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0px)";
	}, []);

	const getSpan = (i: number): string => {
		const mod = i % 10;
		if (mod === 0) return "grid-column: span 2; grid-row: span 2;";
		if (mod === 3 || mod === 7) return "grid-column: span 2;";
		return "";
	};

	const staggerClass = `stagger-${Math.min(index + 1, 12)}`;

	return (
		<div
			ref={cardRef}
			role="button"
			tabIndex={0}
			className={`bento-item bento-card-3d hd-lighting glass-card ${staggerClass}`}
			style={getSpan(index) ? { gridArea: getSpan(index) } : undefined}
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
			onClick={() => onClick(product)}
			onKeyDown={e => e.key === "Enter" && onClick(product)}
		>
			<div className="image-container">
				<img
					src={product.image}
					alt={product.name}
					className="product-image-hd"
					loading="lazy"
					onLoad={e => { (e.currentTarget as HTMLImageElement).style.opacity = "1"; }}
					style={{ opacity: 0, transition: "opacity 0.8s ease" }}
				/>
				{product.isNew && <div className="badge-new-small">NEW</div>}
			</div>
			<div className="product-info-glass">
				<h3>{product.name}</h3>
				<div className="info-bottom">
					<p className="price">रू {product.price.toLocaleString()}</p>
					<div className="colors-preview">
						{product.colors?.slice(0, 3).map(c => (
							<span key={c.hex} className="color-dot" style={{ backgroundColor: c.hex }} />
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

/* ——— Main App ——— */
function App() {
	const [view, setView] = useState<string>("WOMEN");
	const [products, setProducts] = useState<Product[]>([]);
	const [displayCount, setDisplayCount] = useState(12);
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
	const [cartCount, setCartCount] = useState(0);
	const [loading, setLoading] = useState(false);
	const { user, login, logout, isAuthenticated } = useAuth();

	const isEnterpriseView = useMemo(
		() => ["Corporate Matrix", "Government Tiers", "Industrial Quoting", "Sanitization Logs", "Audit Trails", "Infrastructure Guard", "High-Throughput Analytics"].includes(view),
		[view]
	);

	useEffect(() => {
		const shopCategories = ["WOMEN", "MEN", "SPORTS", "TRADITIONAL", "SEASONAL", "KIDS", "BABY", "ACCESSORIES", "HOME", "SALE"];
		if (shopCategories.includes(view)) {
			let cancelled = false;
			const fetchProducts = async () => {
				setLoading(true);
				setProducts([]);
				try {
					const res = await fetch(`/api/products?category=${view}&limit=100`);
					const data = await res.json();
					if (!cancelled && Array.isArray(data)) setProducts(data);
				} catch {
					try {
						const fallbackRes = await fetch("/products.json");
						const fallbackData = await fallbackRes.json();
						if (!cancelled && Array.isArray(fallbackData)) {
							setProducts(fallbackData.filter((p: Product) => p.category === view));
						}
					} catch {
						if (!cancelled) setProducts([]);
					}
				}
				setDisplayCount(12);
				setLoading(false);
			};
			fetchProducts();
			return () => { cancelled = true; };
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
					{view === "Corporate Matrix" && <PricingMatrix />}
					{view === "Industrial Quoting" && <QuotingEngine />}
					{view === "Sanitization Logs" && <SanitizationLogs />}
					{view === "Audit Trails" && <AuditTrails />}
					{!["Corporate Matrix", "Industrial Quoting", "Sanitization Logs", "Audit Trails"].includes(view) && (
						<div style={{ padding: "8rem 2rem", textAlign: "center" }}>
							<h2 className="font-display" style={{ fontSize: "var(--text-3xl)" }}>{view}</h2>
							<p style={{ color: "var(--color-text-secondary)", marginTop: "1rem" }}>Enterprise HD rendering in progress...</p>
						</div>
					)}
				</div>
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
							inputProps={{ title: "NEPAL STORE", subtitle: `Premium ${view} Collection 2026` }}
							autoPlay
							loop
						/>
					</Suspense>
				</section>

				<section className="featured-collections-v2">
					<div className="section-intro">
						<h2 className="font-display reveal-text">Explore {view}</h2>
						<p className="subtitle">Sophisticated artifacts engineered for high-fidelity living.</p>
					</div>

					<div className="bento-grid-v2">
						{loading
							? Array.from({ length: 8 }).map((_, i) => (
									<div key={i} className="bento-skeleton skeleton pulse-anim" />
							  ))
							: visibleProducts.length > 0
							? visibleProducts.map((product, i) => (
									<BentoCard key={product.id} product={product} index={i} onClick={setSelectedProduct} />
							  ))
							: !loading && (
									<div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "4rem 0" }}>
										<p style={{ fontSize: "var(--text-xl)", color: "var(--color-text-tertiary)" }}>
											No products found for this category.
										</p>
									</div>
							  )}
					</div>

					{displayCount < products.length && (
						<div className="load-more-container">
							<button type="button" className="load-more-btn glass-card-dark" onClick={() => setDisplayCount(c => c + 12)}>
								Discover More
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
			<footer className="footer-v2">
				<div className="footer-grid">
					<div className="footer-col">
						<h4>Nepal Store Enterprise</h4>
						<p>Revolutionizing national commerce with spatial UX and 2026-grade design systems.</p>
					</div>
					<div className="footer-col">
						<h4>Collections</h4>
						<span role="button" tabIndex={0} onClick={() => setView("WOMEN")}>Women</span>
						<span role="button" tabIndex={0} onClick={() => setView("MEN")}>Men</span>
						<span role="button" tabIndex={0} onClick={() => setView("SPORTS")}>Sports</span>
						<span role="button" tabIndex={0} onClick={() => setView("TRADITIONAL")}>Traditional</span>
						<span role="button" tabIndex={0} onClick={() => setView("SEASONAL")}>Seasonal</span>
					</div>
					<div className="footer-col">
						<h4>Enterprise</h4>
						<span role="button" tabIndex={0} onClick={() => setView("Corporate Matrix")}>Pricing Matrix</span>
						<span role="button" tabIndex={0} onClick={() => setView("Industrial Quoting")}>Quoting Engine</span>
						<span role="button" tabIndex={0} onClick={() => setView("Sanitization Logs")}>Sanitization Logs</span>
						<span role="button" tabIndex={0} onClick={() => setView("Audit Trails")}>Audit Trails</span>
					</div>
				</div>
				<div className="footer-bottom">
					<p>© 2026 Nepal Store. All rights reserved.</p>
				</div>
			</footer>
			{selectedProduct && (
				<ProductModal
					product={selectedProduct}
					onClose={() => setSelectedProduct(null)}
					onAdd={() => setCartCount(c => c + 1)}
				/>
			)}
		</div>
	);
}

export default App;
