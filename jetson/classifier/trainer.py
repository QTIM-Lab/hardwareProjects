import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from my_dataset import MyDataset
from torchvision import transforms
from urllib.request import urlopen
from PIL import Image
import timm
import time
from sklearn.model_selection import train_test_split


image_directory='/home/alan/Documents/uc_thermal_data/combined'
label_file='/home/alan/Documents/uc_thermal_data/labels.csv'

# Define transformations
transform = transforms.Compose([
    transforms.Resize((224, 224)),  # Example resize, adjust as needed
    transforms.ToTensor(),
    # Add any other transformations you need
])
# Create dataset and data loader
# Use the static method to get filenames and labels
filenames, labels = MyDataset.load_labels(label_file)

print(len(filenames), " files referenced int labels_file")
print(len(labels), " labels referenced int labels_file")

# # Split the data into training and validation sets
# train_filenames, val_filenames, train_labels, val_labels = train_test_split(
#     filenames, labels, test_size=0.20, stratify=labels, random_state=42
# )

# Split the data into training+validation sets and test set
train_val_filenames, test_filenames, train_val_labels, test_labels = train_test_split(
    filenames, labels, test_size=0.10, stratify=labels, random_state=42  # Adjust test_size as needed
)

# Further split the training+validation sets into training and validation sets
train_filenames, val_filenames, train_labels, val_labels = train_test_split(
    train_val_filenames, train_val_labels, test_size=0.10, stratify=train_val_labels, random_state=42  # Adjust test_size as needed
)

print(len(train_filenames), " filenames in train_filenames")
print(f"Sample train filenames: {train_filenames[:5]}")
print(len(train_labels), " labels in train_labels")
print(f"Sample train labels: {train_labels[:5]}")

print(len(val_filenames), " filenames in val_filenames")
print(f"Sample val filenames: {val_filenames[:5]}")
print(len(val_labels), " labels in val_labels")
print(f"Sample val labels: {val_labels[:5]}")


# Create datasets for training and validation
train_dataset = MyDataset(image_directory, train_filenames, train_labels, transform=transform)
val_dataset = MyDataset(image_directory, val_filenames, val_labels, transform=transform)

# Create DataLoaders for training and validation sets
train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
val_loader = DataLoader(val_dataset, batch_size=32, shuffle=False)

# Create the MobileNetV3 model with a custom classifier
model = timm.create_model('mobilenetv3_small_075', pretrained=True)
model.classifier = nn.Sequential(
    nn.Linear(model.classifier.in_features, 5)  # Replace with 5 for your 5 classes
)
model = model.train()  # Set the model to training mode

# Get model-specific transforms
data_config = timm.data.resolve_model_data_config(model)
transforms = timm.data.create_transform(**data_config, is_training=True)

# Example loss function and optimizer (adjust as needed for your training)
loss_function = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

num_epochs = 10  # Decide how many epochs to train for

for epoch in range(num_epochs):
    start_time = time.time()
    print("starting epoch ", epoch + 1)

    # Training Phase
    model.train()  # Ensure the model is in training mode
    total_train_loss = 0
    for images, labels in train_loader:
        # Move images and labels to the appropriate device (e.g., GPU if available)
        # images, labels = images.to(device), labels.to(device)

        optimizer.zero_grad()  # Clear existing gradients
        outputs = model(images)  # Forward pass
        loss = loss_function(outputs, labels)  # Compute loss
        loss.backward()  # Backward pass (compute gradients)
        optimizer.step()  # Update model parameters
        total_train_loss += loss.item()

    avg_train_loss = total_train_loss / len(train_loader)

    # Validation Phase
    model.eval()  # Set the model to evaluation mode
    total_val_loss = 0
    with torch.no_grad():  # Disable gradient computation
        for images, labels in val_loader:
            # Move images and labels to the appropriate device
            # images, labels = images.to(device), labels.to(device)

            outputs = model(images)
            loss = loss_function(outputs, labels)
            total_val_loss += loss.item()

    avg_val_loss = total_val_loss / len(val_loader)


    end_time = time.time()  # End time of the epoch
    epoch_duration = end_time - start_time  # Duration of the epoch

    print(f"Epoch [{epoch+1}/{num_epochs}], Duration: {epoch_duration:.2f} seconds, Loss: {loss.item():.4f}")
    print(f"Epoch [{epoch+1}/{num_epochs}], Average Training Loss: {avg_train_loss:.4f}")
    print(f"Epoch [{epoch+1}/{num_epochs}], Average Validation Loss: {avg_val_loss:.4f}")

torch.save(model.state_dict(), 'model_ucdata_1.pth')


# now run some tests on the test data

# Assuming you've already defined a transform for your datasets
test_dataset = MyDataset(image_directory, test_filenames, test_labels, transform=transform)
test_loader = DataLoader(test_dataset, batch_size=32, shuffle=False)  # Batch size can be adjusted

# If needed, initialize the model structure first
model = timm.create_model('mobilenetv3_small_075', pretrained=False)  # Use the same model structure
model.classifier = nn.Sequential(nn.Linear(model.classifier.in_features, 5))  # Adjust for your number of classes

# Load the trained model weights
model.load_state_dict(torch.load('model_ucdata_1.pth'))
model.eval()  # Set to evaluation mode

total_test_loss = 0
correct_predictions = 0

with torch.no_grad():
    for images, labels in test_loader:
        # images, labels = images.to(device), labels.to(device)  # Use if you're utilizing a specific device like GPU
        outputs = model(images)
        
        # Calculate loss
        loss = loss_function(outputs, labels)
        total_test_loss += loss.item()
        
        # Calculate accuracy
        _, predicted = torch.max(outputs.data, 1)
        correct_predictions += (predicted == labels).sum().item()

avg_test_loss = total_test_loss / len(test_loader)
accuracy = correct_predictions / len(test_dataset)

print(f"Average Test Loss: {avg_test_loss:.4f}")
print(f"Test Accuracy: {accuracy:.4f}")
