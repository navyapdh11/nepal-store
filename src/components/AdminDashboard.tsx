import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import "./AdminDashboard.css";

interface Product {
	id: string;
	name: string;
	description: string;
	price: number;
	category: string;
	image: string;
	sizes: string[];
	colors: { name: string; hex: string }[];
	isNew: boolean;
	rating: string;
	reviews: number;
	season?: string | null;
	isActive: boolean;
	updatedAt: string;
}

interface AdminStats {
	totalProducts: number;
	activeProducts: number;
	categories: { category: string; count: number }[];
	recent: { id: string; name: string; category: string; updatedAt: string }[];
}

const CATEGORIES = ["WOMEN", "MEN", "SPORTS", "TRADITIONAL", "SEASONAL", "KIDS", "BABY", "ACCESSORIES", "HOME", "SALE"];
const SEASONS = ["Monsoon", "Winter", "Spring", "Summer", "Autumn"];

// Image presets for non-technical staff — categorized by season
const IMAGE_PRESETS: Record<string, { label: string; url: string }[]> = {
	Monsoon: [
		{ label: "Rain Jacket", url: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?q=80&w=800&auto=format&fit=crop" },
		{ label: "Trek Poncho", url: "https://images.unsplash.com/photo-1547234569-53fd724f2e1b?q=80&w=800&auto=format&fit=crop" },
		{ label: "Rain Anorak", url: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?q=80&w=800&auto=format&fit=crop" },
		{ label: "Quick-dry Pants", url: "https://images.unsplash.com/photo-1509631179647-017733169340?q=80&w=800&auto=format&fit=crop" },
	],
	Winter: [
		{ label: "Winter Coat", url: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?q=80&w=800&auto=format&fit=crop" },
		{ label: "Down Vest", url: "https://images.unsplash.com/photo-1543076447-218ad9e3f51a?q=80&w=800&auto=format&fit=crop" },
		{ label: "Cashmere Wrap", url: "https://images.unsplash.com/photo-1520903442860-7f3cf0e852a5?q=80&w=800&auto=format&fit=crop" },
		{ label: "Yak Wool Beanie", url: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?q=80&w=800&auto=format&fit=crop" },
		{ label: "Thermal Base Layer", url: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop" },
	],
	Spring: [
		{ label: "Linen Blazer", url: "https://images.unsplash.com/photo-1490481651871-ab68ff25d43d?q=80&w=800&auto=format&fit=crop" },
		{ label: "Floral Dress", url: "https://images.unsplash.com/photo-1595777457583-95e0e8a8f420?q=80&w=800&auto=format&fit=crop" },
		{ label: "Lightweight Parka", url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop" },
		{ label: "Spring Layers", url: "https://images.unsplash.com/photo-1490481651871-ab68ff25d43d?q=80&w=800&auto=format&fit=crop" },
	],
	Summer: [
		{ label: "Cotton Kaftan", url: "https://images.unsplash.com/photo-1562577309-4932fdd64cd1?q=80&w=800&auto=format&fit=crop" },
		{ label: "Hemp Shorts", url: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=800&auto=format&fit=crop" },
		{ label: "Bamboo Shirt", url: "https://images.unsplash.com/photo-1596755094514-8691829b4e45?q=80&w=800&auto=format&fit=crop" },
		{ label: "Linen Wrap Skirt", url: "https://images.unsplash.com/photo-1583846783903-6a7a2039570d?q=80&w=800&auto=format&fit=crop" },
	],
	Autumn: [
		{ label: "Windbreaker", url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop" },
		{ label: "Wool Cardigan", url: "https://images.unsplash.com/photo-1576566588028-414794448e77?q=80&w=800&auto=format&fit=crop" },
		{ label: "Suede Jacket", url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop" },
		{ label: "Fleece Trousers", url: "https://images.unsplash.com/photo-1594633312681-425c7b569a45?q=80&w=800&auto=format&fit=crop" },
	],
};

export const AdminDashboard = () => {
	const [token, setToken] = useState<string | null>(localStorage.getItem("admin_token"));
	const [stats, setStats] = useState<AdminStats | null>(null);
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
	const [showEditor, setShowEditor] = useState(false);
	const [filterCategory, setFilterCategory] = useState("ALL");
	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [imagePickerOpen, setImagePickerOpen] = useState(false);
	const [message, setMessage] = useState<{ type: string; text: string } | null>(null);
	const navigate = useNavigate();

	const api = useCallback(async (path: string, options?: RequestInit) => {
		const res = await fetch(path, {
			...options,
			headers: {
				...options?.headers,
				"Content-Type": "application/json",
				...(token ? { Authorization: `Bearer ${token}` } : {}),
			},
		});
		if (res.status === 401 || res.status === 403) {
			setToken(null);
			localStorage.removeItem("admin_token");
			throw new Error("Unauthorized");
		}
		return res.json();
	}, [token]);

	const showMessage = (type: string, text: string) => {
		setMessage({ type, text });
		setTimeout(() => setMessage(null), 4000);
	};

	const loadStats = useCallback(async () => {
		try {
			const data = await api("/api/admin/stats");
			setStats(data);
		} catch {
			// Not logged in
		}
	}, [api]);

	const loadProducts = useCallback(async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams({ page: String(currentPage), pageSize: "20" });
			if (filterCategory !== "ALL") params.set("category", filterCategory);
			if (searchTerm) params.set("search", searchTerm);
			const data = await api(`/api/admin/products?${params}`);
			setProducts(data.products);
			setTotalPages(data.totalPages);
		} catch {
			// Not logged in
		} finally {
			setLoading(false);
		}
	}, [api, filterCategory, searchTerm, currentPage]);

	useEffect(() => {
		if (token) {
			loadStats();
			loadProducts();
		}
	}, [token, loadStats, loadProducts]);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		const form = e.target as HTMLFormElement;
		const fd = new FormData(form);
		try {
			const res = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: fd.get("email"), password: fd.get("password") }),
			});
			const data = await res.json();
			if (data.token) {
				setToken(data.token);
				localStorage.setItem("admin_token", data.token);
			} else {
				showMessage("error", data.error || "Login failed");
			}
		} catch {
			showMessage("error", "Login failed");
		}
	};

	const handleLogout = () => {
		setToken(null);
		localStorage.removeItem("admin_token");
	};

	const handleSave = async () => {
		if (!editingProduct?.id) return;
		try {
			const res = await api(`/api/admin/products/${editingProduct.id}`, {
				method: "PATCH",
				body: JSON.stringify(editingProduct),
			});
			if (res.error) {
				showMessage("error", res.error);
			} else {
				showMessage("success", "Product updated!");
				setShowEditor(false);
				loadProducts();
			}
		} catch {
			showMessage("error", "Failed to update");
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Delete this product?")) return;
		try {
			await api(`/api/admin/products/${id}`, { method: "DELETE" });
			showMessage("success", "Product deleted");
			loadProducts();
		} catch {
			showMessage("error", "Failed to delete");
		}
	};

	const selectImage = (url: string) => {
		setEditingProduct(prev => prev ? { ...prev, image: url } : null);
		setImagePickerOpen(false);
	};

	if (!token) {
		return (
			<div className="admin-login-page">
				<div className="admin-login-card glass-card">
					<h1 className="font-display">Admin Dashboard</h1>
					<p>Sign in to manage products.</p>
					<form onSubmit={handleLogin} className="admin-login-form">
						<label>Email<input name="email" type="email" required /></label>
						<label>Password<input name="password" type="password" required /></label>
						<button type="submit" className="admin-btn primary">Sign In</button>
					</form>
					<button type="button" className="admin-btn" onClick={() => navigate("/")}>← Back to Store</button>
				</div>
			</div>
		);
	}

	return (
		<div className="admin-dashboard">
			<Helmet><title>Admin Dashboard — NEPAL STORE</title></Helmet>

			{/* Toast message */}
			{message && <div className={`admin-toast ${message.type}`}>{message.text}</div>}

			{/* Header */}
			<header className="admin-header">
				<h1 className="font-display">Product Manager</h1>
				<div className="admin-header-actions">
					<button type="button" className="admin-btn" onClick={() => navigate("/")}>← Back to Store</button>
					<button type="button" className="admin-btn" onClick={handleLogout}>Sign Out</button>
				</div>
			</header>

			{/* Stats */}
			{stats && (
				<div className="admin-stats">
					<div className="stat-card">
						<span className="stat-number">{stats.totalProducts}</span>
						<span className="stat-label">Total Products</span>
					</div>
					<div className="stat-card">
						<span className="stat-number">{stats.activeProducts}</span>
						<span className="stat-label">Active</span>
					</div>
					{stats.categories.slice(0, 5).map(c => (
						<div key={c.category} className="stat-card">
							<span className="stat-number">{c.count}</span>
							<span className="stat-label">{c.category}</span>
						</div>
					))}
				</div>
			)}

			{/* Filters */}
			<div className="admin-filters">
				<input
					type="text"
					placeholder="Search products..."
					value={searchTerm}
					onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
					className="admin-search-input"
				/>
				<select
					value={filterCategory}
					onChange={e => { setFilterCategory(e.target.value); setCurrentPage(1); }}
					className="admin-filter-select"
				>
					<option value="ALL">All Categories</option>
					{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
				</select>
				<button type="button" className="admin-btn refresh" onClick={loadProducts}>↻ Refresh</button>
			</div>

			{/* Product Grid */}
			{loading ? (
				<div className="admin-loading">Loading...</div>
			) : (
				<>
					<div className="admin-product-grid">
						{products.map(p => (
							<div key={p.id} className={`admin-product-card ${!p.isActive ? "inactive" : ""}`}>
								<div className="admin-product-image-wrap">
									<img src={p.image} alt={p.name} loading="lazy" />
									{p.isNew && <span className="badge-new">NEW</span>}
									{!p.isActive && <span className="badge-inactive">HIDDEN</span>}
								</div>
								<div className="admin-product-info">
									<h4>{p.name}</h4>
									<p className="admin-product-meta">
										{p.category}{p.season ? ` · ${p.season}` : ""} · रू{p.price.toLocaleString()}
									</p>
									<p className="admin-product-rating">★ {p.rating} ({p.reviews})</p>
									<div className="admin-product-actions">
										<button type="button" className="admin-btn-sm edit" onClick={() => { setEditingProduct(p); setShowEditor(true); }}>Edit</button>
										<button type="button" className="admin-btn-sm delete" onClick={() => handleDelete(p.id)}>Delete</button>
									</div>
								</div>
							</div>
						))}
					</div>

					{/* Pagination */}
					{totalPages > 1 && (
						<div className="admin-pagination">
							<button type="button" className="admin-btn" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}>← Prev</button>
							<span>Page {currentPage} of {totalPages}</span>
							<button type="button" className="admin-btn" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next →</button>
						</div>
					)}
				</>
			)}

			{/* Editor Modal */}
			{showEditor && editingProduct && (
				<div className="admin-modal-overlay" onClick={() => setShowEditor(false)}>
					<div className="admin-modal" onClick={e => e.stopPropagation()}>
						<div className="admin-modal-header">
							<h2>Edit Product</h2>
							<button type="button" className="admin-modal-close" onClick={() => setShowEditor(false)}>✕</button>
						</div>
						<div className="admin-modal-body">
							<div className="form-row">
								<label>Product Name<input type="text" value={editingProduct.name ?? ""} onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })} /></label>
								<label>Price (रू)<input type="number" value={editingProduct.price ?? 0} onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })} /></label>
							</div>
							<label>Description<textarea rows={3} value={editingProduct.description ?? ""} onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })} /></label>
							<div className="form-row">
								<label>Category
									<select value={editingProduct.category ?? "SEASONAL"} onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}>
										{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
									</select>
								</label>
								<label>Season
									<select value={editingProduct.season ?? ""} onChange={e => setEditingProduct({ ...editingProduct, season: e.target.value || null })}>
										<option value="">None</option>
										{SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
									</select>
								</label>
							</div>
							<label>
								Image URL
								<div className="image-url-row">
									<input type="text" value={editingProduct.image ?? ""} onChange={e => setEditingProduct({ ...editingProduct, image: e.target.value })} />
									<button type="button" className="admin-btn-sm" onClick={() => setImagePickerOpen(true)}>📷 Pick</button>
								</div>
								{editingProduct.image && <img src={editingProduct.image} alt="Preview" className="image-preview" />}
							</label>
							<div className="form-row">
								<label className="checkbox-label">
									<input type="checkbox" checked={editingProduct.isNew ?? false} onChange={e => setEditingProduct({ ...editingProduct, isNew: e.target.checked })} />
									<span>Featured (NEW badge)</span>
								</label>
								<label className="checkbox-label">
									<input type="checkbox" checked={editingProduct.isActive ?? true} onChange={e => setEditingProduct({ ...editingProduct, isActive: e.target.checked })} />
									<span>Active (visible on store)</span>
								</label>
							</div>
						</div>
						<div className="admin-modal-footer">
							<button type="button" className="admin-btn" onClick={() => setShowEditor(false)}>Cancel</button>
							<button type="button" className="admin-btn primary" onClick={handleSave}>Save Changes</button>
						</div>
					</div>
				</div>
			)}

			{/* Image Picker Modal */}
			{imagePickerOpen && (
				<div className="admin-modal-overlay" onClick={() => setImagePickerOpen(false)}>
					<div className="admin-modal admin-image-picker" onClick={e => e.stopPropagation()}>
						<div className="admin-modal-header">
							<h2>Pick a Photo</h2>
							<button type="button" className="admin-modal-close" onClick={() => setImagePickerOpen(false)}>✕</button>
						</div>
						<div className="image-picker-tabs">
							{Object.keys(IMAGE_PRESETS).map(season => (
								<button key={season} type="button" className="picker-tab" onClick={() => {
									const el = document.getElementById(`picker-${season}`);
									el?.scrollIntoView({ behavior: "smooth" });
								}}>{season}</button>
							))}
						</div>
						<div className="image-picker-grid">
							{Object.entries(IMAGE_PRESETS).map(([season, images]) => (
								<div key={season} id={`picker-${season}`}>
									<h4>{season}</h4>
									<div className="picker-images">
										{images.map(img => (
											<button key={img.url} type="button" className="picker-image-btn" onClick={() => selectImage(img.url)}>
												<img src={img.url} alt={img.label} />
												<span>{img.label}</span>
											</button>
										))}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
