import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Breadcrumb } from "./Breadcrumb";
import { useAuth } from "../lib/auth";
import "./BecomeVendor.css";

export const BecomeVendorPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    storeName: "",
    description: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    banner: "",
    logo: "",
    agreeTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : false;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  }, []);

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.storeName.trim()) newErrors.storeName = "Store name is required";
      if (formData.storeName.length < 3) newErrors.storeName = "Store name must be at least 3 characters";
      if (!formData.description.trim()) newErrors.description = "Description is required";
    }
    if (step === 2) {
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
      if (!formData.city.trim()) newErrors.city = "City is required";
      if (!formData.province) newErrors.province = "Province is required";
    }
    if (step === 3) {
      if (!formData.agreeTerms) newErrors.agreeTerms = "You must agree to the terms";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [step, formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName: formData.storeName,
          description: formData.description,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          province: formData.province,
          banner: formData.banner || undefined,
          logo: formData.logo || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        navigate(`/bazaar/store/${data.storeSlug}`);
      } else {
        const error = await res.json();
        setErrors({ submit: error.error || "Failed to create vendor store" });
      }
    } catch {
      setErrors({ submit: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }, [step, formData, validate, navigate]);

  if (!isAuthenticated) {
    return (
      <div className="become-vendor-page">
        <Helmet><title>Sign In to Sell — NEPAL BAZAAR</title></Helmet>
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Nepal Bazaar", href: "/bazaar" }, { label: "Sell" }]} />
        <div className="vendor-auth-requirement">
          <h1>Sign In Required</h1>
          <p>You need to be signed in to open a store on Nepal Bazaar.</p>
          <button type="button" className="vendor-sign-in-btn" onClick={() => navigate("/account")}>
            Sign In / Register
          </button>
        </div>
      </div>
    );
  }

  const provinces = [
    "Koshi", "Madhesh", "Bagmati", "Gandaki", "Lumbini", "Karnali", "Sudurpashchim",
  ];

  return (
    <div className="become-vendor-page">
      <Helmet>
        <title>Open Your Store — NEPAL BAZAAR | Become a Vendor</title>
        <meta name="description" content="Start selling on Nepal Bazaar. Open your online store in minutes and reach customers across Nepal." />
      </Helmet>

      <Breadcrumb items={[
        { label: "Home", href: "/" },
        { label: "Nepal Bazaar", href: "/bazaar" },
        { label: "Open Your Store" },
      ]} />

      {/* Progress Steps */}
      <div className="vendor-progress">
        <div className={`progress-step ${step >= 1 ? "completed" : ""} ${step === 1 ? "active" : ""}`}>
          <span className="step-number">1</span>
          <span className="step-label">Store Info</span>
        </div>
        <div className={`progress-connector ${step >= 2 ? "completed" : ""}`} />
        <div className={`progress-step ${step >= 2 ? "completed" : ""} ${step === 2 ? "active" : ""}`}>
          <span className="step-number">2</span>
          <span className="step-label">Location</span>
        </div>
        <div className={`progress-connector ${step >= 3 ? "completed" : ""}`} />
        <div className={`progress-step ${step >= 3 ? "completed" : ""} ${step === 3 ? "active" : ""}`}>
          <span className="step-number">3</span>
          <span className="step-label">Review & Launch</span>
        </div>
      </div>

      <form className="vendor-form" onSubmit={handleSubmit}>
        <div className="vendor-form-container">
          {/* Step 1: Store Info */}
          {step === 1 && (
            <>
              <h1>Tell Us About Your Store</h1>
              <p className="form-subtitle">Help customers know what you're selling</p>

              <div className="form-group">
                <label htmlFor="storeName">Store Name *</label>
                <input
                  id="storeName"
                  name="storeName"
                  type="text"
                  value={formData.storeName}
                  onChange={handleChange}
                  placeholder="e.g., Himalayan Crafts Co."
                  className={errors.storeName ? "error" : ""}
                />
                {errors.storeName && <span className="error-msg">{errors.storeName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="description">Store Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe what you sell, your story, and what makes your products special..."
                  rows={5}
                  className={errors.description ? "error" : ""}
                />
                {errors.description && <span className="error-msg">{errors.description}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="logo">Logo URL (optional)</label>
                <input
                  id="logo"
                  name="logo"
                  type="url"
                  value={formData.logo}
                  onChange={handleChange}
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="form-group">
                <label htmlFor="banner">Banner Image URL (optional)</label>
                <input
                  id="banner"
                  name="banner"
                  type="url"
                  value={formData.banner}
                  onChange={handleChange}
                  placeholder="https://example.com/banner.jpg"
                />
              </div>
            </>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <>
              <h1>Where Are You Located?</h1>
              <p className="form-subtitle">Help customers know where to expect shipments from</p>

              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+977-98XXXXXXXX"
                  className={errors.phone ? "error" : ""}
                />
                {errors.phone && <span className="error-msg">{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="address">Street Address (optional)</label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Tole, Ward No."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City *</label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Kathmandu"
                    className={errors.city ? "error" : ""}
                  />
                  {errors.city && <span className="error-msg">{errors.city}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="province">Province *</label>
                  <select
                    id="province"
                    name="province"
                    value={formData.province}
                    onChange={handleChange}
                    className={errors.province ? "error" : ""}
                  >
                    <option value="">Select Province</option>
                    {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  {errors.province && <span className="error-msg">{errors.province}</span>}
                </div>
              </div>
            </>
          )}

          {/* Step 3: Review & Launch */}
          {step === 3 && (
            <>
              <h1>Review & Launch Your Store</h1>
              <p className="form-subtitle">Check your details before going live</p>

              <div className="review-card">
                <h3>Store Details</h3>
                <div className="review-row">
                  <span className="review-label">Store Name:</span>
                  <span className="review-value">{formData.storeName}</span>
                </div>
                <div className="review-row">
                  <span className="review-label">Description:</span>
                  <span className="review-value">{formData.description}</span>
                </div>
                <div className="review-row">
                  <span className="review-label">Phone:</span>
                  <span className="review-value">{formData.phone}</span>
                </div>
                <div className="review-row">
                  <span className="review-label">Location:</span>
                  <span className="review-value">{formData.city}, {formData.province}</span>
                </div>
              </div>

              <div className="form-checkbox">
                <input
                  id="agreeTerms"
                  name="agreeTerms"
                  type="checkbox"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                />
                <label htmlFor="agreeTerms">
                  I agree to the <a href="/terms">Terms of Service</a> and <a href="/seller-policy">Seller Policy</a>
                </label>
                {errors.agreeTerms && <span className="error-msg">{errors.agreeTerms}</span>}
              </div>

              {errors.submit && <div className="submit-error">{errors.submit}</div>}

              <div className="form-actions">
                <button type="button" className="back-btn" onClick={() => setStep(2)}>
                  ← Back
                </button>
                <button type="submit" className="launch-btn" disabled={loading}>
                  {loading ? "Creating Store..." : "🚀 Launch My Store"}
                </button>
              </div>
            </>
          )}

          {/* Navigation for steps 1-2 */}
          {step < 3 && (
            <div className="form-actions">
              {step > 1 && (
                <button type="button" className="back-btn" onClick={() => setStep(step - 1)}>
                  ← Back
                </button>
              )}
              <button type="submit" className="next-btn">
                {step === 1 ? "Continue →" : "Continue →"}
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
