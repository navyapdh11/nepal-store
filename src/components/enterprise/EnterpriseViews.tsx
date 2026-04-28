import { motion } from 'framer-motion';
import { ShieldCheck, Activity, Search, Download } from 'lucide-react';
import './EnterpriseViews.css';

export const SanitizationLogs = () => {
	const logs = [
		{ id: 'LOG-001', location: 'Kathmandu Hub', sector: 'Retail', status: 'COMPLETED', time: '2026-04-28 09:15', metrics: '99.9% Purity' },
		{ id: 'LOG-002', location: 'Pokhara Logistics', sector: 'Industrial', status: 'COMPLETED', time: '2026-04-28 08:30', metrics: 'High Throughput' },
		{ id: 'LOG-003', location: 'Biratnagar Node', sector: 'Government', status: 'IN_PROGRESS', time: '2026-04-28 10:00', metrics: 'Scanning...' },
	];

	return (
		<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="enterprise-view">
			<div className="view-header">
				<div className="header-info">
					<Activity className="view-icon" />
					<h2>Sanitization Node Logs</h2>
				</div>
				<div className="view-actions">
					<div className="search-bar glass">
						<Search size={16} />
						<input type="text" placeholder="Search infrastructure..." />
					</div>
					<button type="button" className="action-btn glass"><Download size={16} /> EXPORT</button>
				</div>
			</div>

			<div className="logs-table-container glass-deep">
				<table className="enterprise-table">
					<thead>
						<tr>
							<th>NODE ID</th>
							<th>LOCATION</th>
							<th>SECTOR</th>
							<th>STATUS</th>
							<th>TIMESTAMP</th>
							<th>METRICS</th>
						</tr>
					</thead>
					<tbody>
						{logs.map(log => (
							<tr key={log.id}>
								<td className="bold">{log.id}</td>
								<td>{log.location}</td>
								<td><span className={`tag ${log.sector.toLowerCase()}`}>{log.sector}</span></td>
								<td><span className={`status-dot ${log.status.toLowerCase()}`} /> {log.status}</td>
								<td>{log.time}</td>
								<td className="highlight">{log.metrics}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</motion.div>
	);
};

export const AuditTrails = () => {
	const audits = [
		{ id: 'AUD-992', action: 'API_KEY_ROTATION', user: 'Admin-System', node: 'Global Node', time: '2 mins ago' },
		{ id: 'AUD-991', action: 'PRICING_MATRIX_UPDATE', user: 'Finance-Lead', node: 'Retail Node', time: '1 hour ago' },
		{ id: 'AUD-990', action: 'DATABASE_MIGRATION', user: 'DevOps-Bot', node: 'Infra Node', time: '3 hours ago' },
	];

	return (
		<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="enterprise-view">
			<div className="view-header">
				<div className="header-info">
					<ShieldCheck className="view-icon" />
					<h2>Infrastructure Audit Trail</h2>
				</div>
				<button type="button" className="action-btn glass">VERIFY ALL NODES</button>
			</div>

			<div className="audit-list">
				{audits.map((audit, i) => (
					<motion.div 
						key={audit.id}
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: i * 0.1 }}
						className="audit-card glass-deep"
					>
						<div className="audit-marker" />
						<div className="audit-content">
							<div className="audit-header">
								<span className="audit-id">{audit.id}</span>
								<span className="audit-time">{audit.time}</span>
							</div>
							<h4>{audit.action}</h4>
							<div className="audit-footer">
								<span>User: <strong>{audit.user}</strong></span>
								<span>Node: <strong>{audit.node}</strong></span>
							</div>
						</div>
					</motion.div>
				))}
			</div>
		</motion.div>
	);
};
