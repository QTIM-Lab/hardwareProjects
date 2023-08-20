import React from 'react';
import SensorReadingsChart from './SensorReadingsChart';

function App() {
  return (
    <div style={{ margin: '20px' }}>
      <h1>Sensor Readings</h1>
      <SensorReadingsChart sensorId="2" />
    </div>
  );
}

export default App;
