import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Breadcrumb } from "./Breadcrumb";
import { useCart } from "../context/CartContext.tsx";
import { useProductModal } from "../context/ProductModalContext.tsx";
import "./VendorStore.css";

interface Vendor {
  id: string;
  storeName: string;
  storeSlug: string;
  description: string;
  banner: string;
  logo: string;
  phone: string;
  city: string;
  province: string;
  verified: boolean;
  rating: number;
  totalReviews: number;
  totalSales: number;
  responseTime: string;
  followerCount: number;
  productCount: number;
}

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
}

export const VendorStorePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"products" | "about" | "reviews">("products");
  const [isFollowing, setIsFollowing] = useState(false);
  const [page, setPage] = useState(1);
  const { addItem } = useCart();
  const { openProduct } = useProductModal();

  useEffect(() => {
    const fetchVendor = async () => {
      setLoading(true);
      try {
        const [vendorRes, productsRes] = await Promise.all([
          fetch(`/api/vendors/${slug}`),
          fetch(`/api/vendors/${slug}/products?page=${page}&pageSize=24`),
        ]);
        const vendorData = await vendorRes.json();
        const productsData = await productsRes.json();
        setVendor(vendorData);
        setProducts(productsData.products || []);
      } catch {
        setVendor(null);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVendor();
  }, [slug, page]);

  const handleFollow = useCallback(async () => {
    if (!vendor) return;
    try {
      await fetch(`/api/vendors/${vendor.id}/follow`, { method: "POST" });
      setIsFollowing(!isFollowing);
      setVendor(prev => prev ? { ...prev, followerCount: prev.followerCount + (isFollowing ? -1 : 1) } : null);
    } catch { /* ignore */ }
  }, [vendor, isFollowing]);

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

  if (!vendor && !loading) {
    return (
      <div className="vendor-not-found">
        <h1>Store Not Found</h1>
        <p>This vendor doesn't exist.</p>
        <Link to="/bazaar">Browse Nepal Bazaar</Link>
      </div>
    );
  }

  return (
    <div className="vendor-store-page">
      <Helmet>
        <title>{vendor?.storeName} — NEPAL BAZAAR | Verified Vendor Store</title>
        <meta name="description" content={`Shop from ${vendor?.storeName} on NEPAL BAZAAR — ${vendor?.productCount} products, ${vendor?.rating}★ rating, ${vendor?.totalSales}+ sales.`} />
      </Helmet>

      <Breadcrumb items={[
        { label: "Home", href: "/" },
        { label: "Nepal Bazaar", href: "/bazaar" },
        { label: vendor?.storeName || "" },
      ]} />

      {/* Vendor Banner */}
      <div className="vendor-header" style={{ backgroundImage: `url(${vendor?.banner})` }}>
        <div className="vendor-header-overlay">
          <div className="vendor-info-bar">
            <div className="vendor-identity">
              <img src={vendor?.logo} alt={vendor?.storeName} className="vendor-logo" />
              <div className="vendor-name-section">
                <h1 className="vendor-name">
                  {vendor?.storeName}
                  {vendor?.verified && <span className="verified-badge" title="Verified Vendor">✓</span>}
                </h1>
                <p className="vendor-location">{vendor?.city}, {vendor?.province}, Nepal</p>
                <p className="vendor-response-time">⚡ Responds {vendor?.responseTime}</p>
              </div>
            </div>
            <div className="vendor-actions">
              <button type="button" className={`follow-btn ${isFollowing ? "following" : ""}`} onClick={handleFollow}>
                {isFollowing ? "Following" : "Follow"} ({vendor?.followerCount?.toLocaleString()})
              </button>
              <Link to="/bazaar/messages" className="message-btn">💬 Message</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Vendor Stats */}
      <div className="vendor-stats">
        <div className="stat-card">
          <span className="stat-value">{vendor?.rating?.toFixed(1)}</span>
          <span className="stat-label">Rating</span>
          <span className="stat-detail">({vendor?.totalReviews?.toLocaleString()} reviews)</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{vendor?.totalSales?.toLocaleString()}+</span>
          <span className="stat-label">Sales</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{vendor?.productCount?.toLocaleString()}</span>
          <span className="stat-label">Products</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">🇳🇵</span>
          <span className="stat-label">Ships from Nepal</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="vendor-tabs">
        <button type="button" className={`vendor-tab ${activeTab === "products" ? "active" : ""}`} onClick={() => setActiveTab("products")}>
          Products ({vendor?.productCount})
        </button>
        <button type="button" className={`vendor-tab ${activeTab === "about" ? "active" : ""}`} onClick={() => setActiveTab("about")}>
          About
        </button>
        <button type="button" className={`vendor-tab ${activeTab === "reviews" ? "active" : ""}`} onClick={() => setActiveTab("reviews")}>
          Reviews ({vendor?.totalReviews})
        </button>
      </div>

      {/* Products Tab */}
      {activeTab === "products" && (
        <div className="vendor-products">
          <div className="products-grid">
            {loading
              ? Array.from({ length: 12 }).map((_, i) => <div key={i} className="product-skeleton skeleton pulse-anim" />)
              : products.map(product => (
                  <div key={product.id} className="vendor-product-card">
                    <div className="product-image-wrap" onClick={() => openProduct(product as any)}>
                      <img src={product.mainImage} alt={product.name} loading="lazy" />
                      {product.discount > 0 && <span className="discount-badge">-{product.discount}%</span>}
                      {product.isFlashSale && <span className="flash-badge">🔥 Flash</span>}
                      {product.freeShipping && <span className="free-shipping-badge">Free Ship</span>}
                    </div>
                    <div className="product-details">
                      <h3 className="product-name" onClick={() => openProduct(product as any)}>{product.name}</h3>
                      <div className="product-meta">
                        <span className="product-rating">★ {product.rating?.toFixed(1)}</span>
                        <span className="product-sold">{product.sold?.toLocaleString()} sold</span>
                      </div>
                      <div className="product-pricing">
                        <span className="current-price">रू {product.price.toLocaleString()}</span>
                        {product.originalPrice && <span className="original-price">रू {product.originalPrice.toLocaleString()}</span>}
                      </div>
                      <button type="button" className="quick-add-btn" onClick={() => handleQuickAdd(product)}>
                        Add to Bag
                      </button>
                    </div>
                  </div>
                ))}
          </div>
          {!loading && products.length > 0 && (
            <div className="load-more-wrap">
              <button type="button" className="load-more-btn" onClick={() => setPage(p => p + 1)}>
                Load More Products
              </button>
            </div>
          )}
          {!loading && products.length === 0 && (
            <p className="empty-message">No products available from this vendor yet.</p>
          )}
        </div>
      )}

      {/* About Tab */}
      {activeTab === "about" && (
        <div className="vendor-about">
          <h2>About {vendor?.storeName}</h2>
          <p>{vendor?.description}</p>
          <div className="about-details">
            <div className="detail-item">
              <h4>Location</h4>
              <p>{vendor?.city}, {vendor?.province}, Nepal</p>
            </div>
            <div className="detail-item">
              <h4>Contact</h4>
              <p>{vendor?.phone || "Not provided"}</p>
            </div>
            <div className="detail-item">
              <h4>Member Since</h4>
              <p>{vendor?.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : "N/A"}</p>
            </div>
            <div className="detail-item">
              <h4>Response Time</h4>
              <p>{vendor?.responseTime || "N/A"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === "reviews" && (
        <div className="vendor-reviews">
          <h2>Customer Reviews</h2>
          <div className="review-summary">
            <div className="review-average">
              <span className="big-rating">{vendor?.rating?.toFixed(1)}</span>
              <div className="stars">{"★".repeat(Math.round(vendor?.rating || 0))}{"☆".repeat(5 - Math.round(vendor?.rating || 0))}</div>
              <span className="total">Based on {vendor?.totalReviews?.toLocaleString()} reviews</span>
            </div>
          </div>
          <p className="coming-soon">Full review system coming soon!</p>
        </div>
      )}
    </div>
  );
};
