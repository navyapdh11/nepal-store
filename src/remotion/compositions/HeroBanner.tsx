import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

export const HeroBanner = ({
	title,
	subtitle,
}: { title: string; subtitle: string }) => {
	const frame = useCurrentFrame();

	const opacity = interpolate(frame, [0, 40], [0, 1], {
		extrapolateRight: "clamp",
	});

	const scale = interpolate(frame, [0, 300], [1.05, 1], {
		extrapolateRight: "clamp",
	});

	return (
		<AbsoluteFill
			style={{
				backgroundColor: "#000",
				justifyContent: "center",
				alignItems: "center",
				overflow: "hidden"
			}}
		>
			<div
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					backgroundImage: `url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1920&auto=format&fit=crop')`,
					backgroundSize: "cover",
					backgroundPosition: "center",
					opacity: 0.6,
					transform: `scale(${scale})`,
					filter: "contrast(1.1) brightness(0.8)"
				}}
			/>
			<div 
				style={{ 
					opacity, 
					textAlign: "center", 
					zIndex: 1,
					padding: "0 100px"
				}}
			>
				<h1 style={{ 
					fontSize: 160, 
					color: "#fff", 
					marginBottom: 20,
					fontWeight: 900,
					letterSpacing: "-5px",
					textShadow: "0 20px 40px rgba(0,0,0,0.5)"
				}}>
					{title}
				</h1>
				<div style={{
					height: 4,
					width: 120,
					background: "#ff0000",
					margin: "0 auto 30px"
				}} />
				<h2 style={{ 
					fontSize: 40, 
					color: "#eee",
					fontWeight: 300,
					letterSpacing: "15px",
					textTransform: "uppercase"
				}}>
					{subtitle}
				</h2>
			</div>
		</AbsoluteFill>
	);
};
