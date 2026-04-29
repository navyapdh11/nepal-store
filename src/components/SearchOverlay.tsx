import { useState, useEffect, useRef, useCallback } from "react";
import "./SearchOverlay.css";

interface SearchOverlayProps {
	isOpen: boolean;
	onClose: () => void;
	onProductSelect: (product: unknown) => void;
}

export const SearchOverlay = ({ isOpen, onClose, onProductSelect }: SearchOverlayProps) => {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<unknown[]>([]);
	const [loading, setLoading] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const allProductsRef = useRef<unknown[]>([]);

	useEffect(() => {
		if (isOpen && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isOpen]);

	useEffect(() => {
		const loadProducts = async () => {
			setLoading(true);
			try {
				const categories = ["WOMEN", "MEN", "SPORTS", "TRADITIONAL", "SEASONAL", "KIDS", "BABY", "ACCESSORIES", "HOME", "SALE"];
				const allProducts: unknown[] = [];
				for (const cat of categories) {
					try {
						const res = await fetch(`/api/products?category=${cat}&limit=50`);
						const data = await res.json();
						if (Array.isArray(data)) allProducts.push(...data);
					} catch {
						const fallbackRes = await fetch("/products.json");
						const data = await fallbackRes.json();
						if (Array.isArray(data)) allProducts.push(...data.filter((p: any) => p.category === cat));
					}
				}
				// Load traditional separately
				try {
					const tradRes = await fetch("/traditional.json");
					const tradData = await tradRes.json();
					if (Array.isArray(tradData)) allProducts.push(...tradData);
				} catch {}
				allProductsRef.current = allProducts;
			} catch {
				allProductsRef.current = [];
			}
			setLoading(false);
		};
		if (isOpen && allProductsRef.current.length === 0) {
			loadProducts();
		}
	}, [isOpen]);

	const handleSearch = useCallback((value: string) => {
		setQuery(value);
		if (value.length < 2) {
			setResults([]);
			return;
		}
		const q = value.toLowerCase();
		const filtered = allProductsRef.current.filter((p: any) =>
			p.name.toLowerCase().includes(q) ||
			p.description.toLowerCase().includes(q) ||
			p.category.toLowerCase().includes(q)
		);
		setResults(filtered.slice(0, 12));
	}, []);

	const handleSelect = useCallback((product: unknown) => {
		onProductSelect(product);
		setQuery("");
		setResults([]);
		onClose();
	}, [onProductSelect, onClose]);

	useEffect(() => {
		const handleEsc = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		if (isOpen) window.addEventListener("keydown", handleEsc);
		return () => window.removeEventListener("keydown", handleEsc);
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<div className="search-overlay" role="dialog" aria-modal="true" aria-label="Search Products">
			<div className="search-container">
				<div className="search-input-wrapper">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="search-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
					<input
						ref={inputRef}
						type="text"
						className="search-input"
						placeholder="Search products, categories, styles..."
						value={query}
						onChange={e => handleSearch(e.target.value)}
						autoComplete="off"
					/>
					<button type="button" className="search-close" onClick={onClose} aria-label="Close Search">✕</button>
				</div>

				{loading && <div className="search-loading"><div className="search-loading-bar" /></div>}

				{results.length > 0 && (
					<div className="search-results">
						<p className="search-results-count">{results.length} result{results.length !== 1 ? "s" : ""} for "{query}"</p>
						<div className="search-results-grid">
							{results.map((p: any) => (
								<button
									key={p.id}
									type="button"
									className="search-result-item"
									onClick={() => handleSelect(p)}
								>
									<div className="search-result-image">
										<img src={p.image} alt={p.name} loading="lazy" />
									</div>
									<div className="search-result-info">
										<h3>{p.name}</h3>
										<p className="search-result-cat">{p.category}</p>
										<p className="search-result-price">रू {p.price.toLocaleString()}</p>
									</div>
								</button>
							))}
						</div>
					</div>
				)}

				{query.length >= 2 && results.length === 0 && !loading && (
					<div className="search-no-results">
						<p>No products found for "{query}"</p>
						<p className="search-hint">Try different keywords or browse categories</p>
					</div>
				)}

				{query.length === 0 && !loading && (
					<div className="search-suggestions">
						<h4>Popular Searches</h4>
						<div className="search-tags">
							{["Daura Suruwal", "Sari", "Pashmina", "Dhaka Topi", "Kurtha", "Lehenga"].map(tag => (
								<button
									key={tag}
									type="button"
									className="search-tag"
									onClick={() => handleSearch(tag)}
								>{tag}</button>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
