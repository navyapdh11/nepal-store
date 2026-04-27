import React from 'react';
import { User } from '../lib/auth';
import { NEPAL_REGIONS, findNodeDFS } from '../lib/utils/dfs';
import './Dashboard.css';

export const Dashboard: React.FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => {
  // Example of using DFS to find user's regional hub
  const regionalHub = findNodeDFS(NEPAL_REGIONS, 'p3-ktm');

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="user-profile">
          <div className="avatar">{user.name[0]}</div>
          <div className="user-info">
            <h2>{user.name}</h2>
            <p>{user.email}</p>
          </div>
        </div>
        <button onClick={onLogout} className="logout-btn">Logout</button>
      </header>

      <div className="dashboard-grid">
        {/* Myntra Insider Style Loyalty */}
        <section className="dashboard-card loyalty-hub">
          <h3>Nepal Store Insider</h3>
          <div className="points-display">
            <span className="points">1,250</span>
            <span className="label">Points Earned</span>
          </div>
          <div className="tier-badge">SILVER TIER</div>
        </section>

        {/* Flipkart Style Order Timeline */}
        <section className="dashboard-card order-timeline">
          <h3>Recent Orders</h3>
          <div className="order-item">
            <div className="order-status completed"></div>
            <div className="order-details">
              <h4>Ultra Light Down Jacket</h4>
              <p>Delivered on April 20, 2026</p>
            </div>
          </div>
          <div className="order-item">
            <div className="order-status processing"></div>
            <div className="order-details">
              <h4>Premium Pashmina Scarf</h4>
              <p>Expected by Tomorrow</p>
            </div>
          </div>
        </section>

        {/* Regional Hub (DFS Data) */}
        <section className="dashboard-card regional-hub">
          <h3>Your Regional Hub</h3>
          <p>📍 {regionalHub?.name || 'Kathmandu'}</p>
          <small>Service priority: High</small>
        </section>

        {/* Taobao Style AI Nudges */}
        <section className="dashboard-card ai-wenwen">
          <h3>Wenwen Assistant ✨</h3>
          <p>"You've unlocked a 15% discount on your next Pashmina purchase. Ready to shop?"</p>
        </section>
      </div>
    </div>
  );
};
