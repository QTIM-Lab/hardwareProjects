import torch
import torch.nn as nn
from torchvision import transforms
from PIL import Image
import timm

def load_model(model_path):
    # Initialize the model structure
    model = timm.create_model('mobilenetv3_small_075', pretrained=False)
    model.classifier = nn.Sequential(nn.Linear(model.classifier.in_features, 5))  # Adjust for your number of classes
    
    # Load the trained model weights
    model.load_state_dict(torch.load(model_path))
    model.eval()  # Set the model to evaluation mode
    return model

def transform_image(image):
    # Define the same transformations as during training
    transform = transforms.Compose([
        transforms.Resize((224, 224)),  # Resize the image
        transforms.ToTensor(),  # Convert image to Tensor
        # Add any other necessary transformations
    ])
    return transform(image)

def predict_image(model, image_path):
    # Load the image
    image = Image.open(image_path)
    
    # Transform the image
    image = transform_image(image)
    
    # Add an extra batch dimension since pytorch treats all inputs as batches
    image = image.unsqueeze(0)
    
    # Get the prediction
    with torch.no_grad():
        outputs = model(image)
        _, predicted = torch.max(outputs, 1)
    
    return predicted.item()

# Load your trained model
model = load_model('model_ucdata_1.pth')

# Path to your test image
image_path = './testdata/s3-2-13-24-1_45000.png'

# Get the prediction
prediction = predict_image(model, image_path)
print(f"Predicted Class: {prediction}")

