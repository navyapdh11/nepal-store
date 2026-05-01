import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Breadcrumb } from "./Breadcrumb";
import { useCart } from "../context/CartContext.tsx";
import { useProductModal } from "../context/ProductModalContext.tsx";
import "./NepalBazaar.css";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  mainImage: string;
  rating: number;
  reviewCount: number;
  sold: number;
  freeShipping: boolean;
  isFlashSale: boolean;
  stock: number;
  vendorId?: string;
  vendorName?: string;
  vendorSlug?: string;
  vendorVerified?: boolean;
}

interface Vendor {
  id: string;
  storeName: string;
  storeSlug: string;
  logo: string;
  rating: number;
  totalSales: number;
  verified: boolean;
  productCount: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  productCount: string;
}

const BAZAAR_CATEGORIES = [
  { id: "electronics", name: "Electronics", icon: "📱", color: "#3b82f6", productCount: "2K+" },
  { id: "fashion", name: "Fashion", icon: "👗", color: "#ec4899", productCount: "5K+" },
  { id: "home-garden", name: "Home & Garden", icon: "🏡", color: "#10b981", productCount: "3K+" },
  { id: "beauty", name: "Beauty", icon: "💄", color: "#f472b6", productCount: "1K+" },
  { id: "sports", name: "Sports", icon: "⚽", color: "#f59e0b", productCount: "800+" },
  { id: "toys", name: "Toys & Kids", icon: "🧸", color: "#8b5cf6", productCount: "1K+" },
  { id: "automotive", name: "Automotive", icon: "🚗", color: "#6366f1", productCount: "500+" },
  { id: "food", name: "Food", icon: "🍜", color: "#ef4444", productCount: "600+" },
  { id: "traditional", name: "Traditional", icon: "🎭", color: "#14b8a6", productCount: "2K+" },
  { id: "books", name: "Books", icon: "📚", color: "#a855f7", productCount: "400+" },
  { id: "pets", name: "Pets", icon: "🐾", color: "#f97316", productCount: "300+" },
  { id: "office", name: "Office", icon: "💼", color: "#64748b", productCount: "700+" },
];

