import requests
from io import BytesIO

BASE_URL = "http://localhost:3001"
HEATMAP_BASE_URL = "http://localhost:3001/get-thermal-heatmap"
PREDICT_BASE_URL = "http://localhost:8080/predict"


def test_get_thermal_heatmap():
    reading_id = "8732"
    response = requests.get(f"{HEATMAP_BASE_URL}/{reading_id}")
    
    assert response.status_code == 200
    assert response.headers['Content-Type'] == 'image/png'

    # with open('output.png', 'wb') as f:
    #     f.write(response.content)

    # Now send this image to the prediction service
    # Since response.content is binary, we wrap it in BytesIO to simulate a file
    files = {'file': ('image.png', BytesIO(response.content), 'image/png')}
    response = requests.post(PREDICT_BASE_URL, files=files)
    
    # Check the response from the prediction service
    assert response.status_code == 200
    # Assuming the prediction service returns JSON with a 'result' key
    prediction_data = response.json()
    assert 'result' in prediction_data
    print("Prediction result:", prediction_data['result'])

