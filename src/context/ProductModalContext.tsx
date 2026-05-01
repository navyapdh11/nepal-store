import { createContext, useContext } from "react";

interface ProductData {
	id: string;
	name: string;
	description: string;
	price: number;
	category: string;
	image: string;
	sizes: string[];
	colors: { name: string; hex: string }[];
	isNew?: boolean;
	rating?: string;
	reviews?: number;
}

interface ProductModalContextValue {
	openProduct: (product: ProductData) => void;
}

const ProductModalContext = createContext<ProductModalContextValue>({
	openProduct: () => {},
});

export const ProductModalProvider = ProductModalContext.Provider;

export const useProductModal = () => useContext(ProductModalContext);
