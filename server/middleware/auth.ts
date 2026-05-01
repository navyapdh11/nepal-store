import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
	user?: { userId: string; role?: string };
}

const getJwtSecret = (): string => {
	const secret = process.env.JWT_SECRET;
	if (!secret) throw new Error("JWT_SECRET not configured");
	return secret;
};

const verifyToken = (token: string): { userId: string; role: string } => {
	return jwt.verify(token, getJwtSecret()) as { userId: string; role: string };
};

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
	const authHeader = req.headers.authorization;
	const token = authHeader?.split(" ")[1];
	if (!token) return res.status(401).json({ error: "Unauthorized" });

	try {
		const decoded = verifyToken(token);
		req.user = { userId: decoded.userId, role: decoded.role };
		next();
	} catch {
		res.status(401).json({ error: "Invalid token" });
	}
};

export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
	try {
		const authHeader = req.headers.authorization;
		const token = authHeader?.split(" ")[1];
		if (!token) return res.status(401).json({ error: "Unauthorized" });

		const decoded = verifyToken(token);
		const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
		if (!user || user.role !== "ADMIN") return res.status(403).json({ error: "Admin access required" });

		req.user = { userId: user.id, role: user.role };
		next();
	} catch {
		res.status(401).json({ error: "Invalid token" });
	}
};

export const requireVendorOrAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
	try {
		const authHeader = req.headers.authorization;
		const token = authHeader?.split(" ")[1];
		if (!token) return res.status(401).json({ error: "Unauthorized" });

		const decoded = verifyToken(token);
		const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
		if (!user || (user.role !== "ADMIN" && user.role !== "VENDOR")) {
			return res.status(403).json({ error: "Vendor or admin access required" });
		}

		req.user = { userId: user.id, role: user.role };
		next();
	} catch {
		res.status(401).json({ error: "Invalid token" });
	}
};

export const decodeToken = (req: AuthRequest): { userId: string; role: string } | null => {
	const authHeader = req.headers.authorization;
	const token = authHeader?.split(" ")[1];
	if (!token) return null;
	try {
		return verifyToken(token);
	} catch {
		return null;
	}
};
