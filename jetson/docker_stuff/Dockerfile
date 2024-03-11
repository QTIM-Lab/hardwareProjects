# Start from Nvidia's PyTorch base image for Jetson Nano
FROM nvcr.io/nvidia/l4t-pytorch:r32.7.1-pth1.10-py3

# get latest keys from kitware - 
RUN wget -qO - https://apt.kitware.com/keys/kitware-archive-latest.asc | apt-key add -

# Install any additional dependencies you might need
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3-pip \
    python3-setuptools \
    && rm -rf /var/lib/apt/lists/*

# python dependencies
RUN pip3 install flask
RUN pip3 install Pillow==8.2.0
RUN pip3 install timm
RUN pip3 install scipy
RUN pip3 install scikit-learn


# Copy your model serving script and any other files your application needs
COPY . /app
WORKDIR /app

# Expose the port your application will use
EXPOSE 6000

# Command to run your application
# CMD ["python3", "model_serve.py"]

