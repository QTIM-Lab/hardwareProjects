import sys
import numpy as np
from PIL import Image

def create_heatmap(data, output_path):
    # Normalize data to 0-255 range
    normalized_data = ((data - data.min()) / (data.max() - data.min()) * 255).astype(np.uint8)
    
    # Create Pillow image
    heatmap = Image.fromarray(normalized_data, mode='L')
    
    # Save image
    heatmap.save(output_path)

def read_data(file_path):
    data = np.loadtxt(file_path)
    data = data.astype(float)
    data = np.where(np.isnan(data), np.nanmin(data), data)
    return data

def process_file(input_file, output_file):
    data = read_data(input_file)
    create_heatmap(data, output_file)

if __name__ == "__main__":
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    process_file(input_file, output_file)

