import type React from "react";
import { useState } from "react";
import type { User } from "../lib/auth";
import "./AuthView.css";

export const AuthView = ({
	onLoginSuccess,
}: {
	onLoginSuccess: (user: User, token: string) => void;
}) => {
	const [isLogin, setIsLogin] = useState(true);
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		name: "",
	});
	const [error, setError] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";

		try {
			const res = await fetch(endpoint, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Something went wrong");

			onLoginSuccess(data.user as User, data.token as string);
		} catch (err: unknown) {
			setError((err as Error).message);
		}
	};

	return (
		<div className="auth-container">
			<div className="auth-card">
				<h2>{isLogin ? "SIGN IN" : "CREATE ACCOUNT"}</h2>
				{error && <p className="error-message">{error}</p>}

				<form onSubmit={handleSubmit}>
					{!isLogin && (
						<div className="input-group">
							<label htmlFor="name">FULL NAME</label>
							<input
								id="name"
								type="text"
								required
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
							/>
						</div>
					)}
					<div className="input-group">
						<label htmlFor="email">EMAIL ADDRESS</label>
						<input
							id="email"
							type="email"
							required
							value={formData.email}
							onChange={(e) =>
								setFormData({ ...formData, email: e.target.value })
							}
						/>
					</div>
					<div className="input-group">
						<label htmlFor="password">PASSWORD</label>
						<input
							id="password"
							type="password"
							required
							value={formData.password}
							onChange={(e) =>
								setFormData({ ...formData, password: e.target.value })
							}
						/>
					</div>
					<button type="submit" className="submit-btn">
						{isLogin ? "LOG IN" : "REGISTER"}
					</button>
				</form>

				<p className="toggle-auth">
					{isLogin ? "Don't have an account? " : "Already have an account? "}
					<button type="button" onClick={() => setIsLogin(!isLogin)}>
						{isLogin ? "Register now" : "Sign in here"}
					</button>
				</p>
			</div>
		</div>
	);
};
