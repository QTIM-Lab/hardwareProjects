import React, { useState, useEffect } from 'react';
import { LineChart, ScatterChart, Scatter, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush } from 'recharts';

function SensorReadingsChart(props) {
  const [readings, setReadings] = useState([]);

  useEffect(() => {
    async function fetchData() {
//      const response = await fetch(`/api/sensors/${props.sensorId}/readings`);
      const response = await fetch(`http://localhost:3001/api/readings`);
      const data = await response.json();

      setReadings(data);
    }
    fetchData();
  }, [props.sensorId]);

  // Format time in milliseconds to minutes
  const formatXAxis = (tickItem) => {
    return `${Math.floor(tickItem / 60000)}m`;
  };

  // Format YAxis labels
  const formatYAxis = (tickItem) => {
    switch(tickItem) {
      case 1: return 'motion';
      case 2: return 'image';
      case 3: return 'thermal';
      default: return '';
    }
  };

  return (
    <ResponsiveContainer width="95%" height={200}>
      <ScatterChart data={readings}>
        {/* <CartesianGrid strokeDasharray="3 3" /> */}
        <XAxis dataKey="time_write" tickFormatter={formatXAxis} />
        <YAxis tickFormatter={formatYAxis} domain={[1, 3]} />
        <Tooltip />
        <Legend />
        <Scatter dataKey="data_type_id" name="Readings" dot={{ r: 4 }} fill="#0055ff" />
        <Brush dataKey='time_write' height={30} stroke="#0055ff" tickFormatter={formatXAxis} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}


export default SensorReadingsChart;
