import React, { useState, useEffect } from 'react';
import { useNavigate  } from 'react-router-dom';
import "./myvideos.css";

const MyVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = sessionStorage.getItem('sessionToken');
  const navigate = useNavigate();

  useEffect(() => {

    if (!token) {
      navigate('/login');
      return;
    }
    
    const fetchMyVideos = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/myvideos?sessionToken=${token}`);
        if (!response.ok) {
          throw new Error('Error fetching videos');
        }
        const data = await response.json();
        setVideos(data);
      } catch (error) {
        console.error('Error fetching videos:', error);
        setError('Failed to load videos');
      } finally {
        setLoading(false);
      }
    };

    fetchMyVideos();
  }, [token]);

  const handleDelete = async (filename) => {
    try {
      const response = await fetch(`http://localhost:5000/api/delete-video?filename=${filename}&sessionToken=${token}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error deleting video');
      }
      const data = await response.json();
      console.log(data.message);
  
      // Update the state to remove the deleted video
      setVideos(videos.filter(video => video !== filename));
    } catch (error) {
      console.error('Error deleting video:', error);
      setError(error.message || 'Failed to delete video');
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="myVideosContainer">
      {videos.length === 0 ? (
        <p>No videos uploaded yet.</p>
      ) : (
        videos.map((video, index) => (
          <div key={index}>
            <video width="600" controls className='video'>
              <source src={`http://localhost:5000/${video}`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <button onClick={() => handleDelete(video)}>Delete</button>
          </div>
        ))
      )}
    </div>
  );
};

export default MyVideos;
