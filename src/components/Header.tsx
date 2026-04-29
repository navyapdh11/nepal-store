import { MegaMenu } from "./enterprise/MegaMenu";
import "./Header.css";

export const Header = ({
	cartCount = 0,
	onCategoryChange,
	onCartClick,
	onSearchClick,
}: {
	cartCount?: number;
	onCategoryChange: (cat: string) => void;
	onCartClick?: () => void;
	onSearchClick?: () => void;
}) => {
	return (
		<>
			<header className="main-header">
				<div className="header-top">
					<button type="button" className="logo-btn" onClick={() => onCategoryChange("WOMEN")} aria-label="Nepal Store Home">
						<div className="uniqlo-logo-box">
							<span>NEPAL</span>
							<span>STORE</span>
						</div>
					</button>
					<div className="header-actions">
						<button type="button" className="icon-btn search-btn" aria-label="Search" onClick={onSearchClick}>
							<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><title>Search Icon</title><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
						</button>
						<button type="button" className="icon-btn cart-btn" aria-label="Cart" onClick={onCartClick}>
							<div className="cart-icon-wrapper">
								<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><title>Cart Icon</title><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
								{cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
							</div>
						</button>
						<button type="button" className="icon-btn account-btn" aria-label="Account" onClick={() => onCategoryChange("ACCOUNT")}>
							<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><title>Account Icon</title><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
						</button>
					</div>
				</div>
			</header>
			<MegaMenu onCategoryChange={onCategoryChange} />
		</>
	);
};
