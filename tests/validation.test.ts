/**
 * NEPAL STORE - Comprehensive Validation Tests
 * Tests for SEO, AEO, Accessibility, Performance, and Security
 */

import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const rootDir = path.resolve(__dirname, "..");

// ─── SEO Tests ───
describe("SEO & AEO", () => {
	it("index.html should have proper meta tags", () => {
		const indexHtml = fs.readFileSync(path.join(rootDir, "index.html"), "utf-8");
		
		expect(indexHtml).toContain("<title>");
		expect(indexHtml).toContain('<meta name="description"');
		expect(indexHtml).toContain('<meta property="og:title"');
		expect(indexHtml).toContain('<meta property="og:description"');
		expect(indexHtml).toContain('<meta property="og:image"');
		expect(indexHtml).toContain('<meta name="twitter:card"');
		expect(indexHtml).toContain('application/ld+json');
	});

	it("index.html should have JSON-LD structured data", () => {
		const indexHtml = fs.readFileSync(path.join(rootDir, "index.html"), "utf-8");
		
		expect(indexHtml).toContain('"@type": "Organization"');
		expect(indexHtml).toContain('"@type": "WebSite"');
		expect(indexHtml).toContain("SearchAction");
	});

	it("robots.txt should exist and be properly configured", () => {
		const robotsPath = path.join(rootDir, "public", "robots.txt");
		expect(fs.existsSync(robotsPath)).toBe(true);
		
		const robots = fs.readFileSync(robotsPath, "utf-8");
		expect(robots).toContain("User-agent: *");
		expect(robots).toContain("Allow: /");
		expect(robots).toContain("Sitemap:");
	});

	it("sitemap.xml should exist and have proper structure", () => {
		const sitemapPath = path.join(rootDir, "public", "sitemap.xml");
		expect(fs.existsSync(sitemapPath)).toBe(true);
		
		const sitemap = fs.readFileSync(sitemapPath, "utf-8");
		expect(sitemap).toContain('<?xml version="1.0"');
		expect(sitemap).toContain('http://www.sitemaps.org/schemas/sitemap/0.9');
		expect(sitemap).toContain("<url>");
		expect(sitemap).toContain("<loc>");
	});

	it("FAQ component should have FAQPage schema", () => {
		const faqPath = path.join(rootDir, "src", "components", "FAQ.tsx");
		const faq = fs.readFileSync(faqPath, "utf-8");
		
		expect(faq).toContain('"@type": "FAQPage"');
		expect(faq).toContain('"@type": "Question"');
		expect(faq).toContain('"@type": "Answer"');
	});

	it("HomePage should have LocalBusiness and Brand schema", () => {
		const homePath = path.join(rootDir, "src", "components", "HomePage.tsx");
		const home = fs.readFileSync(homePath, "utf-8");
		
		expect(home).toContain('"@type": "LocalBusiness"');
		expect(home).toContain('"@type": "Brand"');
		expect(home).toContain('"@type": "ItemList"');
	});

	it("CategoryPage should have Product schema", () => {
		const catPath = path.join(rootDir, "src", "components", "CategoryPage.tsx");
		const cat = fs.readFileSync(catPath, "utf-8");
		
		expect(cat).toContain('"@type": "Product"');
		expect(cat).toContain('"@type": "Offer"');
		expect(cat).toContain("priceCurrency");
	});
});

// ─── Accessibility Tests ───
describe("Accessibility (WCAG 2.2)", () => {
	it("SkipLink component should exist", () => {
		const skipLinkPath = path.join(rootDir, "src", "components", "SkipLink.tsx");
		expect(fs.existsSync(skipLinkPath)).toBe(true);
		
		const skipLink = fs.readFileSync(skipLinkPath, "utf-8");
		expect(skipLink).toContain("Skip to main content");
		expect(skipLink).toContain("#main-content");
	});

	it("Layout should have main content area with proper ARIA", () => {
		const layoutPath = path.join(rootDir, "src", "components", "Layout.tsx");
		const layout = fs.readFileSync(layoutPath, "utf-8");
		
		expect(layout).toContain('id="main-content"');
		expect(layout).toContain('role="main"');
		expect(layout).toContain("aria-label");
	});

	it("components should have aria-label attributes", () => {
		const componentsDir = path.join(rootDir, "src", "components");
		const files = fs.readdirSync(componentsDir).filter(f => f.endsWith(".tsx"));
		
		let filesWithAria = 0;
		files.forEach(file => {
			const content = fs.readFileSync(path.join(componentsDir, file), "utf-8");
			if (content.includes("aria-label") || content.includes("aria-")) {
				filesWithAria++;
			}
		});
		
		// At least 50% of components should have ARIA attributes
		expect(filesWithAria / files.length).toBeGreaterThan(0.5);
	});

	it("interactive elements should have keyboard support", () => {
		// Check FAQ for keyboard accessibility
		const faqPath = path.join(rootDir, "src", "components", "FAQ.tsx");
		const faq = fs.readFileSync(faqPath, "utf-8");
		
		expect(faq).toContain("aria-expanded");
	});
});

