# ============================================================
# 1. Imports
# ============================================================
import os
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV3Large
from tensorflow.keras.applications.mobilenet_v3 import preprocess_input
from tensorflow.keras.layers import Dense, Dropout, GlobalAveragePooling2D
from tensorflow.keras.models import Model
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
from sklearn.metrics import classification_report, confusion_matrix
import numpy as np
from tensorflow.keras.callbacks import ModelCheckpoint
import glob
import re
from tensorflow.keras.models import load_model
from datetime import datetime
from tensorflow.keras.callbacks import TensorBoard
import pandas as pd
tf.keras.utils.set_random_seed(42)


class LrLogger(tf.keras.callbacks.Callback):
    def on_epoch_end(self, epoch, logs=None):
        lr = self.model.optimizer.learning_rate
        print(f"\nLearning rate: {float(lr):.8f}")


print("TensorFlow version:", tf.__version__)
print("GPU devices:", tf.config.list_physical_devices("GPU"))




# ============================================================
# 2. Dataset paths (CHANGE if needed)
# ============================================================
# BASE_DIR = "/media/chn/4T-P2/TenClasses/Ten_Classes_of_Durian_Leaf_Diseases"




# TRAIN_DIR = os.path.join(BASE_DIR, "Train")
# VAL_DIR   = os.path.join(BASE_DIR, "Validation")
# TEST_DIR  = os.path.join(BASE_DIR, "Test")




BASE_DIR = r"C:\Users\ADMIN\Downloads\Durian_Leaf_Disease"




TRAIN_DIR = os.path.join(BASE_DIR, "train")
VAL_DIR   = os.path.join(BASE_DIR, "val")
TEST_DIR  = os.path.join(BASE_DIR, "test")


# IMG_SIZE = (224, 224)
# BATCH_SIZE = 128
# NUM_CLASSES = 10
# EPOCHS = 60
IMG_SIZE = (224, 224)
BATCH_SIZE = 128
NUM_CLASSES = 13
EPOCHS = 60
MODEL_TAG = "MobileNetV3Large"



# ============================================================
# 3. Data generators
# ============================================================
train_datagen = ImageDataGenerator(
    preprocessing_function=preprocess_input,
    rotation_range=30,
    width_shift_range=0.15,
    height_shift_range=0.15,
    zoom_range=0.3,
    shear_range=0.15,
    horizontal_flip=True,
    brightness_range=[0.6, 1.4],
    channel_shift_range=20
)




val_test_datagen = ImageDataGenerator(
    preprocessing_function=preprocess_input
)




train_generator = train_datagen.flow_from_directory(
    TRAIN_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    shuffle=True,
    class_mode="categorical"
)




val_generator = val_test_datagen.flow_from_directory(
    VAL_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    shuffle=False
)




test_generator = val_test_datagen.flow_from_directory(
    TEST_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    shuffle=False
)




print("Class indices:", train_generator.class_indices)
print("Number of classes:", train_generator.num_classes)




# ============================================================
# 4. Build MobileNetV3Large model (Transfer Learning)
# ============================================================
base_model = MobileNetV3Large(
    weights="imagenet",
    include_top=False,
    input_shape=(IMG_SIZE[0], IMG_SIZE[1], 3)
)




# for layer in base_model.layers:
#     layer.trainable = False




x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dense(512, activation="relu")(x)
x = Dropout(0.5)(x)
output = Dense(NUM_CLASSES, activation="softmax")(x)




model = Model(inputs=base_model.input, outputs=output)




model.compile(
    optimizer=tf.keras.optimizers.AdamW(learning_rate=1e-4),
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)




#Ghi log
#Tạo thư mục log
log_dir = os.path.join(
    "logs",
    MODEL_TAG,
    #datetime.now().strftime("%Y%m%d-%H%M%S")
)
os.makedirs(log_dir, exist_ok=True)
checkpoint_dir = os.path.join("checkpoints", MODEL_TAG)
os.makedirs(checkpoint_dir, exist_ok=True)
# TensorBoard callback
tensorboard_cb = TensorBoard(
    log_dir=log_dir,
    histogram_freq=1,        # ghi histogram weights
    write_graph=True,
    write_images=False
)




# Ghi log ra file CSV
from tensorflow.keras.callbacks import CSVLogger




csv_logger = CSVLogger(
    filename=os.path.join(log_dir, "training_log.csv"),
    append=True
)
#Ghi thông tin model ra file txt
with open(os.path.join(log_dir, "model_summary_phase1.txt"), "w", encoding="utf-8") as f:
    model.summary(print_fn=lambda x: f.write(x + "\n"))




model.summary()




checkpoint = ModelCheckpoint(
    filepath=os.path.join(checkpoint_dir, f"{MODEL_TAG}_epoch_{{epoch:02d}}_valacc_{{val_accuracy:.4f}}.keras"),
    monitor="val_accuracy",
    verbose=1,
    save_best_only=False,   # save all epochs
    save_weights_only=False
)
    # ModelCheckpoint(
    #     "MobileNetV3Large_tendurian_best.h5",
    #     monitor="val_accuracy",
    #     save_best_only=True,
    #     verbose=1
    # )
# ============================================================
# 5. Callbacks
# ============================================================
callbacks = [
    EarlyStopping(monitor="val_loss", patience=8, restore_best_weights=True),
    ReduceLROnPlateau(monitor="val_loss", factor=0.3, patience=3, verbose=1),
    checkpoint,
    tensorboard_cb,
    csv_logger,
    LrLogger()
]




