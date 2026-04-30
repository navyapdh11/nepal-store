import { useEffect, useMemo, useState } from "react";
import { AICompanionKernel, type Nudge } from "../lib/ai/kernel";
import "./NudgeBar.css";

export const NudgeBar = ({ category }: { category: string }) => {
	const [nudges, setNudges] = useState<Nudge[]>([]);
	const kernel = useMemo(() => new AICompanionKernel("user-1"), []);

	useEffect(() => {
		kernel.getNudges(category).then(setNudges).catch(console.error);
	}, [category, kernel]);

	if (nudges.length === 0) return null;

	return (
		<div className="nudge-bar" role="status" aria-live="polite">
			<div className="nudge-content">
				<span className="nudge-icon">✨</span>
				<span className="nudge-message">{nudges[0].message}</span>
			</div>
		</div>
	);
};
