import { useState } from "react";
import "./Contact.css";

export const Contact = () => {
	const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
	const [submitted, setSubmitted] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitted(true);
		setTimeout(() => setSubmitted(false), 5000);
	};

	return (
		<div className="contact-page">
			<section className="contact-hero">
				<h1 className="font-display">Get in Touch</h1>
				<p className="contact-sub">Have a question or feedback? We'd love to hear from you.</p>
			</section>

			<div className="contact-grid">
				<div className="contact-form-card glass-card">
					{submitted ? (
						<div className="contact-success">
							<div className="success-icon">✓</div>
							<h2>Message Sent!</h2>
							<p>We'll get back to you within 24 hours.</p>
						</div>
					) : (
						<form onSubmit={handleSubmit}>
							<h2 className="font-display">Send us a message</h2>
							<div className="form-group">
								<label htmlFor="contact-name">Name</label>
								<input
									id="contact-name"
									type="text"
									value={formData.name}
									onChange={e => setFormData({ ...formData, name: e.target.value })}
									required
									placeholder="Your full name"
								/>
							</div>
							<div className="form-group">
								<label htmlFor="contact-email">Email</label>
								<input
									id="contact-email"
									type="email"
									value={formData.email}
									onChange={e => setFormData({ ...formData, email: e.target.value })}
									required
									placeholder="you@example.com"
								/>
							</div>
							<div className="form-group">
								<label htmlFor="contact-subject">Subject</label>
								<input
									id="contact-subject"
									type="text"
									value={formData.subject}
									onChange={e => setFormData({ ...formData, subject: e.target.value })}
									placeholder="What's this about?"
								/>
							</div>
							<div className="form-group">
								<label htmlFor="contact-message">Message</label>
								<textarea
									id="contact-message"
									value={formData.message}
									onChange={e => setFormData({ ...formData, message: e.target.value })}
									required
									rows={5}
									placeholder="Tell us how we can help..."
								/>
							</div>
							<button type="submit" className="contact-submit-btn">Send Message</button>
						</form>
					)}
				</div>

				<div className="contact-info">
					<div className="info-card glass-card animate-fadeInUp stagger-2">
						<div className="info-icon">📍</div>
						<h3>Visit Us</h3>
						<p>Thamel, Kathmandu 44600<br/>Nepal</p>
					</div>
					<div className="info-card glass-card animate-fadeInUp stagger-4">
						<div className="info-icon">📞</div>
						<h3>Call Us</h3>
						<p>+977-1-4XXXXXX<br/>Sun-Fri, 10AM-6PM NPT</p>
					</div>
					<div className="info-card glass-card animate-fadeInUp stagger-6">
						<div className="info-icon">✉️</div>
						<h3>Email Us</h3>
						<p>hello@nepalstore.com.np<br/>We reply within 24 hours</p>
					</div>
					<div className="info-card glass-card animate-fadeInUp stagger-8">
						<div className="info-icon">🌐</div>
						<h3>Follow Us</h3>
						<div className="social-links">
							<span role="button" tabIndex={0}>Instagram</span>
							<span role="button" tabIndex={0}>Facebook</span>
							<span role="button" tabIndex={0}>TikTok</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
