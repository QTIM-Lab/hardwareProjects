import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { scaleSequential } from "d3-scale";
import { interpolateRdYlBu } from "d3-scale-chromatic";

const Heatmap = ({ data, width, height }) => {
  const ref = useRef(null);

  const cellSize = 10;
  // The interpolator d3.interpolateRdYlBu gives blue for high values and red for low values.
  // So, we'll reverse your range to get blue for low (cold) values and red for high (hot) values.
  const colorScale = scaleSequential(interpolateRdYlBu).domain([33, 25]);

  const getColor = (val) => {
    return colorScale(val);
  };

  useEffect(() => {
    if (data && data.length) {
      const svg = d3.select(ref.current);

      svg.selectAll("*").remove();

      svg
        .selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", (d) => d.x * cellSize)
        .attr("y", (d) => d.y * cellSize)
        .attr("width", cellSize)
        .attr("height", cellSize)
        .attr("fill", (d) => getColor(d.value));
    }
  }, [data]);

  return <svg ref={ref} width={width} height={height}></svg>;
};

export default Heatmap;
