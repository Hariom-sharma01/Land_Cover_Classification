import React, { useState } from 'react';
import { Upload } from 'lucide-react';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [classificationResult, setClassificationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
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

      const data = await res.json(); // Get the JSON response containing classification result

      if (data.error) {
        console.error('Error:', data.error);
        return;
      }

      // Set the classification result from the response
      setClassificationResult(data.result);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-200 to-blue-300 flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-6 drop-shadow-md">Land Cover Classification</h1>

      <div className="bg-white shadow-2xl rounded-2xl p-6 w-full max-w-xl text-center">
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange} 
          className="hidden" 
          id="upload"
        />
        <label htmlFor="upload" className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl shadow-lg flex items-center justify-center gap-2">
          <Upload className="w-5 h-5" /> Upload Image
        </label>

        {preview && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Preview:</h2>
            <img src={preview} alt="Selected" className="w-full rounded-lg shadow-lg" />
          </div>
        )}

        <button 
          onClick={handleSubmit}
          disabled={loading || !selectedFile}
          className="mt-6 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold shadow-md disabled:opacity-50"
        >
          {loading ? 'Classifying...' : 'Classify Land Cover'}
        </button>

        {classificationResult && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Classification Result:</h2>
            <p className="text-lg font-medium text-green-600">{classificationResult}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
