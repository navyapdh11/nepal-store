import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Breadcrumb } from "./Breadcrumb";
import { useCart } from "../context/CartContext.tsx";
import "./CheckoutPage.css";

interface Address {
  name: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  zip?: string;
}

const PROVINCES = [
  "Koshi", "Madhesh", "Bagmati", "Gandaki", "Lumbini", "Karnali", "Sudurpashchim",
];

const PAYMENT_METHODS = [
  { id: "COD", name: "Cash on Delivery", icon: "💵", desc: "Pay when you receive" },
  { id: "eSewa", name: "eSewa", icon: "📱", desc: "Nepal's #1 digital wallet" },
  { id: "Khalti", name: "Khalti", icon: "💜", desc: "Secure digital payments" },
];

type Step = "cart" | "address" | "shipping" | "payment" | "confirm";

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items: cartItems, removeItem, updateQuantity, clearCart, total } = useCart();

  const [step, setStep] = useState<Step>("cart");
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState<Address>({
    name: "", phone: "", address: "", city: "", province: "", zip: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [addressError, setAddressError] = useState("");
  const [orderId, setOrderId] = useState("");

  const shippingCost = shippingMethod === "express" ? 250 : total >= 5000 ? 0 : 150;
  const tax = Math.round(total * 0.13); // 13% VAT
  const orderTotal = total + shippingCost + tax - couponDiscount;

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0 && step !== "confirm") {
      navigate("/");
    }
  }, [cartItems, step, navigate]);

  const applyCoupon = useCallback(async () => {
    if (!couponCode.trim()) return;
    try {
      const res = await fetch("/api/coupons/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, orderTotal: total }),
      });
      const data = await res.json();
      if (data.discount) {
        setCouponDiscount(data.discount);
      }
    } catch {
      // Coupon not found or invalid
    }
  }, [couponCode, total]);

  const validateAddress = useCallback(() => {
    if (!address.name.trim()) return "Name is required";
    if (!address.phone.trim() || address.phone.length < 10) return "Valid phone number is required";
    if (!address.address.trim()) return "Address is required";
    if (!address.city.trim()) return "City is required";
    if (!address.province) return "Province is required";
    return "";
  }, [address]);

  const handlePlaceOrder = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            size: item.size,
            color: item.color?.name || "Default",
          })),
          shippingAddress: address,
          paymentMethod,
          couponCode: couponCode || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setOrderId(data.orderNumber);
        clearCart();
        setStep("confirm");
      } else {
        const error = await res.json();
        setAddressError(error.error || "Failed to place order");
      }
    } catch {
      setAddressError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [cartItems, address, paymentMethod, couponCode, clearCart]);

  const handleNext = useCallback(() => {
    if (step === "cart") {
      setStep("address");
    } else if (step === "address") {
      const error = validateAddress();
      if (error) {
        setAddressError(error);
        return;
      }
      setAddressError("");
      setStep("shipping");
    } else if (step === "shipping") {
      setStep("payment");
    } else if (step === "payment") {
      handlePlaceOrder();
    }
  }, [step, validateAddress, handlePlaceOrder]);

  if (step === "confirm") {
    return (
      <div className="checkout-page">
        <Helmet><title>Order Confirmed — NEPAL STORE</title></Helmet>
        <div className="order-success">
          <div className="success-icon">✓</div>
          <h1>Order Confirmed!</h1>
          <p className="order-number">Order #{orderId}</p>
          <p className="success-message">
            Thank you for your purchase! You'll receive a confirmation email shortly.
          </p>
          <div className="order-actions">
            <button type="button" className="track-order-btn" onClick={() => navigate("/account")}>
              Track My Order
            </button>
            <button type="button" className="continue-shopping-btn" onClick={() => navigate("/")}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <Helmet><title>Checkout — NEPAL STORE</title></Helmet>
      <Breadcrumb items={[
        { label: "Home", href: "/" },
        { label: "Cart" },
        { label: "Checkout" },
      ]} />

      {/* Progress Steps */}
      <div className="checkout-progress">
        {(["cart", "address", "shipping", "payment"] as Step[]).map((s, i) => {
          const stepLabels = ["Cart", "Address", "Shipping", "Payment"];
          const currentIdx = ["cart", "address", "shipping", "payment"].indexOf(step);
          return (
            <div key={s} className={`checkout-step ${i < currentIdx ? "completed" : ""} ${s === step ? "active" : ""}`}>
              <span className="step-num">{i < currentIdx ? "✓" : i + 1}</span>
              <span className="step-label">{stepLabels[i]}</span>
            </div>
          );
        })}
      </div>

      <div className="checkout-layout">
        <div className="checkout-main">
          {/* Cart Step */}
          {step === "cart" && (
            <div className="cart-review">
              <h2>Review Your Cart ({cartItems.length} items)</h2>
              <div className="cart-items-list">
                {cartItems.map(item => (
                  <div key={item.id} className="cart-checkout-item">
                    <img src={item.image} alt={item.name} />
                    <div className="item-details">
                      <h3>{item.name}</h3>
                      <p className="item-variant">Size: {item.size} • Color: {item.color?.name || "Default"}</p>
                      <div className="item-controls">
                        <div className="qty-control">
                          <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                          <span>{item.quantity}</span>
                          <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                        </div>
                        <button type="button" className="remove-btn" onClick={() => removeItem(item.id)}>Remove</button>
                      </div>
                    </div>
                    <div className="item-price">
                      <span className="price">रू {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="coupon-section">
                <h3>Have a coupon?</h3>
                <div className="coupon-input-wrap">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                  />
                  <button type="button" onClick={applyCoupon}>Apply</button>
                </div>
                {couponDiscount > 0 && (
                  <p className="coupon-applied">✓ Coupon applied! Saving रू {couponDiscount.toLocaleString()}</p>
                )}
              </div>
            </div>
          )}

          {/* Address Step */}
          {step === "address" && (
            <div className="address-form-section">
              <h2>Shipping Address</h2>
              {addressError && <div className="form-error">{addressError}</div>}
              <div className="address-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="addr-name">Full Name *</label>
                    <input id="addr-name" type="text" value={address.name} onChange={e => setAddress(prev => ({ ...prev, name: e.target.value }))} placeholder="Ram Bahadur" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="addr-phone">Phone Number *</label>
                    <input id="addr-phone" type="tel" value={address.phone} onChange={e => setAddress(prev => ({ ...prev, phone: e.target.value }))} placeholder="+977-98XXXXXXXX" />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="addr-street">Street Address *</label>
                  <input id="addr-street" type="text" value={address.address} onChange={e => setAddress(prev => ({ ...prev, address: e.target.value }))} placeholder="Tole, Ward No., Street" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="addr-city">City *</label>
                    <input id="addr-city" type="text" value={address.city} onChange={e => setAddress(prev => ({ ...prev, city: e.target.value }))} placeholder="Kathmandu" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="addr-province">Province *</label>
                    <select id="addr-province" value={address.province} onChange={e => setAddress(prev => ({ ...prev, province: e.target.value }))}>
                      <option value="">Select Province</option>
                      {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="addr-zip">ZIP Code (optional)</label>
                    <input id="addr-zip" type="text" value={address.zip} onChange={e => setAddress(prev => ({ ...prev, zip: e.target.value }))} placeholder="44600" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Shipping Step */}
          {step === "shipping" && (
            <div className="shipping-section">
              <h2>Shipping Method</h2>
              <div className="shipping-options">
                <label className={`shipping-option ${shippingMethod === "standard" ? "selected" : ""}`}>
                  <input type="radio" name="shipping" value="standard" checked={shippingMethod === "standard"} onChange={() => setShippingMethod("standard")} />
                  <div className="shipping-option-info">
                    <h3>Standard Delivery</h3>
                    <p>5-7 business days across Nepal</p>
                  </div>
                  <div className="shipping-option-price">
                    {total >= 5000 ? <span className="free-label">FREE</span> : <span>रू 150</span>}
                  </div>
                </label>
                <label className={`shipping-option ${shippingMethod === "express" ? "selected" : ""}`}>
                  <input type="radio" name="shipping" value="express" checked={shippingMethod === "express"} onChange={() => setShippingMethod("express")} />
                  <div className="shipping-option-info">
                    <h3>Express Delivery</h3>
                    <p>2-3 business days (Kathmandu Valley)</p>
                  </div>
                  <div className="shipping-option-price">
                    <span>रू 250</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Payment Step */}
          {step === "payment" && (
            <div className="payment-section">
              <h2>Payment Method</h2>
              <div className="payment-options">
                {PAYMENT_METHODS.map(method => (
                  <label key={method.id} className={`payment-option ${paymentMethod === method.id ? "selected" : ""}`}>
                    <input type="radio" name="payment" value={method.id} checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} />
                    <span className="payment-icon">{method.icon}</span>
                    <div className="payment-info">
                      <h3>{method.name}</h3>
                      <p>{method.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="checkout-nav">
            {step !== "cart" && (
              <button type="button" className="back-btn" onClick={() => {
                const steps: Step[] = ["cart", "address", "shipping", "payment"];
                const idx = steps.indexOf(step);
                if (idx > 0) setStep(steps[idx - 1]);
              }}>
                ← Back
              </button>
            )}
            <button type="button" className="next-btn" onClick={handleNext} disabled={loading}>
              {loading ? "Processing..." : step === "payment" ? `Place Order — रू ${orderTotal.toLocaleString()}` : "Continue →"}
            </button>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="checkout-summary">
          <h3>Order Summary</h3>
          <div className="summary-items">
            {cartItems.map(item => (
              <div key={item.id} className="summary-item">
                <img src={item.image} alt={item.name} />
                <div className="summary-item-info">
                  <span className="summary-name">{item.name}</span>
                  <span className="summary-qty">Qty: {item.quantity}</span>
                </div>
                <span className="summary-price">रू {(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="summary-totals">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>रू {total.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{shippingCost === 0 ? "FREE" : `रू ${shippingCost}`}</span>
            </div>
            <div className="summary-row">
              <span>VAT (13%)</span>
              <span>रू {tax.toLocaleString()}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="summary-row discount">
                <span>Coupon Discount</span>
                <span>-रू {couponDiscount.toLocaleString()}</span>
              </div>
            )}
            <div className="summary-total">
              <span>Total</span>
              <span>रू {orderTotal.toLocaleString()}</span>
            </div>
          </div>
          <div className="summary-trust">
            <p>🔒 Secure checkout</p>
            <p>🚚 Free shipping over रू 5,000</p>
            <p>↩️ 14-day returns</p>
          </div>
        </div>
      </div>
    </div>
  );
};
