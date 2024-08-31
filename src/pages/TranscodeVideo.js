import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './transcodevideo.css';

const TranscodeVideo = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = sessionStorage.getItem('sessionToken');

  if (!token) {
    navigate('/login');
    return null;
  }

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('video', file);
    formData.append('sessionToken', token);

    try {
      const response = await fetch('http://localhost:5000/transcode', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload video');
      }

      alert('Video transcoded and uploaded successfully!');
      navigate('/myvideos');
    } catch (error) {
      console.error('Error uploading video:', error);
      setError('Failed to upload video');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transcodeVideoContainer">
      <h1>Transcode and Upload Video</h1>
      <input type="file" accept="video/*" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? 'Uploading...' : 'Upload'}
      </button>
      {error && <p>{error}</p>}
    </div>
  );
};

export default TranscodeVideo;
