import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react";

export interface CartItem {
	id: string;
	name: string;
	price: number;
	image: string;
	size?: string;
	color?: { name: string; hex: string };
	quantity: number;
}

interface CartContextValue {
	items: CartItem[];
	count: number;
	addItem: (item: CartItem) => void;
	removeItem: (id: string) => void;
	updateQuantity: (id: string, qty: number) => void;
	clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
	const [items, setItems] = useState<CartItem[]>([]);

	const count = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

	const addItem = useCallback((item: CartItem) => {
		setItems((prev) => {
			const existing = prev.find(
				(i) => i.id === item.id && i.size === item.size && i.color?.name === item.color?.name
			);
			if (existing) {
				return prev.map((i) =>
					i === existing ? { ...i, quantity: i.quantity + item.quantity } : i
				);
			}
			return [...prev, item];
		});
	}, []);

	const removeItem = useCallback((id: string) => {
		setItems((prev) => prev.filter((i) => i.id !== id));
	}, []);

	const updateQuantity = useCallback((id: string, qty: number) => {
		setItems((prev) =>
			qty <= 0 ? prev.filter((i) => i.id !== id) : prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i))
		);
	}, []);

	const clear = useCallback(() => setItems([]), []);

	const value = useMemo(
		() => ({ items, count, addItem, removeItem, updateQuantity, clear }),
		[items, count, addItem, removeItem, updateQuantity, clear]
	);

	return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
	const ctx = useContext(CartContext);
	if (!ctx) throw new Error("useCart must be used within CartProvider");
	return ctx;
};
