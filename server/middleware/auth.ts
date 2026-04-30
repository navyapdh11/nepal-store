import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
	user?: { userId: string };
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
	const authHeader = req.headers.authorization;
	const token = authHeader?.split(" ")[1];
	if (!token) return res.status(401).json({ error: "Unauthorized" });

	const secret = process.env.JWT_SECRET;
	if (!secret) return res.status(500).json({ error: "Server configuration error" });

	try {
		req.user = jwt.verify(token, secret) as { userId: string };
		next();
	} catch {
		res.status(401).json({ error: "Invalid token" });
	}
};
