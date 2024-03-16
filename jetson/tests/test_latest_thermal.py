import requests

# Assuming your API runs on localhost:3000
BASE_URL = "http://localhost:3001"

def test_get_latest_thermal_reading():
    sensor_id = "s3-test-spkfn-1"  
    response = requests.get(f"{BASE_URL}/get-latest-thermal-reading/{sensor_id}")
    
    assert response.status_code == 200
   
    assert 'filename' in response.json()
    assert 'fileContent' in response.json()
    assert 'timeWrite' in response.json()
    assert 'timeRead' in response.json()
    assert 'dataId' in response.json()
    assert 'readingId' in response.json()


