import sys
import numpy as np
import matplotlib.pyplot as plt

vmin = 23
vmax = 30

def create_heatmap(data, output_path):
    plt.figure(figsize=(6, 4))
    heatmap = plt.imshow(data, cmap='hot', interpolation='nearest', vmin=vmin, vmax=vmax)    
    plt.colorbar(heatmap)
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()

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
