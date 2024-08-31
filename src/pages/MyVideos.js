import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MyVideos = () => {
  const [videos, setVideos] = useState([]); // Ensure videos is initialized as an array
  const token = sessionStorage.getItem('sessionToken');

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/videos', {
          headers: { Authorization: token }
        });

        if (Array.isArray(response.data)) {
          setVideos(response.data);
        } else {
          console.error('Unexpected response format:', response.data);
          setVideos([]); // Reset to an empty array in case of unexpected data
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    fetchVideos();
  }, [token]);

  return (
    <div>
      <h2>My Videos</h2>
      {videos.length > 0 ? (
        <ul>
          {videos.map((video, index) => (
            <li key={index}>
              <video width="600" controls>
                <source src={`http://localhost:5000/${video}`} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </li>
          ))}
        </ul>
      ) : (
        <p>No videos uploaded yet.</p>
      )}
    </div>
  );
};

export default MyVideos;
