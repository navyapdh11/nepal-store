import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ShoppingBag, ShieldCheck, BarChart3, MapPin } from 'lucide-react';
import './MegaMenu.css';

const menuData = {
	SHOP: {
		icon: <ShoppingBag size={18} />,
		items: ['WOMEN', 'MEN', 'SPORTS', 'TRADITIONAL', 'SEASONAL', 'KIDS', 'BABY']
	},
	SERVICES: {
		icon: <ShieldCheck size={18} />,
		items: ['Sanitization Logs', 'Audit Trails', 'Infrastructure Guard', 'High-Throughput Analytics']
	},
	PRICING: {
		icon: <BarChart3 size={18} />,
		items: ['Corporate Matrix', 'Government Tiers', 'Industrial Quoting', 'Retail Standard']
	},
	LOCATIONS: {
		icon: <MapPin size={18} />,
		items: ['Bagmati Hub', 'Koshi Center', 'Gandaki Logistics', 'Lumbini Sector']
	}
};

export const MegaMenu = ({ onCategoryChange }: { onCategoryChange: (cat: string) => void }) => {
	const [activeTab, setActiveTab] = useState<string | null>(null);

	return (
		<nav className="mega-menu-nav glass" onMouseLeave={() => setActiveTab(null)}>
			<div className="menu-container">
				{Object.entries(menuData).map(([key, data]) => (
					<div 
						key={key} 
						className="menu-item-wrapper"
						onMouseEnter={() => setActiveTab(key)}
						role="none"
					>
						<button 
							type="button"
							className={`menu-trigger ${activeTab === key ? 'active' : ''}`}
							onFocus={() => setActiveTab(key)}
							aria-expanded={activeTab === key}
							aria-haspopup="true"
						>
							{data.icon}
							<span>{key}</span>
							<ChevronDown size={14} className={activeTab === key ? 'rotate' : ''} />
						</button>

						<AnimatePresence>
							{activeTab === key && (
								<motion.div 
									initial={{ opacity: 0, y: 15, scale: 0.98 }}
									animate={{ opacity: 1, y: 0, scale: 1 }}
									exit={{ opacity: 0, y: 10, scale: 0.98 }}
									transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
									className="mega-dropdown glass-deep"
									role="menu"
								>
									<div className="dropdown-grid">
										<div className="dropdown-info">
											<h3>{key}</h3>
											<p>Sophisticated 2026 {key.toLowerCase()} solutions for the Nepalese market.</p>
											<div className="hd-accent-line" />
										</div>
										<div className="dropdown-links">
											{data.items.map(item => (
												<button 
													key={item} 
													type="button"
													onClick={() => {
														onCategoryChange(item);
														setActiveTab(null);
													}}
													className="dropdown-link"
													role="menuitem"
												>
													{item}
												</button>
											))}
										</div>
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
