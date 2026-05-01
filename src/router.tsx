import { createBrowserRouter } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Layout } from "./components/Layout";
import App from "./App";

// Lazy load route components for code splitting
const HomePage = lazy(() => import("./components/HomePage").then(m => ({ default: m.HomePage })));
const CategoryPage = lazy(() => import("./components/CategoryPage").then(m => ({ default: m.CategoryPage })));
const ProductPage = lazy(() => import("./components/ProductPage").then(m => ({ default: m.ProductPage })));
const FAQ = lazy(() => import("./components/FAQ").then(m => ({ default: m.FAQ })));
const About = lazy(() => import("./components/About").then(m => ({ default: m.About })));
const Contact = lazy(() => import("./components/Contact").then(m => ({ default: m.Contact })));
const AdminDashboard = lazy(() => import("./components/AdminDashboard").then(m => ({ default: m.AdminDashboard })));

// Nepal Bazaar Marketplace routes
const NepalBazaarPage = lazy(() => import("./components/NepalBazaarPage").then(m => ({ default: m.NepalBazaarPage })));
const VendorStorePage = lazy(() => import("./components/VendorStorePage").then(m => ({ default: m.VendorStorePage })));
const BecomeVendorPage = lazy(() => import("./components/BecomeVendorPage").then(m => ({ default: m.BecomeVendorPage })));
const CheckoutPage = lazy(() => import("./components/CheckoutPage").then(m => ({ default: m.CheckoutPage })));

// Loading fallback component
const LoadingFallback = () => (
	<div className="loading-skeleton" role="status" aria-live="polite">
		<div className="skeleton-loader" />
		<p>Loading...</p>
	</div>
);

// Wrapper component for lazy-loaded routes
const LazyRoute = ({ children }: { children: React.ReactNode }) => (
	<Suspense fallback={<LoadingFallback />}>
		{children}
	</Suspense>
);

export const router = createBrowserRouter([
	{
		path: "/",
		element: (
			<Layout currentPage="home">
				<LazyRoute>
					<HomePage />
				</LazyRoute>
			</Layout>
		),
	},
	{
		path: "/:category",
		element: (
			<Layout currentPage={window.location.pathname.slice(1)}>
				<LazyRoute>
					<CategoryPage />
				</LazyRoute>
			</Layout>
		),
	},
	{
		path: "/:category/:productId",
		element: (
			<Layout currentPage={window.location.pathname.slice(1).split("/")[0]}>
				<LazyRoute>
					<ProductPage />
				</LazyRoute>
			</Layout>
		),
	},
	{
		path: "/faq",
		element: (
			<Layout currentPage="faq">
				<LazyRoute>
					<FAQ />
				</LazyRoute>
			</Layout>
		),
	},
	{
		path: "/about",
		element: (
			<Layout currentPage="about">
				<LazyRoute>
					<About />
				</LazyRoute>
			</Layout>
		),
	},
	{
		path: "/contact",
		element: (
			<Layout currentPage="contact">
				<LazyRoute>
					<Contact />
				</LazyRoute>
			</Layout>
		),
	},
	{
		path: "/admin",
		element: (
			<LazyRoute>
				<AdminDashboard />
			</LazyRoute>
		),
	},

	// ─── Nepal Bazaar Marketplace Routes ───
	{
		path: "/bazaar",
		element: (
			<Layout currentPage="bazaar">
				<LazyRoute>
					<NepalBazaarPage />
				</LazyRoute>
			</Layout>
		),
	},
	{
		path: "/bazaar/store/:slug",
		element: (
			<Layout currentPage="bazaar">
				<LazyRoute>
					<VendorStorePage />
				</LazyRoute>
			</Layout>
		),
	},
	{
		path: "/bazaar/become-vendor",
		element: (
			<Layout currentPage="bazaar">
				<LazyRoute>
					<BecomeVendorPage />
				</LazyRoute>
			</Layout>
		),
	},
	{
		path: "/bazaar/category/:categoryId",
		element: (
			<Layout currentPage="bazaar">
				<LazyRoute>
					<NepalBazaarPage />
				</LazyRoute>
			</Layout>
		),
	},
	{
		path: "/bazaar/search",
		element: (
			<Layout currentPage="bazaar">
				<LazyRoute>
					<NepalBazaarPage />
				</LazyRoute>
			</Layout>
		),
	},
	{
		path: "/bazaar/flash-sale",
		element: (
			<Layout currentPage="bazaar">
				<LazyRoute>
					<NepalBazaarPage />
				</LazyRoute>
			</Layout>
		),
	},
	{
		path: "/bazaar/trending",
		element: (
			<Layout currentPage="bazaar">
				<LazyRoute>
					<NepalBazaarPage />
				</LazyRoute>
			</Layout>
		),
	},
	{
		path: "/bazaar/vendors",
		element: (
			<Layout currentPage="bazaar">
				<LazyRoute>
					<NepalBazaarPage />
				</LazyRoute>
			</Layout>
		),
	},
	{
		path: "/checkout",
		element: (
			<Layout currentPage="checkout">
				<LazyRoute>
					<CheckoutPage />
				</LazyRoute>
			</Layout>
		),
	},

	// Legacy: App at /app for enterprise views + legacy SPA
	{
		path: "/app",
		element: <App />,
	},
]);
