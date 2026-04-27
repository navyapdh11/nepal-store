import { useState } from "react";
import "./Navigation.css";

const categories = ["WOMEN", "MEN", "KIDS", "BABY", "SPORTS", "ACCESSORIES", "HOME", "SALE"];

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
		<nav className="gender-nav">
			{categories.map((cat) => (
				<button
					type="button"
					key={cat}
					className={`nav-tab ${active === cat ? "active" : ""}`}
					onClick={() => handleSelect(cat)}
				>
					{cat}
				</button>
			))}
		</nav>
	);
};
