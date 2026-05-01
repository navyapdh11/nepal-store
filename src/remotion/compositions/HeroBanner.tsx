import { AbsoluteFill, interpolate, useCurrentFrame, spring } from "remotion";

export const HeroBanner = ({
	title,
	subtitle,
	backgroundImage,
}: {
	title: string;
	subtitle: string;
	backgroundImage?: string;
}) => {
	const frame = useCurrentFrame();

	const bgOpacity = interpolate(frame, [0, 60], [0.3, 0.6], {
		extrapolateRight: "clamp",
	});
	const bgScale = interpolate(frame, [0, 300], [1.15, 1], {
		extrapolateRight: "clamp",
	});

	const titleOpacity = spring({ frame, fps: 30, config: { damping: 12 } });
	const subtitleOpacity = spring({ frame: frame - 10, fps: 30, config: { damping: 12 } });

	const bg = backgroundImage || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1920&auto=format&fit=crop";

	return (
		<AbsoluteFill
			style={{
				backgroundColor: "#000",
				justifyContent: "center",
				alignItems: "center",
				overflow: "hidden",
			}}
		>
			<div
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					backgroundImage: `url('${bg}')`,
					backgroundSize: "cover",
					backgroundPosition: "center",
					opacity: bgOpacity,
					transform: `scale(${bgScale})`,
					filter: "contrast(1.1) brightness(0.7)",
				}}
			/>
			<div
				style={{
					opacity: titleOpacity,
					textAlign: "center",
					zIndex: 1,
					padding: "0 100px",
				}}
			>
				<h1
					style={{
						fontSize: 160,
						color: "#fff",
						marginBottom: 16,
						fontWeight: 900,
						letterSpacing: "-5px",
						textShadow: "0 20px 40px rgba(0,0,0,0.5)",
						fontFamily: "-apple-system, BlinkMacSystemFont, 'Space Grotesk', sans-serif",
					}}
				>
					{title}
				</h1>
				<div
					style={{
						height: 4,
						width: 120,
						background: "linear-gradient(90deg, #e60012, #ff4d4d)",
						margin: "0 auto 24px",
						borderRadius: 2,
					}}
				/>
				<h2
					style={{
						fontSize: 36,
						color: "rgba(255,255,255,0.85)",
						fontWeight: 300,
						letterSpacing: "12px",
						textTransform: "uppercase",
						opacity: subtitleOpacity,
						fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
					}}
				>
					{subtitle}
				</h2>
			</div>
		</AbsoluteFill>
	);
};
