import { Routes, Route, Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import { useMemo, useState } from 'react';
import Navbar from './components/Navbar';
import StatCard from './components/StatCard';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

function Home() {
  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-2 md:items-center">
      <div>
        <h2 className="text-4xl font-extrabold tracking-tight text-slate-800">
          OncoAI – AI Cancer Screening Assistant
        </h2>
        <p className="mt-4 text-slate-600">
          A modern medical AI dashboard that helps clinicians triage MRI and skin scans with explainable, confidence-scored predictions.
        </p>
        <Link
          to="/upload"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          Start Screening
        </Link>
      </div>
      <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-md">
        <h3 className="text-lg font-semibold text-blue-700">Clinical-Ready Demo Highlights</h3>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-600">
          <li>Fast AI inference using TensorFlow CNN (224x224 input)</li>
          <li>Explainability panel with Grad-CAM style overlay placeholder</li>
          <li>Doctor dashboard and downloadable PDF report</li>
        </ul>
      </div>
    </section>
  );
}

function Upload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const riskColor = useMemo(() => {
    if (!result) return 'bg-slate-300';
    if (result.risk_level === 'High') return 'bg-red-500';
    if (result.risk_level === 'Medium') return 'bg-amber-500';
    return 'bg-emerald-500';
  }, [result]);

  const handleFile = (event) => {
    const selected = event.target.files?.[0];
    setResult(null);
    setError('');

    if (!selected) return;
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(selected.type)) {
      setError('Please upload a JPG, JPEG, or PNG image.');
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handlePredict = async () => {
    if (!file) {
      setError('Please upload an image first.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Prediction failed.');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'Unable to connect to the backend service.');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = () => {
    if (!result) return;

    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('OncoAI Medical Screening Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Result: ${result.result}`, 20, 40);
    doc.text(`Confidence: ${result.confidence_score.toFixed(2)}%`, 20, 50);
    doc.text(`Risk Level: ${result.risk_level}`, 20, 60);
    doc.text('Disclaimer: This AI tool assists screening and does not replace doctors.', 20, 80, {
      maxWidth: 170
    });
    doc.save('oncoai-medical-report.pdf');
  };

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <h2 className="text-3xl font-bold text-slate-800">Upload Scan</h2>
      <p className="mt-2 text-sm text-slate-500">Supports MRI and skin images (.jpg, .jpeg, .png).</p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <input type="file" accept=".jpg,.jpeg,.png" onChange={handleFile} className="w-full" />
          {preview && <img src={preview} alt="Uploaded preview" className="mt-4 h-64 w-full rounded-lg object-cover" />}
          <button
            onClick={handlePredict}
            disabled={loading}
            className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {loading ? 'Analyzing…' : 'Run AI Prediction'}
          </button>
          {loading && <div className="loading-pulse mt-3 text-sm text-blue-600">Processing image with AI model...</div>}
          {error && <p className="mt-3 rounded-md bg-red-50 p-2 text-sm text-red-600">{error}</p>}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800">AI Result</h3>
          {!result ? (
            <p className="mt-2 text-slate-500">Prediction details will appear here.</p>
          ) : (
            <div className="mt-4 space-y-3">
              <p className="rounded-md bg-blue-50 p-3 font-medium text-blue-700">{result.result}</p>
              <p>Confidence Score: <strong>{result.confidence_score.toFixed(2)}%</strong></p>
              <p>Risk Level: <strong>{result.risk_level}</strong></p>
              <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                <div className={`h-full ${riskColor}`} style={{ width: `${result.confidence_score}%` }} />
              </div>
              <p className="rounded-md bg-amber-50 p-3 text-xs text-amber-700">
                This AI tool assists screening and does not replace doctors.
              </p>
              <button
                onClick={generateReport}
                className="rounded-lg bg-slate-800 px-4 py-2 text-white transition hover:bg-slate-900"
              >
                Generate Medical Report
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800">AI Explainability</h3>
        <p className="mt-2 text-slate-600">AI focuses on abnormal tissue regions.</p>
        <div className="mt-4 grid h-48 place-items-center rounded-lg border border-dashed border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 text-sm text-blue-700">
          Grad-CAM Heatmap Placeholder
        </div>
      </div>
    </section>
  );
}

function Dashboard() {
  const rows = [
    { id: 'P-1001', result: 'Cancer Detected', confidence: '93.4%', risk: 'High' },
    { id: 'P-1002', result: 'No Cancer Detected', confidence: '84.1%', risk: 'Low' },
    { id: 'P-1003', result: 'Cancer Detected', confidence: '75.2%', risk: 'Medium' }
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <h2 className="text-3xl font-bold text-slate-800">Doctor Dashboard</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <StatCard label="Total Scans" value="128" sub="Last 30 days" />
        <StatCard label="Cancer Detected" value="46" sub="Flagged for review" />
        <StatCard label="Healthy Cases" value="82" sub="No malignant signs" />
        <StatCard label="Accuracy Score" value="94.8%" sub="Validation benchmark" />
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800">Recent Patient Predictions</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2">Patient ID</th>
                <th className="py-2">Result</th>
                <th className="py-2">Confidence</th>
                <th className="py-2">Risk</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-slate-100">
                  <td className="py-2 font-medium">{row.id}</td>
                  <td className="py-2">{row.result}</td>
                  <td className="py-2">{row.confidence}</td>
                  <td className="py-2">{row.risk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-10">
      <h2 className="text-3xl font-bold text-slate-800">About OncoAI</h2>
      <p className="mt-4 text-slate-600">
        OncoAI is a hackathon-ready AI screening assistant integrating a TensorFlow model, clinical-style insights, and downloadable reports to support early cancer triage workflows.
      </p>
    </section>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  );
}
