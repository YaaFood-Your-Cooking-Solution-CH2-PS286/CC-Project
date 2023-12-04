import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

import io
import tensorflow as tf
from tensorflow import keras
import numpy as np
from flask import Flask, request, jsonify
from tensorflow.keras.preprocessing.image import ImageDataGenerator, img_to_array, load_img
import time

model = keras.models.load_model("yafood_model.h5")

def read_image(file_path):
    image = load_img(file_path, target_size=(150, 150))
    image = img_to_array(image)  
    image = np.expand_dims(image, axis=0)
    image /= 255.  
    return image[0]

def test_single_image(image_array):
    images = np.expand_dims(image_array, axis=0)
    view = ['ayam', 'bawang bombay', 'bawang merah', 'bawang putih', 'bayam', 'brokoli', 
    'buncis', 'Cabai', 'daging kambing', 'daun singkong', 'ikan', 'jagung', 
    'jamur',  'kacang panjang', 'kangkung', 'kentang', 'kol', 'mie', 'nasi', 
    'sapi', 'sawi', 'serai',  'tahu', 'taoge', 'telur', 'tempe', 'terong', 'timun', 
    'tomat',  'udang', 'wortel']
    time.sleep(.5)
    preds = model.predict(images)

    max_index = np.argmax(preds[0])
    max_label = view[max_index]

    print("Hasil : {}".format(max_label))
    print("Probabilitas: {}%".format(round(preds[0][max_index] * 100, 2)))
    print()

    return str(max_label)

app = Flask(__name__)

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        file = request.files.get('file')
        if file is None or file.filename == "":
            return jsonify({"error": "no file"})

        try:
            file.save('static/uploads/file.jpg')
            tensor = read_image('static/uploads/file.jpg')
            prediction = test_single_image(tensor)
            data = {"prediction": str(prediction)}
            return jsonify(data)
        except Exception as e:
            return jsonify({"error": str(e)})

    return "App Work"


if __name__ == "__main__":
    app.run(debug=True)



