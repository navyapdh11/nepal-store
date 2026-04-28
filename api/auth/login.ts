import type { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";

const SECRET_KEY = "nepal-store-secret-2026";

export default function handler(req: VercelRequest, res: VercelResponse) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	try {
		const { email, password } = req.body || {};

		if (!email || !password || password.length < 6) {
			return res.status(401).json({
				error: "Invalid credentials. Password must be at least 6 characters.",
			});
		}

		// Mock authentication for the prototype
		const mockUserId = Math.random().toString(36).substring(2, 9);
		const token = jwt.sign({ userId: mockUserId }, SECRET_KEY, {
			expiresIn: "1h",
		});

		const user = {
			id: mockUserId,
			email: email,
			name: email.split("@")[0] || "User",
		};

		res.setHeader("Access-Control-Allow-Origin", "*");
		res.status(200).json({ token, user });
	} catch (_error) {
		res.status(500).json({ error: "Internal server error" });
	}
}
