"""
=============================================================================
Pneumonia Detection — Combined Pediatric + Adult Training
=============================================================================
Datasets
  Pediatric : paultimothymooney/chest-xray-pneumonia
  Adult     : tawsifurrahman/covid19-radiography-database

Architecture : VGG19 Transfer Learning (ImageNet)
Phase 1      : Frozen VGG19 — train new head only
Phase 2      : Unfreeze block5 — fine-tune top conv block at 10x lower LR

Platform     : Kaggle Notebook — enable GPU accelerator before running
=============================================================================
"""

import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.applications import VGG19
from tensorflow.keras.models import Model
from tensorflow.keras.layers import (
    Dense, Dropout, GlobalAveragePooling2D, BatchNormalization
)
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import (
    ModelCheckpoint, EarlyStopping, ReduceLROnPlateau
)

IMG_SIZE      = 224
BATCH_SIZE    = 32
PHASE1_EPOCHS = 20
PHASE2_EPOCHS = 10
LR_PHASE1     = 1e-4
LR_PHASE2     = 1e-5
AUTOTUNE      = tf.data.AUTOTUNE

def find_dir(search_root, must_contain_subdir):
    for root, dirs, _ in os.walk(search_root):
        if must_contain_subdir in dirs:
            return root
    return None

print("=== /kaggle/input tree (depth 3) ===")
for root, dirs, files in os.walk('/kaggle/input'):
    depth = root.replace('/kaggle/input', '').count(os.sep)
    if depth > 3:
        dirs.clear()
        continue
    indent = '  ' * depth
    print(f"{indent}{os.path.basename(root)}/")
print("=====================================\n")

ped_base = find_dir('/kaggle/input/chest-xray-pneumonia', 'train')
if ped_base is None:
    ped_base = find_dir('/kaggle/input', 'train')
assert ped_base, "Could not locate Mooney chest-xray-pneumonia dataset"
PED_TRAIN = os.path.join(ped_base, 'train')
PED_VAL   = os.path.join(ped_base, 'val')
PED_TEST  = os.path.join(ped_base, 'test')
print(f"Pediatric base  : {ped_base}")

adult_base = find_dir('/kaggle/input/covid19-radiography-database', 'Normal')
if adult_base is None:
    adult_base = find_dir('/kaggle/input', 'Normal')
assert adult_base, "Could not locate COVID-19 Radiography dataset"
ADULT_DIR     = adult_base
ADULT_CLASSES = ['Normal', 'Viral Pneumonia']
print(f"Adult base      : {ADULT_DIR}\n")

def load_ds(path, class_names=None, split=None, subset=None, shuffle=True):
    return tf.keras.utils.image_dataset_from_directory(
        path,
        image_size       = (IMG_SIZE, IMG_SIZE),
        batch_size       = None,
        label_mode       = 'binary',
        class_names      = class_names,
        validation_split = split,
        subset           = subset,
        seed             = 42,
        shuffle          = shuffle,
    )

print("Loading pediatric dataset (Mooney)...")
ped_train = load_ds(PED_TRAIN)
ped_val_tiny = load_ds(PED_VAL)
ped_test     = load_ds(PED_TEST, shuffle=False)

print("Loading adult dataset (COVID-19 Radiography Database)...")
adult_train = load_ds(ADULT_DIR, class_names=ADULT_CLASSES, split=0.20, subset='training')
adult_val   = load_ds(ADULT_DIR, class_names=ADULT_CLASSES, split=0.20, subset='validation', shuffle=False)

def count_classes(ds):
    n, p = 0, 0
    for _, lbl in ds:
        if int(lbl.numpy()) == 0:
            n += 1
        else:
            p += 1
    return n, p

print("\nCounting class distribution across both datasets...")
ped_n,   ped_p   = count_classes(ped_train)
ped_vn,  ped_vp  = count_classes(ped_val_tiny)
adult_n, adult_p = count_classes(adult_train)

total_normal    = ped_n + ped_vn + adult_n
total_pneumonia = ped_p + ped_vp + adult_p
total           = total_normal + total_pneumonia

