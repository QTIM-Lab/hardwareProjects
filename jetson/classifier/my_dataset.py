# my_dataset.py
import os
import csv
from PIL import Image
from torch.utils.data import Dataset
from torchvision import transforms

class MyDataset(Dataset):
    def __init__(self, image_directory, filenames, labels, transform=None):
        self.image_directory = image_directory
        self.transform = transform
        self.labels = {filename: label for filename, label in zip(filenames, labels)}
        self.validate_dataset()

    @staticmethod
    def load_labels(label_file):
        filenames = []
        labels = []
        with open(label_file, mode='r') as infile:
            reader = csv.reader(infile)
            next(reader, None)  # Skip the header
            for row in reader:
                filename, label = row
                filenames.append(filename)
                labels.append(int(label))
        return filenames, labels

    def validate_dataset(self):
        # Check that every file in self.labels has a corresponding label
        missing_labels = [f for f in self.labels if f not in self.labels]
        if missing_labels:
            print(f"Warning: No labels found for {len(missing_labels)} files: {missing_labels}")

        # Check that each file in self.labels exists in the directory
        missing_files = [f for f in self.labels if not os.path.exists(os.path.join(self.image_directory, f))]
        if missing_files:
            print(f"Warning: The following files are missing: {missing_files}")

        print(f"Total images with labels: {len(self.labels)}")


    def __len__(self):
        return len(self.labels)

    def __getitem__(self, idx):
        img_name = os.path.join(self.image_directory, list(self.labels.keys())[idx])
        image = Image.open(img_name).convert('RGB')
        label = self.labels[list(self.labels.keys())[idx]]

        if self.transform:
            image = self.transform(image)

        return image, label
