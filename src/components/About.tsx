import "./About.css";

export const About = () => {
	return (
		<div className="about-page">
			<section className="about-hero">
				<h1 className="font-display">Our Story</h1>
				<p className="about-hero-sub">Bridging Nepal's rich textile heritage with modern design.</p>
			</section>

			<section className="about-content">
				<div className="about-grid">
					<div className="about-card glass-card animate-fadeInUp">
						<div className="about-card-icon">🏔️</div>
						<h3>Rooted in Nepal</h3>
						<p>Born from the Himalayan foothills, Nepal Store celebrates the country's centuries-old craftsmanship — from handwoven dhaka fabric to pure pashmina from the high mountains.</p>
					</div>

					<div className="about-card glass-card animate-fadeInUp stagger-3">
						<div className="about-card-icon">🧵</div>
						<h3>Artisan Partners</h3>
						<p>We work directly with 200+ artisan families across Kathmandu Valley, Bhaktapur, Patan, and the Terai region. Every purchase supports fair wages and traditional craft preservation.</p>
					</div>

					<div className="about-card glass-card animate-fadeInUp stagger-6">
						<div className="about-card-icon">🌱</div>
						<h3>Sustainable Future</h3>
						<p>Our commitment to eco-friendly materials, zero-waste packaging, and carbon-neutral delivery ensures that tradition and sustainability go hand in hand.</p>
					</div>
				</div>
			</section>

			<section className="about-stats">
				<div className="stats-grid">
					<div className="stat-item">
						<span className="stat-number font-display">200+</span>
						<span className="stat-label">Artisan Families</span>
					</div>
					<div className="stat-item">
						<span className="stat-number font-display">50K+</span>
						<span className="stat-label">Happy Customers</span>
					</div>
					<div className="stat-item">
						<span className="stat-number font-display">77</span>
						<span className="stat-label">Districts Served</span>
					</div>
					<div className="stat-item">
						<span className="stat-number font-display">100%</span>
						<span className="stat-label">Handcrafted</span>
					</div>
				</div>
			</section>

			<section className="about-team">
				<h2 className="font-display">Our Values</h2>
				<div className="values-list">
					<div className="value-item">
						<div className="value-number">01</div>
						<div className="value-content">
							<h3>Quality Without Compromise</h3>
							<p>Every product passes through our 5-point quality inspection — from raw material sourcing to final stitching. We believe Nepali craftsmanship deserves world-class standards.</p>
						</div>
					</div>
					<div className="value-item">
						<div className="value-number">02</div>
						<div className="value-content">
							<h3>Design That Tells a Story</h3>
							<p>Each collection draws inspiration from Nepal's diverse cultural tapestry — Newari temple art, Sherpa mountain life, Terai tribal patterns. You don't just wear clothes; you wear heritage.</p>
						</div>
					</div>
					<div className="value-item">
						<div className="value-number">03</div>
						<div className="value-content">
							<h3>Accessibility for All</h3>
							<p>Premium quality doesn't have to mean premium prices. Our direct-to-consumer model cuts out middlemen, bringing artisan-made products at honest prices to every corner of Nepal.</p>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
};
