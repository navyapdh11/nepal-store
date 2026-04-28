import { useState, useMemo, useId } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Globe2, Building, Activity } from 'lucide-react';
import './QuotingEngine.css';

const sectors = [
	{ id: 'retail', name: 'Retail', base: 50, icon: <Building size={20} /> },
	{ id: 'industrial', name: 'Industrial', base: 120, icon: <Activity size={20} /> },
	{ id: 'government', name: 'Government', base: 250, icon: <Globe2 size={20} /> }
];

export const QuotingEngine = () => {
	const [sector, setSector] = useState(sectors[0]);
	const [scale, setScale] = useState(500); // sq meters
	const [urgency, setUrgency] = useState(1); // 1 = standard, 2 = express
	const sliderId = useId();

	const quote = useMemo(() => {
		const total = (sector.base * scale * urgency) + 5000;
		return total.toLocaleString();
	}, [sector, scale, urgency]);

	return (
		<section className="quoting-section glass-deep">
			<div className="quote-container">
				<div className="quote-inputs">
					<div className="header-with-icon">
						<Calculator className="header-icon" aria-hidden="true" />
						<h2>Infrastructure Quoting Engine</h2>
					</div>
					<p className="description">Calculate national-scale sanitization and logistics costs in real-time.</p>

					<div className="input-group-grid">
						<div className="input-field">
							<span className="field-label">SELECT SECTOR</span>
							<div className="sector-selector" role="group" aria-label="Sector Selection">
								{sectors.map(s => (
									<button 
										key={s.id} 
										type="button"
										className={`sector-btn ${sector.id === s.id ? 'active' : ''}`}
										onClick={() => setSector(s)}
										aria-pressed={sector.id === s.id}
									>
										{s.icon}
										<span>{s.name}</span>
									</button>
								))}
							</div>
						</div>

						<div className="input-field">
							<label htmlFor={sliderId}>
								INFRASTRUCTURE SCALE (SQM): <span className="highlight">{scale}</span>
							</label>
							<input 
								id={sliderId}
								type="range" 
								min="100" 
								max="10000" 
								step="100" 
								value={scale}
								onChange={(e) => setScale(Number(e.target.value))}
								className="range-slider"
							/>
						</div>

						<div className="input-field">
							<span className="field-label">SERVICE PRIORITY</span>
							<div className="priority-selector" role="group" aria-label="Priority Selection">
								<button 
									type="button"
									className={`prio-btn ${urgency === 1 ? 'active' : ''}`}
									onClick={() => setUrgency(1)}
									aria-pressed={urgency === 1}
								>
									Standard
								</button>
								<button 
									type="button"
									className={`prio-btn ${urgency === 2 ? 'active' : ''}`}
									onClick={() => setUrgency(2)}
									aria-pressed={urgency === 2}
								>
									Express Guard
								</button>
							</div>
						</div>
					</div>
				</div>

				<div className="quote-display">
					<div className="display-glass">
						<span className="display-label">ESTIMATED NATIONAL QUOTE</span>
						<div className="quote-amount">
							<span className="unit">रू</span>
							<motion.span 
								key={quote}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								className="value"
							>
								{quote}
							</motion.span>
						</div>
						<div className="estimate-detail">
							<span>Incl. 2026 Audit Trail & Tech Guard</span>
						</div>
						<button type="button" className="pro-btn">GENERATE FORMAL AUDIT</button>
					</div>
				</div>
			</div>
		</section>
	);
};
