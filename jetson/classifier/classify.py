import torch
from urllib.request import urlopen
from PIL import Image
import timm

# img = Image.open(urlopen(
#     'https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/beignets-task-guide.png'
# ))

img = Image.open("/Users/alancramer/Documents/resume/images/SwingThrone.png").convert('RGB')

model = timm.create_model('mobilenetv3_small_075.lamb_in1k', pretrained=True)
model = model.eval()

# get model specific transforms (normalization, resize)
data_config = timm.data.resolve_model_data_config(model)
transforms = timm.data.create_transform(**data_config, is_training=False)

output = model(transforms(img).unsqueeze(0))  # unsqueeze single image into batch of 1

top5_probabilities, top5_class_indices = torch.topk(output.softmax(dim=1) * 100, k=5)

for probability, class_index in zip(top5_probabilities[0], top5_class_indices[0]):
    # class_name = imagenet_classes[class_index]
    print(f'{class_index}: {probability.item():.2f}%')