# ============================================================
# 6. Train model
# ============================================================
# history = model.fit(
#     train_generator,
#     epochs=EPOCHS,
#     validation_data=val_generator,
#     callbacks=callbacks
# )
# Phase 1: Freeze backbone (epochs 1–15)
#Freeze all convolutional layers
for layer in base_model.layers:
    layer.trainable = False




model.compile(
    optimizer=tf.keras.optimizers.AdamW(1e-4),
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)
#Ghi thông tin model ra file txt
with open(os.path.join(log_dir, "model_summary_phase1.txt"), "w", encoding="utf-8") as f:
    model.summary(print_fn=lambda x: f.write(x + "\n"))




history_1 = model.fit(
    train_generator,
    epochs=EPOCHS,
    validation_data=val_generator,
    callbacks=callbacks
)




#Phase 2: Unfreeze backbone (fine-tuning)
# Unfreeze all layers

model_files = glob.glob(os.path.join(checkpoint_dir, "*.keras"))


def extract_val_acc(filename):
    return float(re.search(r"valacc_(\d+\.\d+)", filename).group(1))


if model_files:
    best_model = max(model_files, key=extract_val_acc)
    print("Loading best model:", best_model)
    model = load_model(best_model)
else:
    print(f"No checkpoint found in {checkpoint_dir}. Continue fine-tuning current model in memory.")








#fine-tune (not better: weighted avg       0.87      0.86      0.86       648)
base_model = model.layers[1]
for layer in model.layers[:-20]:
    layer.trainable = False
for layer in model.layers[-20:]:
    layer.trainable = True
# IMPORTANT: use a lower learning rate for fine-tuning








# for layer in model.layers:
#     layer.trainable = True
model.compile(
    optimizer=tf.keras.optimizers.AdamW(1e-5),
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)
# #Ghi thông tin model ra file txt
# with open(os.path.join(log_dir, "model_summary_phase2.txt"), "w") as f:
#     model.summary(print_fn=lambda x: f.write(x + "\n"))




history_2 = model.fit(
    train_generator,
    epochs=EPOCHS,          # total epochs (e.g. 30)
    initial_epoch=15,       # resume from epoch 15
    validation_data=val_generator,
    callbacks=callbacks
)








# ============================================================
# 7. Evaluate on Test set
# ============================================================
def tta_predict(model, generator, tta_steps=5):
    preds = []


    for i in range(tta_steps):
        generator.reset()
        pred = model.predict(generator, verbose=0)
        preds.append(pred)


    preds = np.mean(preds, axis=0)
    return preds
test_loss, test_acc = model.evaluate(test_generator)
print(f"\nTest Accuracy: {test_acc:.4f}")




# ============================================================
# 8. Classification Report & Confusion Matrix
# ============================================================
y_true = test_generator.classes
y_pred_probs = tta_predict(model, test_generator)
y_pred = np.argmax(y_pred_probs, axis=1)




class_names = list(test_generator.class_indices.keys())




print("\nClassification Report:")
report=classification_report(y_true, y_pred, target_names=class_names)
print(report)
with open(os.path.join(log_dir, "classification_report.txt"), "w", encoding="utf-8") as f:
    f.write(report)




print("\nConfusion Matrix:")
matrix=confusion_matrix(y_true, y_pred)
print(matrix)
cm_df = pd.DataFrame(matrix, index=class_names, columns=class_names)
filename=os.path.join(log_dir, "confusion_matrix.csv")
cm_df.to_csv(filename)












#Select top-5 models by validation accuracy
model_files = glob.glob(os.path.join(checkpoint_dir, "*.keras"))




def extract_val_acc(filename):
    return float(re.search(r"valacc_(\d+\.\d+)", filename).group(1))




model_files = sorted(
    model_files,
    key=extract_val_acc,
    reverse=True
)




top5_models = model_files[:1]
if not top5_models:
    raise FileNotFoundError(f"No checkpoints available in {checkpoint_dir} for model averaging.")

print("Top-5 models:")
for m in top5_models:
    print(m)




# Keep top 8
models_to_delete = model_files[8:]
print("\nDeleting other models:")
for m in models_to_delete:
    print(m)
    os.remove(m)




#Average weights of top-5 models
def average_models(model_paths):
    models = [tf.keras.models.load_model(p) for p in model_paths]




    avg_model = tf.keras.models.clone_model(models[0])
    avg_model.set_weights([
        np.mean([m.get_weights()[i] for m in models], axis=0)
        for i in range(len(models[0].get_weights()))
    ])




    avg_model.compile(
        optimizer=tf.keras.optimizers.AdamW(1e-4),
        loss="categorical_crossentropy",
        metrics=["accuracy"]
    )




    return avg_model

avg_model = average_models(top5_models)
avg_model.save("MobileNetV3Large_tendurian_avg_top5.keras")
avg_loss, avg_acc = avg_model.evaluate(test_generator)
print(f"Averaged model accuracy: {avg_acc:.4f}")

# ============================================================
# 8. Classification Report & Confusion Matrix
# ============================================================
y_true = test_generator.classes
y_pred_probs = tta_predict(avg_model, test_generator)
y_pred = np.argmax(y_pred_probs, axis=1)

class_names = list(test_generator.class_indices.keys())

print("\nClassification Report:")
report=classification_report(y_true, y_pred, target_names=class_names)
print(report)
with open(os.path.join(log_dir, "classification_report_avg5.txt"), "w", encoding="utf-8") as f:
    f.write(report)


print("\nConfusion Matrix:")
matrix=confusion_matrix(y_true, y_pred)
print(matrix)
cm_df = pd.DataFrame(matrix, index=class_names, columns=class_names)
filename=os.path.join(log_dir, "confusion_matrix_avg5.csv")
cm_df.to_csv(filename)
model.save("MobileNetV3Large_durian_disease_final.keras")





