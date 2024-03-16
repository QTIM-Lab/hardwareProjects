import React, { useState } from 'react';

const ThermalSensorImage = ({ sensorId }) => {
  const [imageData, setImageData] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const LATEST_THERMAL_URL = "http://localhost:3001/get-latest-thermal-reading";
  const HEATMAP_URL = "http://localhost:3001/get-thermal-heatmap";
  const PREDICT_URL = "http://localhost:8080/predict";
	
const handleClick = async () => {
  setIsLoading(true);
  setError(null);

  try {
    // Step 1: Fetch the latest thermal reading to get the dataId
    const latestReadingResponse = await fetch(`${LATEST_THERMAL_URL}/${sensorId}`);
    if (!latestReadingResponse.ok) {
      throw new Error(`Error fetching latest thermal reading: ${latestReadingResponse.statusText}`);
    }

    const { dataId } = await latestReadingResponse.json();  // Destructure to extract dataId from the response JSON

    // Step 2: Fetch the thermal heatmap using the obtained dataId
    const heatmapResponse = await fetch(`${HEATMAP_URL}/${dataId}`);
    if (!heatmapResponse.ok) {
      throw new Error(`Error fetching thermal heatmap: ${heatmapResponse.statusText}`);
    }

    const imageBlob = await heatmapResponse.blob();
    const imageUrl = URL.createObjectURL(imageBlob);
    setImageData(imageUrl);

    // Step 3: Send the image to the prediction service
    const formData = new FormData();
    formData.append('file', imageBlob, 'image.png'); // Append the blob as a file named 'image.png'

    const predictionResponse = await fetch(`${PREDICT_URL}`, { 
      method: 'POST',
      body: formData,
    });

    if (!predictionResponse.ok) {
      throw new Error(`Error in prediction service: ${predictionResponse.statusText}`);
    }

    const predictionData = await predictionResponse.json();
    if (!('result' in predictionData)) {
      throw new Error('No prediction result found');
    }
    
    if (typeof predictionData.result === 'undefined') {
      throw new Error('No prediction result found');
    }

    console.log("Prediction result:", predictionData.result);
    setPredictionResult( predictionData.result);
  
  } catch (error) {
    setError(error.message);
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div onClick={handleClick}>
      <p>Sensor ID: {sensorId}</p>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {predictionResult !== undefined && <p>Prediction: {predictionResult === 1 ? 'Occupied' : 'Not Occupied'}</p>}
      {imageData && <img src={imageData} alt={`Thermal data for sensor ${sensorId}`} />}
    </div>
  );
};


export default ThermalSensorImage;
