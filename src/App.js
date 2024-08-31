import React from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import MyVideos from './pages/MyVideos';
import { Route, Routes } from "react-router-dom";
import Navbar from './Navbar';
import VideoUploader from './pages/VideoUploader';
import Footer from './Footer';
import Register from './pages/Register';

function App() {
  return (
    <>
      <Navbar />
      <div className="background">
      <body>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/myvideos" element={<MyVideos />} />
          <Route path="/videouploader" element={<VideoUploader />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
      </body>
      </div>
      <Footer />
    </>
  );
}

export default App;