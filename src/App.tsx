import { Player } from "@remotion/player";
import { useEffect, useState } from "react";
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
}

function App() {
	const [category, setCategory] = useState("WOMEN");
	const [products, setProducts] = useState<Product[]>([]);
	const { user, login, logout, isAuthenticated } = useAuth();

	useEffect(() => {
		if (category !== "ACCOUNT") {
			fetch(`/api/products?category=${category}`)
				.then((res) => res.json())
				.then(setProducts)
				.catch(console.error);
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
				<section className="hero-section">
					<Player
						component={HeroBanner}
						durationInFrames={300}
						compositionWidth={1920}
						compositionHeight={1080}
						fps={30}
						style={{
							width: "100%",
							aspectRatio: "16/9",
						}}
						inputProps={{
							title: "NEPAL STORE",
							subtitle: `${category} LifeWear Collection`,
						}}
						autoPlay
						loop
					/>
				</section>

				<section className="featured-collections">
					<h2>Featured for {category}</h2>
					<div className="grid product-grid">
						{products.length > 0
							? products.map((product) => (
									<div key={product.id} className="product-card">
										<div className="image-box">
											<div className="placeholder-img" />
										</div>
										<div className="info-box">
											<h3>{product.name}</h3>
											<p className="price">${product.price.toFixed(2)}</p>
										</div>
									</div>
								))
							: [1, 2, 3, 4].map((i) => (
									<div key={i} className="product-card-placeholder">
										<div className="image-box" />
										<div className="info-box">
											<div className="line" />
											<div className="line short" />
										</div>
									</div>
								))}
					</div>
				</section>
			</>
		);
	};

	return (
		<div className="app">
			<Header />
			<Navigation onCategoryChange={setCategory} />
			<NudgeBar category={category} />

			<main className="home-main">{renderContent()}</main>

			<footer className="main-footer">
				<p>&copy; 2026 NEPAL STORE. Inspired by LifeWear.</p>
			</footer>
		</div>
	);
}

export default App;