w_normal    = total / (2.0 * total_normal)
w_pneumonia = total / (2.0 * total_pneumonia)
class_weight = {0: w_normal, 1: w_pneumonia}

print(f"  Combined total  — Normal: {total_normal:,}  Pneumonia: {total_pneumonia:,}")
print(f"  Class weights   — Normal: {w_normal:.3f}   Pneumonia: {w_pneumonia:.3f}\n")

def normalize(img, lbl):
    return tf.cast(img, tf.float32) / 255.0, lbl

def augment(img, lbl):
    img = tf.image.random_flip_left_right(img)
    img = tf.image.random_brightness(img, max_delta=0.08)
    img = tf.image.random_contrast(img, lower=0.92, upper=1.08)
    return img, lbl

train_ds = (
    ped_train
    .concatenate(ped_val_tiny)
    .concatenate(adult_train)
    .map(normalize, num_parallel_calls=AUTOTUNE)
    .map(augment,   num_parallel_calls=AUTOTUNE)
    .shuffle(5000)
    .batch(BATCH_SIZE)
    .prefetch(AUTOTUNE)
)

val_ds = (
    adult_val
    .map(normalize, num_parallel_calls=AUTOTUNE)
    .batch(BATCH_SIZE)
    .prefetch(AUTOTUNE)
)

test_ds = (
    ped_test
    .map(normalize, num_parallel_calls=AUTOTUNE)
    .batch(BATCH_SIZE)
    .prefetch(AUTOTUNE)
)

base = VGG19(weights='imagenet', include_top=False, input_shape=(IMG_SIZE, IMG_SIZE, 3))

for layer in base.layers:
    layer.trainable = False

x = GlobalAveragePooling2D()(base.output)
x = BatchNormalization()(x)
x = Dense(256, activation='relu')(x)
x = Dropout(0.50)(x)
x = Dense(128, activation='relu')(x)
x = Dropout(0.30)(x)
out = Dense(1, activation='sigmoid')(x)

model = Model(inputs=base.input, outputs=out)

METRICS = [
    tf.keras.metrics.Recall(name='recall'),
    tf.keras.metrics.Precision(name='precision'),
    tf.keras.metrics.AUC(name='auc'),
]

print("=" * 60)
print("Phase 1 — head only (VGG19 base frozen)")
print("=" * 60)

model.compile(optimizer=Adam(LR_PHASE1), loss='binary_crossentropy', metrics=METRICS)

cb_p1 = [
    ModelCheckpoint('best_phase1.h5', monitor='val_recall', save_best_only=True, mode='max', verbose=1),
    EarlyStopping(monitor='val_recall', patience=6, mode='max', restore_best_weights=True, verbose=1),
    ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=3, min_lr=1e-7, verbose=1),
]

model.fit(train_ds, epochs=PHASE1_EPOCHS, validation_data=val_ds, class_weight=class_weight, callbacks=cb_p1, verbose=1)

print("\n" + "=" * 60)
print("Phase 2 — unfreeze VGG19 block5 (last 8 layers), LR / 10")
print("=" * 60)

for layer in base.layers[-8:]:
    layer.trainable = True

model.compile(optimizer=Adam(LR_PHASE2), loss='binary_crossentropy', metrics=METRICS)

cb_p2 = [
    ModelCheckpoint('pneumonia_model.h5', monitor='val_recall', save_best_only=True, mode='max', verbose=1),
    EarlyStopping(monitor='val_recall', patience=5, mode='max', restore_best_weights=True, verbose=1),
    ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=2, min_lr=1e-8, verbose=1),
]

model.fit(train_ds, epochs=PHASE2_EPOCHS, validation_data=val_ds, class_weight=class_weight, callbacks=cb_p2, verbose=1)

print("\n" + "=" * 60)
print("Final evaluation — Mooney pediatric test set (held-out)")
print("=" * 60)
results = model.evaluate(test_ds, verbose=1)
for name, val in zip(model.metrics_names, results):
    print(f"  {name}: {val:.4f}")

model.save('pneumonia_model.h5')
print("\nSaved -> pneumonia_model.h5")
