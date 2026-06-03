import { useMemo } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop, Line as SvgLine } from 'react-native-svg';

import { Radius, Spacing } from '@/constants/fitnexia';
import { useAppTheme } from '@/contexts/theme-context';

export type LineChartPoint = {
  label: string;
  value: number;
};

type LineChartProps = {
  data: LineChartPoint[];
  formatValue: (value: number) => string;
  color?: string;
  height?: number;
  chartId?: string;
};

const PADDING = { top: 12, right: 12, bottom: 28, left: 40 };

function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const current = points[i];
    const next = points[i + 1];
    const midX = (current.x + next.x) / 2;
    path += ` C ${midX} ${current.y}, ${midX} ${next.y}, ${next.x} ${next.y}`;
  }
  return path;
}

export function LineChart({ data, formatValue, color, height = 200, chartId = 'chart' }: LineChartProps) {
  const { colors } = useAppTheme();
  const { width: windowWidth } = useWindowDimensions();
  const stroke = color ?? colors.primary;

  const chartWidth = windowWidth - Spacing.md * 2 - PADDING.left - PADDING.right;
  const chartHeight = height - PADDING.top - PADDING.bottom;

  const { points, minY, maxY, yTicks } = useMemo(() => {
    const values = data.map((d) => d.value);
    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);
    const spread = rawMax - rawMin || 1;
    const min = rawMin - spread * 0.1;
    const max = rawMax + spread * 0.1;
    const range = max - min || 1;

    const coords = data.map((d, index) => {
      const x =
        PADDING.left +
        (data.length === 1 ? chartWidth / 2 : (index / (data.length - 1)) * chartWidth);
      const y = PADDING.top + (1 - (d.value - min) / range) * chartHeight;
      return { x, y, label: d.label, value: d.value };
    });

    const ticks = [min, min + range / 2, max];

    return { points: coords, minY: min, maxY: max, yTicks: ticks };
  }, [chartHeight, chartWidth, data]);

  const linePath = buildSmoothPath(points);
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${PADDING.top + chartHeight} L ${points[0].x} ${PADDING.top + chartHeight} Z`
      : '';

  const svgWidth = chartWidth + PADDING.left + PADDING.right;

  return (
    <View style={[styles.wrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Svg width={svgWidth} height={height}>
        <Defs>
          <LinearGradient id={`areaFill-${chartId}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={stroke} stopOpacity={0.28} />
            <Stop offset="1" stopColor={stroke} stopOpacity={0.02} />
          </LinearGradient>
        </Defs>

        {yTicks.map((tick, index) => {
          const y = PADDING.top + (1 - (tick - minY) / (maxY - minY || 1)) * chartHeight;
          return (
            <SvgLine
              key={`grid-${index}`}
              x1={PADDING.left}
              y1={y}
              x2={PADDING.left + chartWidth}
              y2={y}
              stroke={colors.border}
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          );
        })}

        {areaPath ? <Path d={areaPath} fill={`url(#areaFill-${chartId})`} /> : null}
        {linePath ? (
          <Path d={linePath} stroke={stroke} strokeWidth={2.5} fill="none" strokeLinecap="round" />
        ) : null}

        {points.map((point) => (
          <Circle
            key={point.label}
            cx={point.x}
            cy={point.y}
            r={4}
            fill={colors.surface}
            stroke={stroke}
            strokeWidth={2}
          />
        ))}
      </Svg>

      <View style={[styles.yAxis, { height: chartHeight, top: PADDING.top }]}>
        {[...yTicks].reverse().map((tick) => (
          <Text key={tick} style={[styles.yLabel, { color: colors.textMuted }]}>
            {formatValue(tick)}
          </Text>
        ))}
      </View>

      <View style={[styles.xAxis, { paddingLeft: PADDING.left, paddingRight: PADDING.right }]}>
        {data.map((d) => (
          <Text key={d.label} style={[styles.xLabel, { color: colors.textMuted }]}>
            {d.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
    overflow: 'hidden',
  },
  yAxis: {
    position: 'absolute',
    left: 4,
    justifyContent: 'space-between',
  },
  yLabel: { fontSize: 10, fontWeight: '500' },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
    paddingHorizontal: Spacing.sm,
  },
  xLabel: { fontSize: 11, fontWeight: '500', flex: 1, textAlign: 'center' },
});
