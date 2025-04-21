from flask import Flask, request, send_file, jsonify
from PIL import Image
import io
import cv2
import numpy as np
from utils.land_cover_utils import classify_land_cover
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def enhance_image(pil_img):
    """
    Enhance image using histogram equalization and denoising.
    """
    img = np.array(pil_img)

    # Convert to YCrCb color space and equalize the Y channel (brightness)
    ycrcb = cv2.cvtColor(img, cv2.COLOR_RGB2YCrCb)
    y, cr, cb = cv2.split(ycrcb)
    y_eq = cv2.equalizeHist(y)
    ycrcb_eq = cv2.merge((y_eq, cr, cb))
    enhanced = cv2.cvtColor(ycrcb_eq, cv2.COLOR_YCrCb2RGB)

    # Apply fast non-local means denoising
    denoised = cv2.fastNlMeansDenoisingColored(enhanced, None, 10, 10, 7, 21)

    return Image.fromarray(denoised)

def classify_land_cover_text(image):
    """
    Classifies the land cover type and returns the predominant type as text.
    """
    # Convert image to numpy array
    img_array = np.array(image)

    # Create masks for vegetation, water, and urban
    hsv = cv2.cvtColor(img_array, cv2.COLOR_RGB2HSV)
    
    vegetation_mask = cv2.inRange(hsv, (36, 25, 25), (86, 255, 255))
    water_mask = cv2.inRange(hsv, (90, 50, 50), (130, 255, 255))
    urban_mask = cv2.inRange(hsv, (0, 0, 100), (180, 50, 255))

    # Calculate the percentages of each type
    vegetation_percentage = np.sum(vegetation_mask) / vegetation_mask.size
    water_percentage = np.sum(water_mask) / water_mask.size
    urban_percentage = np.sum(urban_mask) / urban_mask.size

    # Classify the predominant land cover type
    if max(vegetation_percentage, water_percentage, urban_percentage) == vegetation_percentage:
        return "Forest"
    elif max(vegetation_percentage, water_percentage, urban_percentage) == water_percentage:
        return "Water Bodies"
    else:
        return "Urban Areas"

@app.route('/classify', methods=['POST'])
def classify():
    if 'image' not in request.files:
        return "No image provided", 400

    try:
        image = Image.open(request.files['image']).convert('RGB')

        # Step 1: Enhance the image
        enhanced_img = enhance_image(image)

        # Step 2: Classify land cover
        land_cover_type = classify_land_cover_text(enhanced_img)

        # Step 3: Classify land cover visually
        classified_img = classify_land_cover(enhanced_img)

        # Step 4: Send both image and text result
        buffer = io.BytesIO()
        classified_img.save(buffer, format='JPEG')
        buffer.seek(0)

        # Return both image and text result
        return send_file(buffer, mimetype='image/jpeg', as_attachment=False), jsonify({
            'result': land_cover_type
        })

    except Exception as e:
        return {"error": str(e)}, 500
import os

@app.route('/')
def index():
    return "Land Cover Classifier Backend is Running!"

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
