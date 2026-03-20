import Svg, { Circle, G } from 'react-native-svg';

type Props = {
  size: number;
  strokeWidth: number;
  ratio: number;
  trackColor: string;
  fillColor: string;
  /** Wider stroke drawn under the progress arc (readability on busy backgrounds). */
  progressOutlineColor?: string;
  progressOutlineExtraWidth?: number;
};

/**
 * Circular progress ring (0–1), stroke starts at 12 o'clock, clockwise.
 */
export function StatRing({
  size,
  strokeWidth,
  ratio,
  trackColor,
  fillColor,
  progressOutlineColor,
  progressOutlineExtraWidth = 2.5,
}: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const r = Math.max(0, size / 2 - strokeWidth / 2);
  const circ = 2 * Math.PI * r;
  const clamped = Math.min(1, Math.max(0, ratio));
  const dashOffset = circ * (1 - clamped);

  return (
    <Svg width={size} height={size} accessibilityRole="image">
      <G transform={`rotate(-90 ${cx} ${cy})`}>
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {clamped > 0 ? (
          <>
            {progressOutlineColor ? (
              <Circle
                cx={cx}
                cy={cy}
                r={r}
                stroke={progressOutlineColor}
                strokeWidth={strokeWidth + progressOutlineExtraWidth}
                fill="none"
                strokeDasharray={`${circ} ${circ}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
              />
            ) : null}
            <Circle
              cx={cx}
              cy={cy}
              r={r}
              stroke={fillColor}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${circ} ${circ}`}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
            />
          </>
        ) : null}
      </G>
    </Svg>
  );
}
