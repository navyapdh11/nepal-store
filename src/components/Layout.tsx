import { useState, useCallback, useRef, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "./Header";
import { NudgeBar } from "./NudgeBar";
import { CartDrawer } from "./CartDrawer";
import { SearchOverlay } from "./SearchOverlay";
import { ProductModalProvider } from "../context/ProductModalContext.tsx";
import { useCart } from "../context/CartContext.tsx";
import "./Layout.css";

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
	isNew?: boolean;
	rating?: string;
	reviews?: number;
}

interface CartItemData {
	id: string;
	name: string;
	price: number;
	image: string;
	size: string;
	color: { name: string; hex: string };
	quantity: number;
}

/* ——— Product Modal (same as App.tsx) ——— */
const ProductModal = ({ product, onClose, onAdd }: { product: Product; onClose: () => void; onAdd: (p: Product) => void }) => {
	const [selectedSize, setSelectedSize] = useState(product.sizes[0] ?? "M");
	const [selectedColor, setSelectedColor] = useState(product.colors[0] ?? { name: "", hex: "#000" });
	const [added, setAdded] = useState(false);
	const modalRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [onClose]);

	useEffect(() => {
		const handleTab = (e: KeyboardEvent) => {
			if (e.key !== "Tab" || !modalRef.current) return;
			const focusable = modalRef.current.querySelectorAll<HTMLElement>(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			);
			const first = focusable[0];
			const last = focusable[focusable.length - 1];
			if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
			else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
		};
		document.addEventListener("keydown", handleTab);
		(modalRef.current?.querySelector(".close-btn") as HTMLElement)?.focus();
		return () => document.removeEventListener("keydown", handleTab);
	}, []);

	const handleAdd = () => {
		setAdded(true);
		onAdd({ ...product, size: selectedSize, color: selectedColor, quantity: 1 } as unknown as Product);
		setTimeout(() => setAdded(false), 2000);
	};

	return (
		<div className="modal-overlay" role="dialog" aria-modal="true" aria-label={`${product.name} — Product Details`} onClick={onClose}>
			<div className="modal-content" ref={modalRef} onClick={e => e.stopPropagation()}>
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
						{product.colors?.length > 0 && (
							<div className="selector-group">
								<h4>Color — <span className="selected-value">{selectedColor?.name}</span></h4>
								<div className="color-swatches">
									{product.colors.map(c => (
										<button key={c.hex} type="button" className={`color-swatch ${selectedColor?.hex === c.hex ? "active" : ""}`} style={{ backgroundColor: c.hex }} onClick={() => setSelectedColor(c)} title={c.name} aria-label={`Select color ${c.name}`} />
									))}
								</div>
							</div>
						)}
						{product.sizes?.length > 0 && (
							<div className="selector-group">
								<h4>Size — <span className="selected-value">{selectedSize}</span></h4>
								<div className="size-buttons">
									{product.sizes.map(s => (
										<button key={s} type="button" className={`size-btn ${selectedSize === s ? "active" : ""}`} onClick={() => setSelectedSize(s)} aria-label={`Select size ${s}`}>{s}</button>
									))}
								</div>
							</div>
						)}
						<div className="modal-actions">
							<button type="button" className={`add-to-cart-btn ${added ? "added" : ""}`} onClick={handleAdd}>{added ? "Added ✓" : "Add to Bag"}</button>
							<button type="button" className="wishlist-btn" aria-label="Add to Wishlist">♡</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

interface LayoutProps {
	children: ReactNode;
	currentPage?: string;
}

export const Layout = ({ children, currentPage = "" }: LayoutProps) => {
	const navigate = useNavigate();
	const { items, addItem: addItemToCart, removeItem: removeCartItem, updateQuantity: updateCartQuantity } = useCart();

	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
	const [cartOpen, setCartOpen] = useState(false);
	const [searchOpen, setSearchOpen] = useState(false);
	const [localCartItems, setLocalCartItems] = useState<CartItemData[]>([]);

	// Sync context cart items to local state for CartDrawer
	useEffect(() => {
		setLocalCartItems(items.map(i => ({
			id: i.id,
			name: i.name,
			price: i.price,
			image: i.image,
			size: i.size ?? "M",
			color: i.color ?? { name: "Default", hex: "#000" },
			quantity: i.quantity,
		})));
	}, [items]);

	const handleAddToCart = useCallback((product: Product) => {
		addItemToCart({
			id: product.id,
			name: product.name,
			price: product.price,
			image: product.image,
			size: (product as any).size ?? product.sizes[0],
			color: (product as any).color ?? product.colors[0],
			quantity: (product as any).quantity ?? 1,
		});
		setCartOpen(true);
	}, [addItemToCart]);

	const handleRemoveFromCart = useCallback((id: string) => {
		// Find and remove from context
		const item = items.find(i => i.id === id);
		if (item) removeCartItem(item.id);
	}, [items, removeCartItem]);

	const handleQuantityChange = useCallback((id: string, qty: number) => {
		// We need to find the context item
		const item = items.find(i => i.id === id);
		if (item) updateCartQuantity(item.id, qty);
	}, [items, updateCartQuantity]);

	const handleSearchSelect = useCallback((product: unknown) => {
		setSelectedProduct(product as Product);
		setSearchOpen(false);
	}, []);

	const openProduct = useCallback((product: Product) => {
		setSelectedProduct(product);
		window.scrollTo({ top: 0, behavior: "smooth" });
	}, []);

	const handleCategoryChange = useCallback((cat: string) => {
		const catLower = cat.toLowerCase();
		const knownRoutes = ["women", "men", "sports", "traditional", "seasonal", "kids", "baby", "accessories", "home", "sale", "about", "contact", "faq"];
		if (knownRoutes.includes(catLower)) {
			navigate(`/${catLower}`);
		} else if (cat === "ACCOUNT") {
			navigate("/app");
		} else {
			navigate("/app");
		}
	}, [navigate]);

	return (
		<ProductModalProvider value={{ openProduct }}>
		<div className="app-v2 layout-shell">
			<Header
				onCategoryChange={handleCategoryChange}
				onCartClick={() => setCartOpen(true)}
				onSearchClick={() => setSearchOpen(true)}
			/>
			<NudgeBar category={currentPage} />
			<main className="content-area">{children}</main>
			<SiteFooter onNavigate={handleCategoryChange} />

			{selectedProduct && (
				<ProductModal
					product={selectedProduct}
					onClose={() => setSelectedProduct(null)}
					onAdd={handleAddToCart}
				/>
			)}

			<CartDrawer
				items={localCartItems}
				isOpen={cartOpen}
				onClose={() => setCartOpen(false)}
				onRemove={handleRemoveFromCart}
				onQuantityChange={handleQuantityChange}
			/>

			<SearchOverlay
				isOpen={searchOpen}
				onClose={() => setSearchOpen(false)}
				onProductSelect={handleSearchSelect}
			/>
		</div>
		</ProductModalProvider>
	);
};

/* ——— Site Footer (same as App.tsx) ——— */
const SiteFooter = ({ onNavigate }: { onNavigate: (cat: string) => void }) => {
	const scrollToTop = useCallback(() => window.scrollTo({ top: 0, behavior: "smooth" }), []);

	const nav = useCallback((cat: string) => {
		onNavigate(cat);
		scrollToTop();
	}, [onNavigate, scrollToTop]);

	return (
		<footer className="footer-v2">
			<div className="footer-grid">
				<div className="footer-col footer-col--brand">
					<h4>Nepal Store</h4>
					<p>Authentic Nepalese fashion — handcrafted cashmere, Dhaka textiles, and modern wear from Kathmandu artisans.</p>
				</div>
				<div className="footer-col">
					<h4>Collections</h4>
					<a href="#women" onClick={e => { e.preventDefault(); nav("WOMEN"); }}>Women</a>
					<a href="#men" onClick={e => { e.preventDefault(); nav("MEN"); }}>Men</a>
					<a href="#traditional" onClick={e => { e.preventDefault(); nav("TRADITIONAL"); }}>Traditional</a>
					<a href="#sports" onClick={e => { e.preventDefault(); nav("SPORTS"); }}>Sports</a>
					<a href="#sale" onClick={e => { e.preventDefault(); nav("SALE"); }}>Sale</a>
				</div>
				<div className="footer-col">
					<h4>Company</h4>
					<a href="#about" onClick={e => { e.preventDefault(); nav("ABOUT"); }}>About Us</a>
					<a href="#contact" onClick={e => { e.preventDefault(); nav("CONTACT"); }}>Contact</a>
					<a href="#account" onClick={e => { e.preventDefault(); nav("ACCOUNT"); }}>My Account</a>
				</div>
				<div className="footer-col">
					<h4>Enterprise</h4>
					<a href="#pricing" onClick={e => { e.preventDefault(); nav("Corporate Matrix"); }}>Pricing Matrix</a>
					<a href="#quoting" onClick={e => { e.preventDefault(); nav("Industrial Quoting"); }}>Quoting Engine</a>
					<a href="#logs" onClick={e => { e.preventDefault(); nav("Sanitization Logs"); }}>Sanitization Logs</a>
				</div>
			</div>
			<div className="footer-bottom">
				<p>© 2026 Nepal Store. All rights reserved.</p>
				<p>Handcrafted in Kathmandu 🇳🇵</p>
			</div>
		</footer>
	);
};
