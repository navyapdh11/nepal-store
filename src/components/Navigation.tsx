import { useState } from "react";
import "./Navigation.css";

const categories = [
	"WOMEN",
	"MEN",
	"SPORTS",
	"TRADITIONAL",
	"SEASONAL",
	"KIDS",
	"BABY",
	"HOME",
	"SALE",
];

export const Navigation = ({
	onCategoryChange,
}: {
	onCategoryChange: (cat: string) => void;
}) => {
	const [active, setActive] = useState("WOMEN");

	const handleSelect = (cat: string) => {
		setActive(cat);
		onCategoryChange(cat);
	};

	return (
		<nav className="gender-nav" role="tablist" aria-label="Product Categories">
			{categories.map((cat) => (
				<button
					type="button"
					key={cat}
					className={`nav-tab ${active === cat ? "active" : ""}`}
					onClick={() => handleSelect(cat)}
					role="tab"
					aria-selected={active === cat}
					aria-controls="category-panel"
					id={`tab-${cat}`}
				>
					{cat}
				</button>
			))}
		</nav>
	);
};
