import sys
from PIL import Image

def value_to_color(value):
    # Define the temperature range and corresponding colors
    # for the range vmin = 23 to vmax = 30 
    temp_points = [23, 25, 27, 28, 30]  # Temperature points
    colors = [
        (0, 0, 0),         # Black
        (139, 0, 0),       # Dark Red
        (255, 0, 0),       # Bright Red
        (255, 165, 0),     # Orange
        (255, 255, 0)      # Bright Yellow
    ]

    # Cap the value to be within the min and max temperature
    value = max(temp_points[0], min(temp_points[-1], value))

    # Find the appropriate color range for the value
    for i in range(1, len(temp_points)):
        if value <= temp_points[i]:
            # Linearly interpolate the color between the two points
            t = (value - temp_points[i-1]) / (temp_points[i] - temp_points[i-1])
            r = int((1-t) * colors[i-1][0] + t * colors[i][0])
            g = int((1-t) * colors[i-1][1] + t * colors[i][1])
            b = int((1-t) * colors[i-1][2] + t * colors[i][2])
            return (r, g, b)
    
    # If the value is above the last point, return the last color
    return colors[-1]




def therm_to_png(input_file, output_file, pixel_size):
    with open(input_file, 'r') as f:
        data = f.read().strip('"')

    lines = data.split('\\n')
    values = [[float(value) for value in line.strip().split() if value.strip()] for line in lines]

    # Original image dimensions
    height, width = len(values), max(len(line) for line in values)

    # Create an RGB image with each pixel initially black
    image = Image.new('RGB', (width * pixel_size, height * pixel_size), "black")
    pixels = image.load()

    for i, line in enumerate(values):
        for j, value in enumerate(line):
            # Map value to color
            color = value_to_color(value)
            # Fill the pixel_size x pixel_size block with this color
            for k in range(pixel_size):
                for l in range(pixel_size):
                    pixels[j * pixel_size + k, i * pixel_size + l] = color

    image.save(output_file)

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python3 script.py input_file output_file pixel_size")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]
    pixel_size = int(sys.argv[3])

    therm_to_png(input_file, output_file, pixel_size)

