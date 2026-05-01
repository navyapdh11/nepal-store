import { Link } from "react-router-dom";
import { useMemo } from "react";
import "./Breadcrumb.css";

interface BreadcrumbItem {
	label: string;
	href?: string;
}

export const Breadcrumb = ({ items }: { items: BreadcrumbItem[] }) => {
	const jsonLd = useMemo(
		() => ({
			"@context": "https://schema.org",
			"@type": "BreadcrumbList",
			itemListElement: items.map((item, i) => ({
				"@type": "ListItem",
				position: i + 1,
				name: item.label,
				item: item.href ? `https://nepal-store.onrender.com${item.href}` : undefined,
			})),
		}),
		[items],
	);

	return (
		<>
			<script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
			<nav className="breadcrumb" aria-label="Breadcrumb">
				<ol>
					{items.map((item, i) => (
						<li key={i} className={i === items.length - 1 ? "current" : ""}>
							{i < items.length - 1 && item.href ? (
								<Link to={item.href}>{item.label}</Link>
							) : (
								<span aria-current="page">{item.label}</span>
							)}
							{i < items.length - 1 && <span className="sep">›</span>}
						</li>
					))}
				</ol>
			</nav>
		</>
	);
};
