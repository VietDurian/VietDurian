import streamlit as st
import tensorflow as tf
import numpy as np
from PIL import Image
from tensorflow.keras.applications.mobilenet_v3 import preprocess_input

# ===============================
# CONFIG
# ===============================
IMG_SIZE = (224, 224)

CLASS_NAMES = [
    "Canker_Disease",
    "Fruit_Rot",
    "Leaf_Algal",
    "Leaf_Blight",
    "Leaf_Colletotrichum",
    "Leaf_Healthy",
    "Leaf_Phomopsis",
    "Leaf_Rhizoctonia",
    "Mealybug_Infestation",
    "Pink_Disease",
    "Sooty_Mold",
    "Stem_Blight",
    "Stem_Cracking_Gummosis",
    "Thrips_Disease",
    "Yellow_Leaf",
]


@st.cache_resource
def load_model():
    model = tf.keras.models.load_model("MobileNetV3Large_tendurian_avg_top5.keras")
    return model


model = load_model()

st.title("🌿 Durian Leaf Disease Classification")
st.write("Upload an image of a durian leaf to analyze disease.")

uploaded_file = st.file_uploader("Choose an image...", type=["jpg", "jpeg", "png"])

if uploaded_file is not None:
    image = Image.open(uploaded_file).convert("RGB")
    st.image(image, caption="Uploaded Image", use_column_width=True)

    img = image.resize(IMG_SIZE)
    img_array = np.array(img)
    img_array = preprocess_input(img_array)
    img_array = np.expand_dims(img_array, axis=0)

    predictions = model.predict(img_array)
    predicted_class = CLASS_NAMES[np.argmax(predictions)]
    confidence = np.max(predictions)

    st.subheader("Prediction:")
    st.success(f"{predicted_class}")
    st.write(f"Confidence: {confidence:.2%}")

    st.subheader("Class Probabilities:")
    for i, prob in enumerate(predictions[0]):
        st.write(f"{CLASS_NAMES[i]}: {prob:.2%}")
