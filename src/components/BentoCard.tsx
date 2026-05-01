import { memo } from "react";
import "./BentoCard.css";

interface Product {
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

export const BentoCard = memo(
	({
		product,
		index,
		onClick,
	}: {
		product: Product;
		index: number;
		onClick: (p: Product) => void;
	}) => {
		return (
			<article
				className="bento-card"
				onClick={() => onClick(product)}
				style={{ "--stagger": `${index * 0.05}s` } as React.CSSProperties}
			>
				<div className="card-image-wrap">
					<img
						src={product.image}
						alt={product.name}
						loading={index < 6 ? "eager" : "lazy"}
						width="400"
						height="500"
						style={{ aspectRatio: "4/5", objectFit: "cover" }}
					/>
					{product.isNew && <span className="new-badge">NEW</span>}
				</div>
				<div className="product-info-glass">
					<h3>{product.name}</h3>
					<div className="price-row">
						<span className="price">रू{product.price.toLocaleString()}</span>
						{product.rating && (
							<span className="rating">★ {product.rating}</span>
						)}
					</div>
					<div className="color-dots">
						{product.colors.slice(0, 4).map((c, i) => (
							<span key={i} style={{ backgroundColor: c.hex }} title={c.name} />
						))}
					</div>
				</div>
			</article>
		);
	},
);
