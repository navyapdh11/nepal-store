import { useCallback } from "react";
import "./Cart.css";

interface CartItem {
	id: string;
	name: string;
	price: number;
	image: string;
	size: string;
	color: { name: string; hex: string };
	quantity: number;
}

interface CartDrawerProps {
	items: CartItem[];
	isOpen: boolean;
	onClose: () => void;
	onRemove: (id: string) => void;
	onQuantityChange: (id: string, qty: number) => void;
}

export const CartDrawer = ({ items, isOpen, onClose, onRemove, onQuantityChange }: CartDrawerProps) => {
	const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

	const handleCheckout = useCallback(() => {
		alert("Checkout functionality coming soon!");
	}, []);

	return (
		<>
			{isOpen && <div className="cart-overlay" onClick={onClose} />}
			<div className={`cart-drawer ${isOpen ? "open" : ""}`}>
				<div className="cart-header">
					<h2>Shopping Bag ({items.length})</h2>
					<button type="button" className="cart-close" onClick={onClose} aria-label="Close Cart">✕</button>
				</div>

				{items.length === 0 ? (
					<div className="cart-empty">
						<div className="cart-empty-icon">🛒</div>
						<p>Your bag is empty</p>
						<button type="button" className="cart-continue" onClick={onClose}>Continue Shopping</button>
					</div>
				) : (
					<>
						<div className="cart-items">
							{items.map(item => (
								<div key={`${item.id}-${item.size}-${item.color.name}`} className="cart-item">
									<div className="cart-item-image">
										<img src={item.image} alt={item.name} loading="lazy" />
									</div>
									<div className="cart-item-details">
										<h3>{item.name}</h3>
										<p className="cart-item-meta">
											Size: {item.size} · Color: {item.color.name}
										</p>
										<div className="cart-item-actions">
											<div className="qty-control">
												<button
													type="button"
													onClick={() => onQuantityChange(item.id, item.quantity - 1)}
													disabled={item.quantity <= 1}
												>−</button>
												<span>{item.quantity}</span>
												<button
													type="button"
													onClick={() => onQuantityChange(item.id, item.quantity + 1)}
												>+</button>
											</div>
											<p className="cart-item-price">रू {(item.price * item.quantity).toLocaleString()}</p>
											<button
												type="button"
												className="cart-item-remove"
												onClick={() => onRemove(item.id)}
											>Remove</button>
										</div>
									</div>
								</div>
							))}
						</div>

						<div className="cart-footer">
							<div className="cart-subtotal">
								<span>Subtotal</span>
								<span className="cart-total-price">रू {total.toLocaleString()}</span>
							</div>
							<p className="cart-shipping-note">Free shipping on orders over रू 10,000</p>
							<button type="button" className="cart-checkout-btn" onClick={handleCheckout}>
								Checkout
							</button>
						</div>
					</>
				)}
			</div>
		</>
	);
};
