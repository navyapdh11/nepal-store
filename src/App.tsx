import { Player } from "@remotion/player";
import { Suspense, useEffect, useState, useRef } from "react";
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

	// Deterministic grid spanning for bento effect
	const getSpan = (i: number) => {
		if (i === 0) return "grid-column: span 2; grid-row: span 2;";
		if (i === 1) return "grid-column: span 2;";
		return "";
	};

	return (
		<div 
			ref={cardRef}
			className="bento-item bento-card-3d hd-lighting" 
			style={{ gridArea: getSpan(index) } as any}
			onMouseMove={handleMouseMove}
		>
			<div className="image-box glass">
				<img 
					src={product.image} 
					alt={product.name} 
					className="product-image micro-float" 
					loading="lazy"
				/>
			</div>
			<div className="info-box">
				<h3>{product.name}</h3>
				<p className="price">रू {(product.price).toLocaleString()}</p>
			</div>
		</div>
	);
};

function App() {
	const [category, setCategory] = useState("WOMEN");
	const [products, setProducts] = useState<Product[]>([]);
	const { user, login, logout, isAuthenticated } = useAuth();

	useEffect(() => {
		if (category !== "ACCOUNT") {
			fetch(`/api/products?category=${category}`)
				.then((res) => res.json())
				.then((data) => setProducts(Array.isArray(data) ? data : []))
				.catch(() => setProducts([]));
		}
	}, [category]);

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
				<section className="hero-section glass">
					<Suspense fallback={<div className="hero-placeholder" />}>
						<Player
							component={HeroBanner}
							durationInFrames={300}
							compositionWidth={1920}
							compositionHeight={1080}
							fps={30}
							style={{ width: "100%", aspectRatio: "21/9" }}
							inputProps={{ title: "NEPAL STORE", subtitle: `${category} 2026` }}
							autoPlay
							loop
						/>
					</Suspense>
				</section>

				<section className="featured-collections">
					<div className="section-header">
						<h2 className="micro-float">LifeWear {category}</h2>
						<div className="bento-badge glass">2026 Collection</div>
					</div>
					
					<div className="bento-container">
						{products.length > 0
							? products.map((product, i) => (
									<BentoCard key={product.id} product={product} index={i} />
							  ))
							: [1, 2, 3, 4, 5].map((i) => (
									<div key={i} className="bento-item skeleton glass" />
							  ))}
					</div>
				</section>
			</>
		);
	};

	return (
		<div className="app">
			<Header />
			<div className="nav-sticky-wrapper glass">
				<Navigation onCategoryChange={setCategory} />
			</div>
			<NudgeBar category={category} />
			<main className="home-main">{renderContent()}</main>
			<footer className="main-footer glass">
				<div className="footer-content">
					<p>&copy; 2026 NEPAL STORE. HIGH FIDELITY RENDER.</p>
				</div>
			</footer>
		</div>
	);
}

export default App;
