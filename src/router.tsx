import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import { HomePage } from "./components/HomePage";
import { CategoryPage } from "./components/CategoryPage";
import { ProductPage } from "./components/ProductPage";
import { FAQ } from "./components/FAQ";
import { About } from "./components/About";
import { Contact } from "./components/Contact";

export const router = createBrowserRouter([
	{
		path: "/",
		element: <HomePage />,
	},
	{
		path: "/:category",
		element: <CategoryPage />,
	},
	{
		path: "/:category/:productId",
		element: <ProductPage />,
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
