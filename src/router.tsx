import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/Layout";
import { HomePage } from "./components/HomePage";
import { CategoryPage } from "./components/CategoryPage";
import { ProductPage } from "./components/ProductPage";
import { FAQ } from "./components/FAQ";
import { About } from "./components/About";
import { Contact } from "./components/Contact";
import App from "./App";

export const router = createBrowserRouter([
	{
		path: "/",
		element: (
			<Layout currentPage="home">
				<HomePage />
			</Layout>
		),
	},
	{
		path: "/:category",
		element: (
			<Layout currentPage={window.location.pathname.slice(1)}>
				<CategoryPage />
			</Layout>
		),
	},
	{
		path: "/:category/:productId",
		element: (
			<Layout currentPage={window.location.pathname.slice(1).split("/")[0]}>
				<ProductPage />
			</Layout>
		),
	},
	{
		path: "/faq",
		element: (
			<Layout currentPage="faq">
				<FAQ />
			</Layout>
		),
	},
	{
		path: "/about",
		element: (
			<Layout currentPage="about">
				<About />
			</Layout>
		),
	},
	{
		path: "/contact",
		element: (
			<Layout currentPage="contact">
				<Contact />
			</Layout>
		),
	},
	// Legacy: App at /app for enterprise views + legacy SPA
	{
		path: "/app",
		element: <App />,
	},
]);
