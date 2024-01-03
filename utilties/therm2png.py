import numpy as np
import matplotlib.pyplot as plt
import glob
import os

def create_heatmap(data, output_path):
    plt.figure(figsize=(6, 4))
    # heatmap = plt.imshow(data, cmap='hot', interpolation='nearest', vmin=np.min(data), vmax=np.max(data))
    heatmap = plt.imshow(data, cmap='hot', interpolation='nearest', vmin=25, vmax=35)    
    plt.colorbar(heatmap)
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()

def read_data(file_path):
    data = np.loadtxt(file_path)
    data = data.astype(float)  # convert to strings to floats
    data = np.where(np.isnan(data), np.nanmin(data), data) # handle nans - where are these coming from??
    print(np.nanmin(data), np.nanmax(data)) # do we want a single scale for all images?
    return data

def process_files(input_folder, output_folder):
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    for file_path in glob.glob(f"{input_folder}/*.txt"):
        print(f"Processing {file_path}")
        data = read_data(file_path)
        output_file = os.path.basename(file_path).replace('.txt', '.png')
        output_path = os.path.join(output_folder, output_file)
        create_heatmap(data, output_path)
        print(f"Image saved to {output_path}")

# call the process_files function with your input and output folders
process_files('./lapse022', './lapse022_images')
