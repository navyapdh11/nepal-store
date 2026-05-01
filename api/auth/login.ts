import type { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const SECRET_KEY = process.env.JWT_SECRET || "fallback-change-me";

// Admin credentials hash (for Vercel serverless without DB)
const ADMIN_HASH = "$2b$12$LJ3m4ys2Lk0qBqRzG3q5uOKqR5qK5qK5qK5qK5qK5qK5qK5qK5qK5"; // placeholder

export default async function handler(req: VercelRequest, res: VercelResponse) {
	if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

	try {
		const { email, password } = req.body || {};
		if (!email || !password) return res.status(401).json({ error: "Email and password required" });

		// Admin user (Vercel serverless — no DB access)
		if (email === "admin@nepalstore.com") {
			if (password === "NepalStore2026!") {
				const token = jwt.sign({ userId: "admin", role: "ADMIN" }, SECRET_KEY, { expiresIn: "24h" });
				res.setHeader("Access-Control-Allow-Origin", "*");
				return res.status(200).json({ token, user: { id: "admin", email, name: "Admin", role: "ADMIN" } });
			}
			return res.status(401).json({ error: "Invalid credentials" });
		}

		// Regular users
		if (password.length < 6) return res.status(401).json({ error: "Password must be at least 6 characters" });
		const mockUserId = Math.random().toString(36).substring(2, 9);
		const token = jwt.sign({ userId: mockUserId, role: "USER" }, SECRET_KEY, { expiresIn: "1h" });
		res.setHeader("Access-Control-Allow-Origin", "*");
		return res.status(200).json({ token, user: { id: mockUserId, email, name: email.split("@")[0] || "User", role: "USER" } });
	} catch {
		res.status(500).json({ error: "Internal server error" });
	}
}
