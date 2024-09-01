import React, { useState, useEffect } from 'react';
import "./home.css";

const Home = () => {
  const [videos, setVideos] = useState([]);
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    // Fetch video filenames from the correct backend endpoint
    const fetchVideos = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/videos`);
        if (!response.ok) {
          throw new Error('Failed to fetch videos');
        }
        const data = await response.json();
        setVideos(data);
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    fetchVideos();
  }, [apiBaseUrl]);

  return (
    <div className="container">
      {videos.length === 0 ? (
        <p>No videos available</p> // Message to display when there are no videos
      ) : (
        videos.map((video, index) => (
          <div key={index}>
            <video width="600" controls className='video'>
              <source src={`${apiBaseUrl}/${video}`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        ))
      )}
    </div>
  );
};

export default Home;
