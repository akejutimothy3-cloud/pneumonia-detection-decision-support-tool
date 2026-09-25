Pneumonia Detection Decision-Support Tool

An AI-powered chest X-ray analysis system built as a Decision-Support Tool for clinicians in areas with limited radiological expertise. The system uses a VGG19 deep learning model trained via Transfer Learning on the Paul Mooney Chest X-Ray Pneumonia dataset.

⚠️ Disclaimer: This is a Decision-Support Tool. All results must be reviewed by a qualified medical professional before any clinical decision is made. This system does not replace professional radiological diagnosis.
Project Structure
pneumonia-detection-decision-support-tool/
├── training/
│   └── train_pneumonia_model.py        # GPU training script (Kaggle/Colab)
├── backend/
│   ├── app.py                          # Flask REST API
│   ├── requirements.txt                # Python dependencies
│   └── models/
│       └── pneumonia_model.h5          # Trained model weights (after training)
├── frontend/                           # React.js dashboard
│   ├── src/
│   │   ├── App.jsx                     # Main application component
│   │   └── components/
│   │       ├── Header.jsx              # Navigation header
│   │       ├── UploadSection.jsx       # X-ray upload interface
│   │       └── ResultsPanel.jsx        # Analysis results display
│   └── ...
└── README.md
Phase 1 — Data Engineering
Adult-Focused Dataset
Source: COVID-19 Radiography Database (Adult-Focused)
Classes: NORMAL / VIRAL PNEUMONIA (binary classification)
Splits: Automatic 80/20 train-validation split
Preprocessing
Standardization: All images resized to 224×224 pixels
Normalization: Pixel intensity scaled to [0, 1]
Augmentation (training only):
Rotation: ±15°
Zoom: 15%
Horizontal flip
Width/Height shift: 10%
Brightness variation: 80–120%
Phase 2 — Comparative Study
Architecture: VGG19 (Transfer Learning)

The model uses VGG19 pre-trained on ImageNet as a frozen feature extractor, with a custom classification head:

VGG19 Base (frozen) → GlobalAveragePooling2D → BatchNorm → Dense(512) → Dropout(0.5) → BatchNorm → Dense(256) → Dropout(0.3) → Dense(1, sigmoid)
Configuration 1 — Baseline
Loss: Standard Binary Cross-Entropy
Purpose: Establish baseline performance without addressing class imbalance
Configuration 2 — Optimized
Loss: Class-Weighted Binary Cross-Entropy
Class Weights: Computed using sklearn.utils.class_weight.compute_class_weight('balanced')
Purpose: Address the data imbalance in the Kaggle dataset
Primary Metric: Recall

The system is optimized for Recall to ensure it minimizes false negatives — a missed pneumonia case is far more dangerous than a false alarm in a clinical setting.
Phase 3 — Decision-Support Deployment
Backend (Flask API)
cd backend
pip install -r requirements.txt
python app.py
Endpoints:
Method	Endpoint	Description
GET	/	Health check
POST	/predict	Upload X-ray image for analysis
GET	/model-info	Model metadata and configuration
Frontend (React.js)
cd frontend
npm install
npm run dev
Tech Stack
Component	Technology
Deep Learning	TensorFlow / Keras
Model Architecture	VGG19 (Transfer Learning)
Training Environment	Kaggle / Google Colab (Tesla T4 GPU)
Backend API	Python Flask
Frontend	React.js (Vite)
Dataset	Paul Mooney Chest X-Ray Pneumonia
License

This project is for academic and research purposes. The trained model should not be used as a standalone diagnostic tool in any clinical setting.
