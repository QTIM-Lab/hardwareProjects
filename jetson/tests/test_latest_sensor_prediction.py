import os
import requests
from io import BytesIO

# URL of the running webservice
PREDICT_URL = "http://localhost:8080/predict"
LATEST_READING_URL = "http://localhost:3001/get-latest-thermal-reading"
HEATMAP_URL = "http://localhost:3001/get-thermal-heatmap" 


def test_predict_with_image():
    
    sensorId = "s3-3-2-19-24"

    # Fetch the latest thermal reading ID for the sensor
    sensorResp = requests.get(f"{LATEST_READING_URL}/{sensorId}")
    print(sensorResp)
    assert sensorResp.status_code == 200


    # Parse the JSON response and extract the dataId
    dataId = sensorResp.json().get("dataId")


    heatMapResp = requests.get(f"{HEATMAP_URL}/{dataId}")

    assert heatMapResp.status_code == 200
    assert heatMapResp.headers['Content-Type'] == 'image/png'

    # Now send this image to the prediction service
    # Since response.content is binary, we wrap it in BytesIO to simulate a file
    files = {'file': ('image.png', BytesIO(heatMapResp.content), 'image/png')}
    response = requests.post(PREDICT_URL, files=files)

    # Check the response from the prediction service
    assert response.status_code == 200
    # Assuming the prediction service returns JSON with a 'result' key
    prediction_data = response.json()
    assert 'result' in prediction_data
    print("Prediction result:", prediction_data['result'])

test_predict_with_image()

