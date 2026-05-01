import { useRef, useEffect } from "react";
import { Player } from "@remotion/player";
import { HeroBanner } from "../remotion/compositions/HeroBanner.js";

interface RemotionHeroProps {
	title: string;
	subtitle: string;
	backgroundImage: string;
}

export const RemotionHero = ({ title, subtitle, backgroundImage }: RemotionHeroProps) => {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!containerRef.current) return;
		// Force Remotion to recalculate on mount
		containerRef.current.style.display = "none";
		requestAnimationFrame(() => {
			if (containerRef.current) containerRef.current.style.display = "";
		});
	}, []);

	return (
		<div ref={containerRef} style={{ width: "100%", height: "100%", position: "relative" }}>
			<Player
				component={HeroBanner}
				durationInFrames={180}
				compositionWidth={1920}
				compositionHeight={1080}
				fps={30}
				controls={false}
				autoPlay={true}
				loop={true}
				style={{
					width: "100%",
					height: "100%",
					position: "absolute",
					top: 0,
					left: 0,
				}}
				inputProps={{ title, subtitle, backgroundImage }}
			/>
		</div>
	);
};
