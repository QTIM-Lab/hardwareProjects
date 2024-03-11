import sys
import json
from PIL import Image

def therm_to_png(input_file, output_file, scale_factor):
    with open(input_file, 'r') as f:
        # Read the file content and remove surrounding quotes
        data = f.read().strip('"')

    # Split the string into individual lines
    lines = data.split('\\n')
    
    # Split each line into temperature readings
    values = [float(value) for line in lines for value in line.strip().split() if value.strip()]
    
    # Scale the values
    scaled_values = [int(value * scale_factor) for value in values]
    
    # Determine image dimensions
    width = len(lines[0])*scale_factor
    height = len(lines)*scale_factor

    print("width: ", width, "   height: ", height);
    
    # Create image from data
    image = Image.new('L', (width, height))
    image.putdata(scaled_values)
    
    # Save the image
    image.save(output_file)

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python3 therm2png6.py input_file output_file scale_factor")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]
    scale_factor = float(sys.argv[3])

    therm_to_png(input_file, output_file, scale_factor)

