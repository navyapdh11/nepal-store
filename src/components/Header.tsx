import "./Header.css";

export const Header = ({ cartCount = 0 }: { cartCount?: number }) => {
	return (
		<header className="main-header">
			<div className="header-top">
				<div className="logo-container">
					<div className="uniqlo-logo-box">
						<span>NEPAL</span>
						<span>STORE</span>
					</div>
				</div>
				<div className="header-actions">
					<button type="button" className="icon-btn search-btn" aria-label="Search">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<circle cx="11" cy="11" r="8"></circle>
							<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
						</svg>
					</button>
					<button type="button" className="icon-btn cart-btn" aria-label="Cart">
						<div className="cart-icon-wrapper">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
								<line x1="3" y1="6" x2="21" y2="6"></line>
								<path d="M16 10a4 4 0 0 1-8 0"></path>
							</svg>
							{cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
						</div>
					</button>
				</div>
			</div>
		</header>
	);
};
