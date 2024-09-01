import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './transcodevideo.css';

const TranscodeVideo = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  
  const navigate = useNavigate();
  const token = sessionStorage.getItem('sessionToken');
  const fileInputRef = useRef(null);
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

  if (!token) {
    navigate('/login');
    return null;
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile ? selectedFile.name : '');
    setVideoUrl('');
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
      const response = await fetch(`${apiBaseUrl}/transcode`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to transcode video');
      }

      setVideoUrl(`${apiBaseUrl}/${data.videoName}`);
      alert('Video transcoded and uploaded successfully!');
    } catch (error) {
      console.error('Error transcoding video:', error);
      setError('Failed to transcode video');
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="transcodeVideoContainer">
      <input
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />
      <button onClick={handleButtonClick}>Choose Video</button>
      <button onClick={handleUpload} disabled={loading}>
        {loading ? 'Transcoding...' : 'Transcode'}
      </button>
      {fileName && <p>Selected File: {fileName}</p>}
      {error && <p className="error">{error}</p>}
      {videoUrl && (
        <div>
          <video width="600" controls>
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
};

export default TranscodeVideo;
