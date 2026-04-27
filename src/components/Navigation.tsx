import React, { useState } from 'react';
import './Navigation.css';

const categories = ['WOMEN', 'MEN', 'KIDS', 'BABY'];

export const Navigation: React.FC<{ onCategoryChange: (cat: string) => void }> = ({ onCategoryChange }) => {
  const [active, setActive] = useState('WOMEN');

  const handleSelect = (cat: string) => {
    setActive(cat);
    onCategoryChange(cat);
  };

  return (
    <nav className="gender-nav">
      {categories.map((cat) => (
        <button
          key={cat}
          className={`nav-tab ${active === cat ? 'active' : ''}`}
          onClick={() => handleSelect(cat)}
        >
          {cat}
        </button>
      ))}
    </nav>
  );
};
