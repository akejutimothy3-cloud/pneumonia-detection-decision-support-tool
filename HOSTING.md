Hosting Guide: Pneumonia Detection Tool

This project consists of two parts that require different hosting environments due to the machine learning model's size.

1. Frontend (React/Vite) → Vercel

Vercel is the best choice for the frontend.

Steps:
1.Go to Vercel and log in with GitHub.
2.Click "New Project" and import your pneumonia-detection- repository.
3.Crucial Step: In the "Project Settings", find the Root Directory field and set it to frontend.
4.The "Framework Preset" should automatically detect Vite.
5.Click Deploy.

2. Backend (Flask/TensorFlow) → Render.com (Recommended)

Vercel has a 250MB limit for serverless functions. Since the VGG19 model is ~187MB and TensorFlow is ~500MB, the backend will not fit on Vercel.

Render.com is a great free/low-cost alternative that supports long-running Python servers.

Steps:
1.Log in to Render.com.
2.Click "New" → "Web Service".
3.Connect your GitHub repository.
4.Settings:
 •Root Directory: backend
 •Runtime: Python 3
 •Build Command: pip install -r requirements.txt
 •Start Command: gunicorn app:app
5.Select the "Starter" plan (Machine learning usually needs at least 512MB-1GB RAM).

3. Connecting them together

Once your backend is live on Render, you will get a URL (e.g., https://pneumonia-api.onrender.com).

1.Open frontend/src/App.jsx.
2.Update the fetch URL in the handleAnalyze function:

    // Change this line:
    const response = await fetch('http://localhost:5001/predict', { ... })
    
    // To your new live URL:
    const response = await fetch('https://your-api-name.onrender.com/predict', { ... })
    
3.Commit and push this change to GitHub. Vercel will automatically redeploy the frontend.
