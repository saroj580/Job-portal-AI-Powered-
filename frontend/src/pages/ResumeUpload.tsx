import { useState, DragEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '../api/axios';
import Alert from '../components/Alert';

export default function ResumeUpload() {
  const [file, setFile]         = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadedOk, setUploadedOk] = useState(false);
  const [error, setError]       = useState('');
  const navigate                = useNavigate();

  const validateAndSet = (f: File): void => {
    if (f.type !== 'application/pdf') {
      setError('Only PDF files are accepted.');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError('File size must be under 5 MB.');
      return;
    }
    setError('');
    setFile(f);
    setUploadedOk(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    if (e.dataTransfer.files[0]) validateAndSet(e.dataTransfer.files[0]);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files?.[0]) validateAndSet(e.target.files[0]);
  };

  const handleUpload = async (): Promise<void> => {
    if (!file) return;
    setUploading(true); setError('');
    const fd = new FormData();
    fd.append('resume', file);
    try {
      await api.post('/upload-resume', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadedOk(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async (): Promise<void> => {
    setAnalyzing(true); setError('');
    try {
      await api.post('/analyze-resume');
      navigate('/resume/analysis');
    } catch (err) {
      setError(getErrorMessage(err));
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Upload resume</h1>

      <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
        {/* Drop zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition ${
            file ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'
          }`}
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
        >
          <input
            id="resume-input"
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleChange}
          />
          <label htmlFor="resume-input" className="cursor-pointer block">
            <div className="text-5xl mb-3">📄</div>
            <p className="text-sm text-gray-500">
              {file ? (
                <span className="font-medium text-indigo-700">{file.name}</span>
              ) : (
                <>Click or drag a PDF here<br /><span className="text-xs">Max 5 MB</span></>
              )}
            </p>
          </label>
        </div>

        {error      && <Alert type="error"   message={error} />}
        {uploadedOk && <Alert type="success" message="Resume uploaded successfully!" />}

        <button
          onClick={handleUpload}
          disabled={!file || uploading || uploadedOk}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium transition"
        >
          {uploading ? 'Uploading…' : uploadedOk ? 'Uploaded ✓' : 'Upload resume'}
        </button>

        {uploadedOk && (
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 text-sm font-medium transition"
          >
            {analyzing ? 'Analyzing with AI…' : 'Analyze with AI ✨'}
          </button>
        )}
      </div>
    </div>
  );
}