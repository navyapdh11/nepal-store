import { Composition } from 'remotion';
import { HeroBanner } from './compositions/HeroBanner';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="HeroBanner"
        component={HeroBanner}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: 'NEPAL STORE',
          subtitle: 'Modern LifeWear for Nepal',
        }}
      />
    </>
  );
};
