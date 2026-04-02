# OncoAI – AI Cancer Screening Assistant

OncoAI is a full-stack hackathon-ready medical AI web app with a professional dashboard-style UI, image upload pipeline, explainability placeholder, and downloadable PDF report.

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS + jsPDF
- **Backend:** FastAPI + TensorFlow + Pillow
- **AI:** Binary CNN classification (`224x224` RGB images)

## Project Structure

```text
oncoai/
├── backend/
│   ├── app/
│   │   └── main.py
│   ├── models/
│   │   └── model.h5 (generated automatically at runtime if missing)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── StatCard.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
├── requirements.txt
└── README.md
```

## Features

- Modern healthcare-style homepage with clean white/blue visual language.
- Upload MRI/skin scan images (`.jpg`, `.jpeg`, `.png`) with instant preview.
- `/predict` backend endpoint for AI inference.
- Prediction output includes:
  - Cancer Detected / No Cancer Detected
  - Confidence score (%)
  - Risk level (Low/Medium/High)
- AI explainability section with Grad-CAM placeholder.
- Doctor dashboard cards + recent prediction table.
- PDF report generation and auto-download from frontend.
- Loading animation and alert styles.
- Deployment-ready layout for Render/Vercel-style workflows.

## Run Locally

### 1) Backend (FastAPI)

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

API URL: `http://localhost:8000`

### 2) Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

Optional environment variable:

```bash
# frontend/.env
VITE_API_URL=http://localhost:8000
```

## Deployment Notes

- **Backend:** Deploy `backend/` on Render as a Python Web Service with start command:
  `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
- **Frontend:** Deploy `frontend/` on Vercel (build command `npm run build`, output `dist`).
- Ensure CORS policy is restricted to production domains before real clinical usage.

## Medical Disclaimer

This AI tool assists screening and does not replace doctors.

## Important

This implementation is for demo/hackathon use only. Use a validated medical dataset, calibrated model, and proper compliance controls before any real-world clinical workflow.
