import React from 'react';
import './Header.css';

export const Header: React.FC = () => {
  return (
    <header className="main-header">
      <div className="header-top">
        <div className="logo">NEPAL STORE</div>
        <div className="header-actions">
          <button className="icon-btn search-btn">🔍</button>
          <button className="icon-btn cart-btn">🛒</button>
        </div>
      </div>
    </header>
  );
};
