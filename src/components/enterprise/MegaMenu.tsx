import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ShoppingBag, ShieldCheck, BarChart3, MapPin } from 'lucide-react';
import './MegaMenu.css';

interface TabInfo {
	icon: JSX.Element;
	label: string;
	description: string;
	items: { label: string; route: string }[];
}

const menuData: Record<string, TabInfo> = {
	SHOP: {
		icon: <ShoppingBag size={16} />,
		label: 'Shop',
		description: 'Authentic Nepalese fashion — cashmere, Dhaka, traditional wear.',
		items: [
			{ label: "Women's Collection", route: 'women' },
			{ label: "Men's Collection", route: 'men' },
			{ label: 'Traditional Heritage', route: 'traditional' },
			{ label: 'Active & Sports', route: 'sports' },
			{ label: 'Seasonal Picks', route: 'seasonal' },
			{ label: 'Kids & Youth', route: 'kids' },
			{ label: 'Baby Essentials', route: 'baby' },
			{ label: 'Accessories', route: 'accessories' },
			{ label: 'Home & Living', route: 'home' },
			{ label: 'Sale', route: 'sale' },
		],
	},
	SERVICES: {
		icon: <ShieldCheck size={16} />,
		label: 'Services',
		description: 'Enterprise security and analytics for the Nepalese market.',
		items: [
			{ label: 'Sanitization Logs', route: 'Corporate Matrix' },
			{ label: 'Audit Trails', route: 'Audit Trails' },
			{ label: 'Infrastructure Guard', route: 'Infrastructure Guard' },
			{ label: 'High-Throughput Analytics', route: 'High-Throughput Analytics' },
		],
	},
	PRICING: {
		icon: <BarChart3 size={16} />,
		label: 'Pricing',
		description: 'Flexible plans for businesses of every scale.',
		items: [
			{ label: 'Corporate Matrix', route: 'Corporate Matrix' },
			{ label: 'Government Tiers', route: 'Government Tiers' },
			{ label: 'Industrial Quoting', route: 'Industrial Quoting' },
			{ label: 'Retail Standard', route: 'Retail Standard' },
		],
	},
	LOCATIONS: {
		icon: <MapPin size={16} />,
		label: 'Locations',
		description: 'Serving all 77 districts from 7 provincial hubs.',
		items: [
			{ label: 'Bagmati Hub', route: 'women' },
			{ label: 'Koshi Center', route: 'women' },
			{ label: 'Gandaki Logistics', route: 'women' },
			{ label: 'Lumbini Sector', route: 'women' },
		],
	},
};

export const MegaMenu = ({ onCategoryChange }: { onCategoryChange: (cat: string) => void }) => {
	const [activeTab, setActiveTab] = useState<string | null>(null);

	const handleSelect = useCallback((route: string) => {
		onCategoryChange(route);
		setActiveTab(null);
	}, [onCategoryChange]);

	const tabs = Object.entries(menuData);

	return (
		<nav className="mega-menu-nav" onMouseLeave={() => setActiveTab(null)}>
			<div className="mega-menu-container">
				{tabs.map(([key, data]) => (
					<div
						key={key}
						className="mega-menu-item"
						onMouseEnter={() => setActiveTab(key)}
					>
						<button
							type="button"
							className={`mega-menu-trigger ${activeTab === key ? 'active' : ''}`}
							onFocus={() => setActiveTab(key)}
							aria-expanded={activeTab === key}
							aria-haspopup="true"
						>
							{data.icon}
							<span className="mega-menu-label">{data.label}</span>
							<ChevronDown size={12} className={`mega-chevron ${activeTab === key ? 'rotated' : ''}`} />
						</button>

						<AnimatePresence>
							{activeTab === key && (
								<motion.div
									initial={{ opacity: 0, y: 8 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: 4 }}
									transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
									className="mega-dropdown-panel"
									role="menu"
								>
									<div className="mega-dropdown-header">
										<h3 className="mega-dropdown-title">{data.label}</h3>
										<p className="mega-dropdown-desc">{data.description}</p>
									</div>
									<div className="mega-dropdown-links">
										{data.items.map((item) => (
											<a
												key={item.label}
												href={`/${item.route}`}
												onClick={(e) => {
													e.preventDefault();
													handleSelect(item.route);
												}}
												className="mega-dropdown-link"
												role="menuitem"
											>
												<span>{item.label}</span>
												<ChevronDown size={12} className="mega-link-arrow" />
											</a>
										))}
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				))}
			</div>
		</nav>
	);
};
