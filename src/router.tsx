import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import { HomePage } from "./components/HomePage";
import { CategoryPage } from "./components/CategoryPage";
import { ProductPage } from "./components/ProductPage";
import { FAQ } from "./components/FAQ";
import { About } from "./components/About";
import { Contact } from "./components/Contact";

// Shared product click handler — opens modal in App shell
let globalSetSelectedProduct: ((p: unknown) => void) | null = null;
export const registerProductClick = (fn: (p: unknown) => void) => {
	globalSetSelectedProduct = fn;
};

export const router = createBrowserRouter([
	{
		path: "/",
		element: <HomePage onProductClick={(p) => globalSetSelectedProduct?.(p)} />,
	},
	{
		path: "/:category",
		element: (
			<CategoryPage
				onProductClick={(p) => globalSetSelectedProduct?.(p)}
			/>
		),
	},
	{
		path: "/:category/:productId",
		element: <ProductPage onAddToCart={() => {}} />,
	},
	{
		path: "/faq",
		element: <FAQ />,
	},
	{
		path: "/about",
		element: <About />,
	},
	{
		path: "/contact",
		element: <Contact />,
	},
	// Legacy: keep App at /app for enterprise views
	{
		path: "/app",
		element: <App />,
	},
]);