export const NepalBazaarPage = () => {
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [featuredVendors, setFeaturedVendors] = useState<Vendor[]>([]);
  const [_categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [flashSaleTimeLeft, setFlashSaleTimeLeft] = useState({ hours: 5, minutes: 23, seconds: 47 });

  const { addItem } = useCart();
  const { openProduct } = useProductModal();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [flashRes, trendingRes, vendorsRes, catRes] = await Promise.all([
          fetch("/api/products/flash-sale?limit=12"),
          fetch("/api/products/trending?limit=12"),
          fetch("/api/vendors?verified=true&limit=12"),
          fetch("/api/categories"),
        ]);

        const flashData = await flashRes.json();
        const trendingData = await trendingRes.json();
        const vendorsData = await vendorsRes.json();
        const catData = await catRes.json();

        if (Array.isArray(flashData)) setFlashSaleProducts(flashData);
        if (Array.isArray(trendingData)) setTrendingProducts(trendingData);
        if (Array.isArray(vendorsData)) setFeaturedVendors(vendorsData);
        if (Array.isArray(catData)) setCategories(catData);
      } catch {
        // Fallback to empty arrays
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Flash sale countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setFlashSaleTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; minutes = 59; seconds = 59; }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleQuickAdd = useCallback((product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.mainImage,
      size: "M",
      color: { name: "Default", hex: "#000" },
      quantity: 1,
    });
  }, [addItem]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/bazaar/search?q=${encodeURIComponent(searchQuery)}`;
    }
  }, [searchQuery]);

  return (
    <div className="nepal-bazaar-page">
      <Helmet>
        <title>Nepal Bazaar — AliExpress-Style Marketplace for Nepal</title>
        <meta name="description" content="Nepal Bazaar: Buy & sell everything from cashmere pashminas to electronics. 1000+ vendors, 50,000+ products. Nepal's premier online marketplace." />
      </Helmet>

      <Breadcrumb items={[
        { label: "Home", href: "/" },
        { label: "Nepal Bazaar" },
      ]} />

      {/* Hero Search Bar */}
      <section className="bazaar-hero">
        <div className="bazaar-hero-content">
          <h1 className="bazaar-title">
            <span className="flag-icon">🇳🇵</span> Nepal <span className="accent-text">Bazaar</span>
          </h1>
          <p className="bazaar-subtitle">Buy & Sell Everything — From Kathmandu to Your Doorstep</p>
          <form className="bazaar-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search 50,000+ products from 1,000+ vendors..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="Search products"
            />
            <button type="submit">Search</button>
          </form>
          <div className="bazaar-trending-tags">
            <span className="trending-label">🔥 Trending:</span>
            {["Dashain Special", "Cashmere Shawl", "Singing Bowl", "Dhaka Topi", "Pashmina", "Thangka"].map(tag => (
              <Link key={tag} to={`/bazaar/search?q=${encodeURIComponent(tag)}`} className="trending-tag">
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="bazaar-categories-section">
        <h2 className="section-title">Shop by Category</h2>
        <div className="bazaar-category-grid">
          {BAZAAR_CATEGORIES.map(cat => (
            <Link key={cat.id} to={`/bazaar/category/${cat.id}`} className="bazaar-category-card">
              <span className="category-icon" style={{ background: cat.color }}>{cat.icon}</span>
              <span className="category-name">{cat.name}</span>
              <span className="category-count">{cat.productCount?.toLocaleString() || "1K+"} items</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Flash Sale Section */}
      <section className="flash-sale-section">
        <div className="flash-sale-header">
          <h2 className="flash-title">🔥 Flash Sales</h2>
          <div className="flash-timer">
            <span className="timer-label">Ends in:</span>
            <span className="timer-block">{String(flashSaleTimeLeft.hours).padStart(2, "0")}</span>:
            <span className="timer-block">{String(flashSaleTimeLeft.minutes).padStart(2, "0")}</span>:
            <span className="timer-block">{String(flashSaleTimeLeft.seconds).padStart(2, "0")}</span>
          </div>
          <Link to="/bazaar/flash-sale" className="view-all-btn">View All →</Link>
        </div>
        <div className="flash-sale-grid">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="flash-skeleton skeleton pulse-anim" />)
            : flashSaleProducts.map(product => (
                <FlashSaleCard key={product.id} product={product} onAdd={handleQuickAdd} onDetail={openProduct} />
              ))}
        </div>
      </section>

      {/* Trending Products */}
      <section className="trending-section">
        <div className="trending-header">
          <h2 className="section-title">📈 Trending Now</h2>
          <p className="section-subtitle">Most popular items across Nepal Bazaar</p>
          <Link to="/bazaar/trending" className="view-all-btn">View All →</Link>
        </div>
        <div className="trending-grid">
          {loading
            ? Array.from({ length: 12 }).map((_, i) => <div key={i} className="trending-skeleton skeleton pulse-anim" />)
            : trendingProducts.map(product => (
                <TrendingProductCard key={product.id} product={product} onAdd={handleQuickAdd} onDetail={openProduct} />
              ))}
        </div>
      </section>

      {/* Featured Vendors */}
      <section className="featured-vendors-section">
        <div className="vendors-header">
          <h2 className="section-title">⭐ Top Vendors</h2>
          <p className="section-subtitle">Verified sellers with excellent ratings</p>
          <Link to="/bazaar/vendors" className="view-all-btn">All Vendors →</Link>
        </div>
        <div className="vendors-grid">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="vendor-skeleton skeleton pulse-anim" />)
            : featuredVendors.map(vendor => <VendorCard key={vendor.id} vendor={vendor} />)}
        </div>
      </section>

      {/* CTA: Become a Vendor */}
      <section className="vendor-cta">
        <div className="vendor-cta-content">
          <h2>Start Selling on Nepal Bazaar</h2>
          <p>Join 1,000+ vendors reaching customers across Nepal and beyond. Set up your store in minutes.</p>
          <Link to="/bazaar/become-vendor" className="cta-button">Open Your Store — It's Free</Link>
        </div>
      </section>
    </div>
  );
};

/* ——— Flash Sale Card ——— */
const FlashSaleCard = ({ product, onAdd, onDetail }: { product: Product; onAdd: (p: Product) => void; onDetail: (p: any) => void }) => {
  return (
    <div className="flash-sale-card">
      <div className="flash-image-wrap" onClick={() => onDetail(product)}>
        <img src={product.mainImage} alt={product.name} loading="lazy" />
        <span className="flash-discount-badge">-{product.discount}%</span>
        <div className="flash-progress">
          <div className="progress-bar" style={{ width: `${Math.min((product.sold / (product.sold + product.stock)) * 100, 100)}%` }} />
        </div>
        <span className="flash-sold-count">{product.sold} sold</span>
      </div>
      <div className="flash-details">
        <h3 className="flash-name" onClick={() => onDetail(product)}>{product.name}</h3>
        <div className="flash-pricing">
          <span className="flash-price">रू {product.price.toLocaleString()}</span>
          {product.originalPrice && <span className="flash-original">रू {product.originalPrice.toLocaleString()}</span>}
        </div>
        <button type="button" className="flash-add-btn" onClick={() => onAdd(product)}>
          Grab Now
        </button>
      </div>
    </div>
  );
};

/* ——— Trending Product Card ——— */
const TrendingProductCard = ({ product, onAdd, onDetail }: { product: Product; onAdd: (p: Product) => void; onDetail: (p: any) => void }) => {
  return (
    <div className="trending-card">
      <div className="trending-image-wrap" onClick={() => onDetail(product)}>
        <img src={product.mainImage} alt={product.name} loading="lazy" />
        {product.discount && product.discount > 0 && <span className="trending-discount">-{product.discount}%</span>}
        {product.freeShipping && <span className="trending-free-ship">🚚 Free Ship</span>}
      </div>
      <div className="trending-details">
        <h3 className="trending-name" onClick={() => onDetail(product)}>{product.name}</h3>
        {product.vendorName && (
          <Link to={`/bazaar/store/${product.vendorSlug}`} className="trending-vendor">
            {product.vendorVerified && "✓ "}{product.vendorName}
          </Link>
        )}
        <div className="trending-meta">
          <span className="trending-rating">★ {product.rating?.toFixed(1)}</span>
          <span className="trending-sold">{product.sold?.toLocaleString()} sold</span>
        </div>
        <div className="trending-pricing">
          <span className="trending-price">रू {product.price.toLocaleString()}</span>
          {product.originalPrice && <span className="trending-original">रू {product.originalPrice.toLocaleString()}</span>}
        </div>
        <button type="button" className="trending-add-btn" onClick={() => onAdd(product)}>
          Add to Bag
        </button>
      </div>
    </div>
  );
};

/* ——— Vendor Card ——— */
const VendorCard = ({ vendor }: { vendor: Vendor }) => {
  return (
    <Link to={`/bazaar/store/${vendor.storeSlug}`} className="vendor-card">
      <img src={vendor.logo} alt={vendor.storeName} className="vendor-avatar" loading="lazy" />
      <div className="vendor-info">
        <h3 className="vendor-store-name">
          {vendor.storeName}
          {vendor.verified && <span className="mini-verified">✓</span>}
        </h3>
        <div className="vendor-mini-stats">
          <span>★ {vendor.rating?.toFixed(1)}</span>
          <span>{vendor.totalSales?.toLocaleString()}+ sales</span>
          <span>{vendor.productCount} items</span>
        </div>
      </div>
    </Link>
  );
};
