import type { Express } from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import compression from "compression";
import morgan from "morgan";

export function applySecurityMiddleware(app: Express) {
	// Security headers (CSP, X-Frame-Options, HSTS, etc.)
	app.use(helmet());

	// CORS — restrict to known origins
	const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
		"http://localhost:5173",
		"http://localhost:3000",
	];
	app.use(
		cors({
			origin: allowedOrigins,
			credentials: true,
			methods: ["GET", "POST", "PATCH", "DELETE"],
			allowedHeaders: ["Content-Type", "Authorization"],
		}),
	);

	// Rate limiting — 100 requests per 15 minutes
	app.use(
		rateLimit({
			windowMs: 15 * 60 * 1000,
			max: 100,
			standardHeaders: true,
			legacyHeaders: false,
			message: "Too many requests from this IP, please try again later.",
		}),
	);

	// Response compression (gzip/brotli)
	app.use(compression());

	// HTTP request logging
	app.use(morgan("combined"));
}
