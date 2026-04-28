import { motion } from 'framer-motion';
import { Check, Zap, Rocket, Building2 } from 'lucide-react';
import './PricingMatrix.css';

const tiers = [
	{
		name: 'Essential',
		price: '15,000',
		icon: <Zap size={24} />,
		benefits: ['Retail Sanitization', 'Basic Audit Logs', 'Regional Support', 'Standard Dispatch'],
		color: '#666'
	},
	{
		name: 'Professional',
		price: '85,000',
		icon: <Rocket size={24} />,
		benefits: ['Industrial Guard', 'Full Audit Trail', 'National Infrastructure', '24/7 Tech Guard', 'Priority Logistics'],
		color: '#c41e3a',
		featured: true
	},
	{
		name: 'Enterprise',
		price: 'Custom',
		icon: <Building2 size={24} />,
		benefits: ['Government Grade', 'High-Throughput Node', 'Custom API Layer', 'Sanitization Grid', 'Dedicated Account Sync'],
		color: '#000'
	}
];

export const PricingMatrix = () => {
	return (
		<div className="pricing-section">
			<div className="pricing-header">
				<h2>Enterprise Pricing Matrix</h2>
				<p>Tier-based transparency for 2026 corporate sectors.</p>
			</div>

			<div className="pricing-grid">
				{tiers.map((tier, i) => (
					<motion.div 
						key={tier.name}
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ delay: i * 0.1, duration: 0.6 }}
						className={`pricing-card glass-deep ${tier.featured ? 'featured' : ''}`}
					>
						<div className="tier-icon" style={{ color: tier.color }}>
							{tier.icon}
						</div>
						<h3>{tier.name}</h3>
						<div className="price-display">
							{tier.price !== 'Custom' && <span className="currency">रू</span>}
							<span className="amount">{tier.price}</span>
							{tier.price !== 'Custom' && <span className="period">/mo</span>}
						</div>
						
						<ul className="benefits-list">
							{tier.benefits.map(benefit => (
								<li key={benefit}>
									<Check size={16} className="check-icon" aria-hidden="true" />
									<span>{benefit}</span>
								</li>
							))}
						</ul>

						<button type="button" className={`tier-btn ${tier.featured ? 'primary' : 'outline'}`}>
							{tier.price === 'Custom' ? 'Contact Sales' : 'Select Tier'}
						</button>

						{tier.featured && <div className="featured-badge">MOST POPULAR</div>}
					</motion.div>
				))}
			</div>
		</div>
	);
};
