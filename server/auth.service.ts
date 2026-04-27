import jwt from "jsonwebtoken";
import { z } from "zod";

const SECRET_KEY = "nepal-store-secret";

export const UserSchema = z.object({
	id: z.string(),
	email: z.string().email(),
	password: z.string().min(6),
	name: z.string(),
});

export type User = z.infer<typeof UserSchema>;

const users: User[] = [];

export const AuthService = {
	register(data: unknown) {
		const validated = UserSchema.parse({
			...(data as object),
			id: Math.random().toString(36).substring(2, 9),
		});
		if (users.find((u) => u.email === validated.email)) {
			throw new Error("User already exists");
		}
		users.push(validated);
		return this.login(validated.email, validated.password);
	},

	login(email: string, password: string) {
		const user = users.find(
			(u) => u.email === email && u.password === password,
		);
		if (!user) throw new Error("Invalid credentials");

		const token = jwt.sign({ userId: user.id }, SECRET_KEY, {
			expiresIn: "1h",
		});
		return { token, user: { id: user.id, email: user.email, name: user.name } };
	},

	verify(token: string) {
		try {
			return jwt.verify(token, SECRET_KEY) as { userId: string };
		} catch {
			return null;
		}
	},
};
