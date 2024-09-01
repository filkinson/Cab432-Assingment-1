import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import './videouploader.css';

const VideoUploader = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const token = sessionStorage.getItem('sessionToken');
  const fileInputRef = useRef(null);
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

  if (!token) {
    return <Navigate to="/login" />;
  }

  const onFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile ? selectedFile.name : '');
    setVideoUrl('');
    setError('');
  };

  const onUpload = async () => {
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
      const response = await axios.post(`${apiBaseUrl}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.status !== 200) {
        throw new Error(response.data.message || 'Failed to upload video');
      }

      setVideoUrl(`${apiBaseUrl}/${response.data.videoName}`);
      alert('Video uploaded successfully!');
    } catch (error) {
      console.error('Error uploading video:', error);
      setError('Failed to upload video');
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="vuContainer">
      <p>This uploader only accepts .mp4 files. For other files, use the video transcoder.</p>
      <input
        type="file"
        accept="video/mp4"
        onChange={onFileChange}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />
      <button onClick={handleButtonClick}>Choose Video</button>
      <button onClick={onUpload} disabled={loading}>
        {loading ? 'Uploading...' : 'Upload'}
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

export default VideoUploader;
