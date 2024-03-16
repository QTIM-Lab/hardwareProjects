from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import torch.nn as nn
from torchvision import transforms
from PIL import Image
import timm
import io


app = Flask(__name__)
CORS(app)

def load_model(model_path):
    model = timm.create_model('mobilenetv3_small_075', pretrained=False)
    model.classifier = nn.Sequential(nn.Linear(model.classifier.in_features, 5))
    model.load_state_dict(torch.load(model_path, map_location=torch.device('cpu')))
    model.eval()
    return model

def transform_image(image_bytes):
    image = Image.open(io.BytesIO(image_bytes))
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
    ])
    return transform(image)

def predict_image(model, image_bytes):
    image = transform_image(image_bytes)
    image = image.unsqueeze(0)
    with torch.no_grad():
        outputs = model(image)
        _, predicted = torch.max(outputs, 1)
    return predicted.item()

# Load your trained model (adjust path as needed)
model = load_model('model_ucdata_1.pth')

@app.route('/predict', methods=['POST'])
def predict():
    if request.method == 'POST':
        # Check if the request has the file part
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'})
        file = request.files['file']
        if file.filename == '':
            print("Error: predict(): empty filename")
            return jsonify({'error': 'No selected file'})
        if file:
            img_bytes = file.read()
            prediction = predict_image(model, img_bytes)

            print("Prediction result:", prediction);

            # Define your condition for returning true or false
            response = prediction  
            
            return jsonify({'result': response})

    return jsonify({'error': 'Invalid request'})

@app.route('/ping-server', methods=['GET'])
def ping_server():
    return jsonify({'result': 'hello from docker-flask server for thermal sensor classification'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)

