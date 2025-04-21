import React, { useState } from 'react';
import { UploadCloud, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [classificationResult, setClassificationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setClassificationResult(null);
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const res = await fetch('https://land-cover-classification-4.onrender.com/classify', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.error) {
        console.error('Error:', data.error);
        return;
      }
      setClassificationResult(data.result);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-emerald-100 via-sky-200 to-blue-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-8"
      >
        <div className="text-center space-y-2 mb-6">
          <h1 className="text-4xl font-extrabold text-blue-800 drop-shadow-sm">🌿 Land Cover Classifier</h1>
          <p className="text-gray-600">Upload satellite or aerial imagery and get accurate land cover classification.</p>
        </div>

        <div className="flex flex-col items-center">
          {!preview && (
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="p-6 bg-blue-100 rounded-full shadow-inner"
            >
              <UploadCloud className="w-14 h-14 text-blue-600" />
            </motion.div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="upload"
          />
          <label
            htmlFor="upload"
            className="mt-4 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 font-medium transition duration-300"
          >
            <UploadCloud className="w-5 h-5" /> Upload Image
          </label>
        </div>

        {preview && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-center mb-2">Preview:</h2>
            <img src={preview} alt="Selected" className="w-full rounded-xl shadow-lg border-2 border-blue-300" />
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !selectedFile}
          className="w-full mt-6 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition duration-300 disabled:opacity-50"
        >
          {loading ? 'Classifying...' : '🔍 Classify Land Cover'}
        </button>

        {classificationResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-center bg-green-50 p-4 rounded-xl border border-green-300 shadow-inner"
          >
            <div className="flex justify-center mb-2">
              <Sparkles className="w-6 h-6 text-green-500 animate-pulse" />
            </div>
            <h2 className="text-xl font-bold text-green-700">Classification Result</h2>
            <p className="text-lg mt-1 text-gray-700">{classificationResult}</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default App;
