import { useState } from "react";
import { Helmet } from "react-helmet-async";
import "./FAQ.css";

interface FAQItem {
	question: string;
	answer: string;
}

const faqs: FAQItem[] = [
	{
		question: "Where to buy authentic Nepalese clothing online?",
		answer:
			"NEPAL STORE offers a curated collection of authentic Nepalese clothing including Dhaka textiles, cashmere pashminas, and traditional wear. All products are handcrafted by artisans in Kathmandu and ship worldwide with free delivery on orders over रू 5,000.",
	},
	{
		question: "What is Dhaka fabric?",
		answer:
			"Dhaka is a traditional handwoven textile from Nepal, made on looms using intricate geometric patterns. It originates from the Newari community in the Kathmandu Valley and is used to make topis (caps), scarves, shirts, and home décor items. Each piece takes 2-5 days to weave by hand.",
	},
	{
		question: "Is Nepalese pashmina real cashmere?",
		answer:
			"Yes. Genuine Nepalese pashmina is made from 100% Himalayan cashmere fiber (Chyangra) sourced from high-altitude goats in the Mustang and Dolpo regions. Nepal is one of the world's largest producers of raw cashmere. Look for our 'Certified Authentic' label to ensure you're getting the real thing.",
	},
	{
		question: "How to care for cashmere sweaters?",
		answer:
			"Hand-wash in cold water with a mild detergent or cashmere-specific shampoo. Do not wring — gently press out water and lay flat to dry on a towel. Avoid hanging cashmere as it stretches. Store folded with cedar blocks to prevent moths. Dry cleaning is also acceptable but not required more than once per season.",
	},
	{
		question: "What size should I order from Nepal?",
		answer:
			"Our sizing follows international standards (S/M/L/XL) but we recommend checking our detailed Size Guide for each category. Nepalese sizes tend to run slightly smaller than US/EU sizes. If you're between sizes, we recommend sizing up. All product pages include exact measurements in centimeters.",
	},
	{
		question: "Does NEPAL STORE ship internationally?",
		answer:
			"Yes! We ship to over 40 countries including the US, UK, Australia, Japan, and across South Asia. International shipping takes 7-14 business days via DHL/FedEx. Domestic delivery within Nepal is 2-3 business days. Free shipping on domestic orders over रू 5,000 and international orders over $100 USD.",
	},
	{
		question: "What is the difference between pashmina and cashmere?",
		answer:
			'Technically, "pashmina" refers to the fine cashmere fiber from the Capra hircus goat found in the Himalayas, while "cashmere" is the broader term for the same fiber type. Pashmina fibers are typically finer (12-16 microns) than standard cashmere (15-19 microns), making them softer and more luxurious. In Nepal, both terms are used interchangeably.',
	},
	{
		question: "How to authenticate Nepalese handmade products?",
		answer:
			"Authentic Nepalese handmade products carry the 'Handmade in Nepal' certification mark issued by the Federation of Nepalese Chambers of Commerce & Industry (FNCCI). Look for slight variations in pattern — true handloom products are never perfectly identical. Our products include an artisan story card with each purchase.",
	},
	{
		question: "What is your return and exchange policy?",
		answer:
			"We offer a 14-day return policy for unused items in original packaging. Domestic customers can arrange free pickup. International customers are responsible for return shipping. Custom or personalized items are non-returnable. Exchanges are free — just contact our support team.",
	},
	{
		question: "How do you support local artisans?",
		answer:
			"We partner directly with 200+ artisan families across the Kathmandu Valley, Bhaktapur, Patan, and the Terai region. We pay 30-50% above wholesale rates, provide interest-free advances for raw materials, and reinvest 5% of profits into craft preservation training programs. Every product page names the artisan workshop that made it.",
	},
];

export const FAQ = () => {
	const [openIndex, setOpenIndex] = useState<number | null>(null);

	const toggleFAQ = (index: number) => {
		setOpenIndex(openIndex === index ? null : index);
	};

	return (
		<div className="faq-page">
			<Helmet>
				<title>FAQ — Frequently Asked Questions | NEPAL STORE</title>
				<meta
					name="description"
					content="Find answers to common questions about NEPAL STORE's authentic Nepalese clothing, cashmere pashminas, Dhaka textiles, shipping, sizing, and returns."
				/>
				<script type="application/ld+json">
					{JSON.stringify({
						"@context": "https://schema.org",
						"@type": "FAQPage",
						mainEntity: faqs.map((faq) => ({
							"@type": "Question",
							name: faq.question,
							acceptedAnswer: {
								"@type": "Answer",
								text: faq.answer,
							},
						})),
					})}
				</script>
			</Helmet>

			<section className="faq-hero">
				<h1 className="font-display">Frequently Asked Questions</h1>
				<p className="faq-sub">Everything you need to know about shopping with NEPAL STORE.</p>
			</section>

			<section className="faq-list">
				{faqs.map((faq, index) => (
					<div key={index} className="faq-item glass-card">
						<button
							type="button"
							className="faq-question"
							onClick={() => toggleFAQ(index)}
							aria-expanded={openIndex === index}
						>
							<span>{faq.question}</span>
							<span className="faq-toggle-icon">{openIndex === index ? "−" : "+"}</span>
						</button>
						{openIndex === index && (
							<div className="faq-answer" role="region">
								<p>{faq.answer}</p>
							</div>
						)}
					</div>
				))}
			</section>

			{/* Page-end SEO description */}
			<section className="page-end-description">
				<h2 className="font-display">NEPAL STORE Customer Support</h2>
				<p>
					Find answers to common questions about shopping at NEPAL STORE — our authentic Nepalese fashion
					e-commerce platform. From Dhaka fabric care to international shipping, sizing guides to artisan
					partnerships, we cover everything you need to know before making your purchase.
				</p>
				<p>Still have questions? <a href="/contact">Contact our team</a> for personalized assistance.</p>
			</section>
		</div>
	);
};
