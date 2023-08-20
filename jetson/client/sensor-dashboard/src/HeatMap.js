import React from 'react';

const colorScale = value => {
  // This function takes a value between 0 and 1 and returns a color from green (0) to red (1).
  const hue = value * 120;
  return `hsl(${hue}, 100%, 50%)`;
};

const HeatMap = ({ data }) => {
  const height = data.length;
  const width = data[0].length;

  return (
    <svg width={width} height={height}>
      {data.map((row, y) =>
        row.map((value, x) => (
          <rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width={1}
            height={1}
            fill={isNaN(value) ? 'black' : colorScale(value)}
          />
        ))
      )}
    </svg>
  );
};

export default HeatMap;
