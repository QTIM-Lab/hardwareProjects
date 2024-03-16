import os
import requests

BASE_URL = "http://localhost:8080"

def test_server_up():
    response = requests.get(f"{BASE_URL}/ping-server")
    
    assert response.status_code == 200
   
    assert 'result' in  response.json()


# URL of the running webservice
SERVICE_URL = "http://localhost:8080/predict"

def test_predict_with_image():
    # Paths to your test images
    img_path1 = os.path.join('testdata', 's3-2-13-24-1_45000.png')
    img_path2 = os.path.join('testdata', 's3-test-spkfn-1_22089130.png')

    # img_path1 = os.path.join('testdata', 'spkfn1_906.png')
    # img_path2 = os.path.join('testdata', 'spkfn1_3444.png')
    
    # Test with the first image
    with open(img_path1, 'rb') as img1:
        files = {'file': ('image1.png', img1, 'image/png')}
        response = requests.post(SERVICE_URL, files=files)
        assert response.status_code == 200
        json_response = response.json()
        assert 'result' in json_response
        assert json_response['result'] == 1

    # Test with the second image
    with open(img_path2, 'rb') as img2:
        files = {'file': ('image2.jpg', img2, 'image/jpeg')}
        response = requests.post(SERVICE_URL, files=files)
        assert response.status_code == 200
        assert 'result' in json_response
        assert json_response['result'] == 1

def test_predict_without_file():
    # Sending a request without a file to check error handling
    response = requests.post(SERVICE_URL)
    assert response.status_code == 200  
    assert 'error' in response.json()
    assert response.json()['error'] == 'No file part'