// ─── Performance Tests ───
describe("Performance Optimization", () => {
	it("router should use lazy loading", () => {
		const routerPath = path.join(rootDir, "src", "router.tsx");
		const router = fs.readFileSync(routerPath, "utf-8");
		
		expect(router).toContain("lazy(");
		expect(router).toContain("Suspense");
	});

	it("images should have lazy loading", () => {
		const homePath = path.join(rootDir, "src", "components", "HomePage.tsx");
		const home = fs.readFileSync(homePath, "utf-8");
		
		expect(home).toContain('loading="lazy"');
	});

	it("vite.config.ts should have proper configuration", () => {
		const viteConfig = fs.readFileSync(path.join(rootDir, "vite.config.ts"), "utf-8");
		
		expect(viteConfig).toContain("react()");
		expect(viteConfig).toContain("alias");
	});
});

// ─── Security Tests ───
describe("Security", () => {
	it("server should use helmet for security headers", () => {
		const securityPath = path.join(rootDir, "server", "middleware", "security.ts");
		const security = fs.readFileSync(securityPath, "utf-8");
		
		expect(security).toContain("helmet()");
	});

	it("server should have rate limiting", () => {
		const securityPath = path.join(rootDir, "server", "middleware", "security.ts");
		const security = fs.readFileSync(securityPath, "utf-8");
		
		expect(security).toContain("rateLimit");
	});

	it("server should use bcrypt for password hashing", () => {
		const serverPath = path.join(rootDir, "server", "index.ts");
		const server = fs.readFileSync(serverPath, "utf-8");
		
		expect(server).toContain("bcrypt.hash");
		expect(server).toContain("bcrypt.compare");
	});

	it("server should use JWT tokens", () => {
		const serverPath = path.join(rootDir, "server", "index.ts");
		const server = fs.readFileSync(serverPath, "utf-8");
		
		expect(server).toContain("jwt.sign");
		expect(server).toContain("jwt.verify");
	});

	it(".env.example should exist with proper structure", () => {
		const envPath = path.join(rootDir, ".env.example");
		expect(fs.existsSync(envPath)).toBe(true);
		
		const env = fs.readFileSync(envPath, "utf-8");
		expect(env).toContain("JWT_SECRET");
		expect(env).toContain("DATABASE_URL");
	});

	it("Prisma schema should use PostgreSQL for production", () => {
		const schemaPath = path.join(rootDir, "prisma", "schema.prisma");
		const schema = fs.readFileSync(schemaPath, "utf-8");
		
		expect(schema).toContain('provider = "postgresql"');
	});
});

// ─── Build Tests ───
describe("Build Artifacts", () => {
	it("dist directory should exist after build", () => {
		const distPath = path.join(rootDir, "dist");
		expect(fs.existsSync(distPath)).toBe(true);
	});

	it("dist should have index.html", () => {
		const indexPath = path.join(rootDir, "dist", "index.html");
		expect(fs.existsSync(indexPath)).toBe(true);
	});

	it("dist should have JavaScript bundles", () => {
		const assetsPath = path.join(rootDir, "dist", "assets");
		const files = fs.readdirSync(assetsPath);
		const jsFiles = files.filter(f => f.endsWith(".js"));
		
		expect(jsFiles.length).toBeGreaterThan(0);
	});

	it("dist should have CSS bundles", () => {
		const assetsPath = path.join(rootDir, "dist", "assets");
		const files = fs.readdirSync(assetsPath);
		const cssFiles = files.filter(f => f.endsWith(".css"));
		
		expect(cssFiles.length).toBeGreaterThan(0);
	});
});

// ─── Routing Tests ───
describe("Routing", () => {
	it("router should have proper route definitions", () => {
		const routerPath = path.join(rootDir, "src", "router.tsx");
		const router = fs.readFileSync(routerPath, "utf-8");
		
		expect(router).toContain('path: "/"');
		expect(router).toContain("path: \"/:category\"");
		expect(router).toContain('path: "/faq"');
		expect(router).toContain('path: "/about"');
		expect(router).toContain('path: "/contact"');
	});

	it("router should use react-router-dom", () => {
		const routerPath = path.join(rootDir, "src", "router.tsx");
		const router = fs.readFileSync(routerPath, "utf-8");
		
		expect(router).toContain("createBrowserRouter");
		expect(router).toContain("react-router-dom");
	});
});

console.log("✅ All validation tests defined successfully!");
