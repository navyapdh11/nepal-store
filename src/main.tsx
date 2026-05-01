import React from "react";
import * as ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { CartProvider } from "./context/CartContext.tsx";
import { router } from "./router.tsx";
import "./index.css";

const rootElement = document.getElementById("root");
if (rootElement) {
	ReactDOM.createRoot(rootElement).render(
		<React.StrictMode>
			<CartProvider>
				<HelmetProvider>
					<RouterProvider router={router} />
				</HelmetProvider>
			</CartProvider>
		</React.StrictMode>,
	);
}
