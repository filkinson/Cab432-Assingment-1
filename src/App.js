import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import MyVideos from './pages/MyVideos';
import VideoUploader from './pages/VideoUploader';
import Footer from './Footer';
import Register from './pages/Register';
import TranscodeVideo from './pages/TranscodeVideo';
import Navbar from './Navbar';

function App() {
  return (
    <>
      <Navbar />
      <div className="background">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/myvideos" element={<MyVideos />} />
          <Route path="/videouploader" element={<VideoUploader />} />
          <Route path="/transcodevideo" element={<TranscodeVideo />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
      <Footer />
    </>
  );
}

export default App;
