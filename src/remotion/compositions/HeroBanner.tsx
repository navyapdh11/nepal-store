import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

export const HeroBanner: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => {
	const frame = useCurrentFrame();

	const opacity = interpolate(frame, [0, 30], [0, 1], {
		extrapolateRight: 'clamp',
	});

	const scale = interpolate(frame, [0, 300], [1, 1.1]);

	return (
		<AbsoluteFill style={{ backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
			<div
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					backgroundColor: '#4a3728', // Nepal Earth
					opacity: 0.1,
					transform: `scale(${scale})`,
				}}
			/>
			<div style={{ opacity, textAlign: 'center', zIndex: 1 }}>
				<h1 style={{ fontSize: 120, color: '#c41e3a', marginBottom: 20 }}>{title}</h1>
				<h2 style={{ fontSize: 60, color: '#4a3728' }}>{subtitle}</h2>
			</div>
		</AbsoluteFill>
	);
};
