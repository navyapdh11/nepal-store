import "./Header.css";

export const Header = () => {
	return (
		<header className="main-header">
			<div className="header-top">
				<div className="logo">NEPAL STORE</div>
				<div className="header-actions">
					<button type="button" className="icon-btn search-btn">
						🔍
					</button>
					<button type="button" className="icon-btn cart-btn">
						🛒
					</button>
				</div>
			</div>
		</header>
	);
};
