import React, { useState, useEffect } from 'react';
import "./home.css";

const Home = () => {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    // Fetch video filenames from the correct backend endpoint
    fetch('http://localhost:5000/api/videos')
      .then((response) => response.json())
      .then((data) => setVideos(data))
      .catch((error) => console.error('Error fetching videos:', error));
  }, []);

  return (
    <div className="container">
      {videos.map((video, index) => (
        <div key={index}>
          <video width="600" controls className='video'>
            <source src={`http://localhost:5000/${video}`} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      ))}
    </div>
  );
};

export default Home;