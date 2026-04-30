import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import { FAQ } from "./components/FAQ";

export const router = createBrowserRouter([
	{
		path: "/",
		element: <App />,
	},
	{
		path: "/faq",
		element: <FAQ />,
	},
]);
