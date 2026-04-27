import React, { useState } from 'react';
import { Player } from '@remotion/player';
import { HeroBanner } from './remotion/compositions/HeroBanner';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { NudgeBar } from './components/NudgeBar';
import './App.css';

function App() {
  const [category, setCategory] = useState('WOMEN');

  return (
    <div className="app">
      <Header />
      <Navigation onCategoryChange={setCategory} />
      <NudgeBar category={category} />
      
      <main className="home-main">
        <section className="hero-section">
          <Player
            component={HeroBanner}
            durationInFrames={300}
            compositionWidth={1920}
            compositionHeight={1080}
            fps={30}
            style={{
              width: '100%',
              aspectRatio: '16/9',
            }}
            inputProps={{
              title: 'NEPAL STORE',
              subtitle: `${category} LifeWear Collection`,
            }}
            autoPlay
            loop
          />
        </section>

        <section className="featured-collections">
          <h2>Featured for {category}</h2>
          <div className="grid placeholder-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="product-card-placeholder">
                <div className="image-box"></div>
                <div className="info-box">
                  <div className="line"></div>
                  <div className="line short"></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="main-footer">
        <p>&copy; 2026 NEPAL STORE. Inspired by LifeWear.</p>
      </footer>
    </div>
  );
}

export default App;
