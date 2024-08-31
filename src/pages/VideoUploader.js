// src/components/VideoUploader.js
import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import "./videouploader.css";

const VideoUploader = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const token = sessionStorage.getItem('sessionToken');
  const fileInputRef = useRef(null);

  if (!token) {
    return <Navigate to="/login" />;
  }

  const onFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile ? selectedFile.name : '');
    setVideoUrl(''); // Reset the video URL when a new file is selected
  };

  const onUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('video', file);
    formData.append('sessionToken', token);
    try {
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Assuming the response contains the URL of the uploaded video
      setVideoUrl(response.data.videoUrl);
    } catch (error) {
      console.error('Error uploading video:', error);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className='vuContainer'>
      <input
        type="file"
        accept="video/*"
        onChange={onFileChange}
        ref={fileInputRef}
        style={{ display: 'none' }} // Hide the default file input
      />
      <button onClick={handleButtonClick}>Choose Video</button>
      <button onClick={onUpload}>Upload Video</button>
      {fileName && <p>Selected File: {fileName}</p>}
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