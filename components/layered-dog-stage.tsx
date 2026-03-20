import type { ThemeColors } from '@/constants/theme';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

type Props = {
  colors: ThemeColors;
};

/**
 * Full-bleed layered vector scene (sky → hills → ground + dog).
 * Parent should use absolute fill; SVG uses slice to cover without letterboxing.
 */
export function LayeredDogStage({ colors: c }: Props) {
  return (
    <View style={styles.root} collapsable={false}>
      <Svg
        style={styles.svg}
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice">
        <Defs>
          <LinearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={c.sceneSkyTop} />
            <Stop offset="100%" stopColor={c.sceneSkyBottom} />
          </LinearGradient>
        </Defs>

        <Rect x={0} y={0} width={100} height={100} fill="url(#skyGrad)" />

        <Path
          d="M0,48 Q18,36 38,42 Q55,38 72,44 Q88,40 100,46 L100,100 L0,100 Z"
          fill={c.sceneHillFar}
          opacity={0.95}
        />

        <Path
          d="M0,56 Q22,50 48,54 Q72,50 100,56 L100,100 L0,100 Z"
          fill={c.sceneHillMid}
          opacity={0.92}
        />

        <Path
          d="M0,68 Q28,64 50,66 Q72,64 100,68 L100,100 L0,100 Z"
          fill={c.sceneGroundShadow}
          opacity={0.55}
        />
        <Path d="M0,70 Q50,67 100,70 L100,100 L0,100 Z" fill={c.sceneGround} />

        <G>
          <Ellipse cx={50} cy={88} rx={19} ry={4.5} fill={c.dogVectorNose} opacity={0.12} />

          <Path
            d="M 64 74 Q 76 60 82 44"
            stroke={c.dogVectorBody}
            strokeWidth={4.5}
            strokeLinecap="round"
            fill="none"
          />

          <Ellipse cx={50} cy={74} rx={16} ry={19} fill={c.dogVectorBody} />
          <Ellipse cx={50} cy={77} rx={9} ry={13} fill={c.dogVectorBodyLight} opacity={0.55} />

          <Path d="M 37 44 L 30 28 L 42 38 Z" fill={c.dogVectorBody} />
          <Path d="M 63 44 L 70 28 L 58 38 Z" fill={c.dogVectorBody} />

          <Ellipse cx={50} cy={46} rx={13} ry={12} fill={c.dogVectorBodyLight} />

          <Ellipse cx={50} cy={54} rx={8} ry={5.5} fill={c.dogVectorSnout} />
          <Ellipse cx={50} cy={52.5} rx={2.8} ry={2.2} fill={c.dogVectorNose} />

          <Ellipse cx={44} cy={46} rx={1.6} ry={2} fill={c.dogVectorNose} opacity={0.65} />
          <Ellipse cx={56} cy={46} rx={1.6} ry={2} fill={c.dogVectorNose} opacity={0.65} />
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  svg: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
