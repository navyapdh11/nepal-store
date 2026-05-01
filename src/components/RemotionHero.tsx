import { Player } from "@remotion/player";
import { HeroBanner } from "../remotion/compositions/HeroBanner.js";

interface RemotionHeroProps {
	title: string;
	subtitle: string;
	backgroundImage: string;
}

export const RemotionHero = ({ title, subtitle, backgroundImage }: RemotionHeroProps) => {
	return (
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
				aspectRatio: "16/9",
				objectFit: "cover",
			}}
			inputProps={{ title, subtitle, backgroundImage }}
		/>
	);
};
