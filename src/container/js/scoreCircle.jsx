import React from "react";

const polarToCartesian = (cx, cy, r, angle) => {
  const rad = (angle - 90) * (Math.PI / 180);
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
};

const createSegment = (
  cx,
  cy,
  innerRadius,
  outerRadius,
  startAngle,
  endAngle
) => {
  const outerStart = polarToCartesian(cx, cy, outerRadius, startAngle);
  const outerEnd = polarToCartesian(cx, cy, outerRadius, endAngle);
  const innerEnd = polarToCartesian(cx, cy, innerRadius, endAngle);
  const innerStart = polarToCartesian(cx, cy, innerRadius, startAngle);

  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return `
    M ${outerStart.x} ${outerStart.y}
    A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}
    L ${innerEnd.x} ${innerEnd.y}
    A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}
    Z
  `;
};

const ScoreRing = ({ score = 1, size = 106 }) => {
  const sections = 6;
  const activeSegments = Math.max(0, Math.min(score, sections));

  const center = size / 2;

  const outerRadius = 48;
  const innerRadius = 34;

  const gap = 1; // degrees

  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
      }}
    >
      <svg width={size} height={size}>
        {Array.from({ length: sections }).map((_, i) => {
          const angle = 360 / sections;

          const start = i * angle + gap / 2;
          const end = (i + 1) * angle - gap / 2;

          return (
            <path
              key={i}
              d={createSegment(
                center,
                center,
                innerRadius,
                outerRadius,
                start,
                end
              )}
              fill={i < activeSegments ? "#25c7f7" : "#000"}
              stroke="#25c7f7"
              strokeWidth="1"
            />
          );
        })}
      </svg>

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: 52,
          fontWeight: 700,
          color: "#fff",
        }}
      >
        {score}
      </div>
    </div>
  );
};

export default ScoreRing;