import sys
from PIL import Image

def create_heatmap(data, output_path):
    # Normalize data to 0-255 range
    min_val = min(data)
    max_val = max(data)
    normalized_data = [int((x - min_val) / (max_val - min_val) * 255) for x in data]

    # Create grayscale image
    image = Image.new("L", (len(data), 1))
    image.putdata(normalized_data)

    # Save image
    image.save(output_path)

def read_data(input_file):
    with open(input_file, 'r') as file:
        lines = file.readlines()
        data = []
        for line in lines:
            values = line.strip().split()  # Split the line by spaces
            for value in values:
                try:
                    data.append(float(value))  # Convert each value to float
                except ValueError:
                    print("Invalid value:", value)
    return data

def process_file(input_file, output_file):
    data = read_data(input_file)
    create_heatmap(data, output_file)

if __name__ == "__main__":
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    process_file(input_file, output_file)

