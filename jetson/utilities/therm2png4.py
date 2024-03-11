from PIL import Image

def process_file(input_file, output_file, pixel_size):
    data = read_data(input_file)
    if not data:
        print("No data found in input file.")
        return
    
    # Reshape data into a 2D array
    width = len(data[0]) * pixel_size
    height = len(data) * pixel_size
    
    # Create a blank image with the calculated dimensions
    img = Image.new('L', (width, height), color='white')
    pixels = img.load()
    
    # Populate the image with data
    for y, row in enumerate(data):
        for x, value in enumerate(row):
            # Repeat each value pixel_size times horizontally and vertically
            for dx in range(pixel_size):
                for dy in range(pixel_size):
                    pixels[x * pixel_size + dx, y * pixel_size + dy] = int(value)
    
    # Save the image
    img.save(output_file)

def read_data(input_file):
    with open(input_file, 'r') as file:
        data = []
        for line in file:
            line = line.strip()  # Remove leading/trailing whitespaces
            if line and line != '"':  # Skip empty lines or lines with only a quotation mark
                line = line.strip('"')  # Remove quotation marks from the beginning and end of the line
                values = line.split()
                print("Values before conversion:", values)  # Debug print
                try:
                    values = [float(value) for value in values]  # Convert each value to float
                except ValueError as e:
                    print("Error converting values to float:", e)  # Debug print
                else:
                    data.append(values)  # Append converted values to data
    return data

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) != 4:
        print("Usage: python3 therm2png3.py input_file output_file pixel_size")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    pixel_size = int(sys.argv[3])

    process_file(input_file, output_file, pixel_size)

