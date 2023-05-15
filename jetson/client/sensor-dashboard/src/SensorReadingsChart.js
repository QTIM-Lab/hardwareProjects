import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

function SensorReadingsChart(props) {
  const [readings, setReadings] = useState([]);

  useEffect(() => {
    async function fetchData() {
//      const response = await fetch(`/api/sensors/${props.sensorId}/readings`);
      const response = await fetch(`http://localhost:3001/api/people-detected`);
      const data = await response.json();
      setReadings(data);
    }
    fetchData();
  }, [props.sensorId]);

  return (
    <LineChart 
        width={600} 
        height={300}
        margin={{
            top: 20,
            right: 20,
            bottom: 20,
            left: 20,
          }}
        data={readings}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="timestamp" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line
        type="monotone"
        dataKey="peopleDetected"
        name="People count"
        stroke="#8884d8"      />
    </LineChart>
  );
}

export default SensorReadingsChart;
