import numpy as np
import cv2
from PIL import Image

def classify_land_cover(pil_img):
    """
    Classifies land cover types from an image using simple HSV masking.
    Output is color-coded:
    - Green: vegetation
    - Blue: water
    - Gray: urban
    """
    img = pil_img.convert("RGB")
    np_img = np.array(img)
    hsv = cv2.cvtColor(np_img, cv2.COLOR_RGB2HSV)

    # Define HSV ranges for land cover types
    vegetation_mask = cv2.inRange(hsv, (36, 25, 25), (86, 255, 255))  # green
    water_mask = cv2.inRange(hsv, (90, 50, 50), (130, 255, 255))      # blue
    urban_mask = cv2.inRange(hsv, (0, 0, 100), (180, 50, 255))        # gray/white

    # Create an empty result image
    result = np.zeros_like(np_img)

    # Apply masks with colors
    result[vegetation_mask > 0] = [34, 139, 34]      # forest green
    result[water_mask > 0] = [30, 144, 255]          # dodger blue
    result[urban_mask > 0] = [169, 169, 169]         # dark gray

    return Image.fromarray(result)
