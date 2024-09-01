const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto'); // For generating tokens
const ffmpeg = require('fluent-ffmpeg');

const app = express();
const port = 5000;
const usersFile = path.join(__dirname, 'users.json'); // Path to the user data file

// Middleware
app.use(cors());
app.use(express.static('uploads')); // Serve files from the 'uploads' folder
app.use(bodyParser.json()); // Middleware for parsing JSON request bodies

// Set the path to ffmpeg
ffmpeg.setFfmpegPath('C:\\Program Files\\ffmpeg-master-latest-win64-gpl\\bin\\ffmpeg.exe');

// Multer setup for handling MP4 file uploads
const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)), // Add a timestamp to prevent name collisions
});

const upload = multer({
  storage: uploadStorage,
  fileFilter: (req, file, cb) => {
    const fileExt = path.extname(file.originalname).toLowerCase();
    const mimeType = file.mimetype;
    cb(fileExt === '.mp4' && mimeType === 'video/mp4' ? null : new Error('Only .mp4 files are allowed'), true);
  },
});

// Multer setup for transcoding with no file type restriction
const transcodeStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)), // Add a timestamp to prevent name collisions
});

const transcode = multer({ storage: transcodeStorage });

// Helper function to handle file operations
const handleFileOperation = (operation, res, successMsg, errorMsg) => {
  operation((err) => {
    if (err) {
      console.error(errorMsg, err);
      return res.status(500).json({ message: errorMsg });
    }
    res.json(successMsg);
  });
};

// Endpoint for video uploads (only MP4)
app.post('/upload', upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Only .mp4 files are allowed' });
  }

  const token = req.body.sessionToken;
  if (!token) {
    return res.status(400).json({ message: 'Session token is required' });
  }

  const videoName = req.file.filename; // URL of the uploaded video

  fs.readFile(usersFile, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Server error' });

    const users = JSON.parse(data || '[]');
    const userIndex = users.findIndex(user => user.token === token);

    if (userIndex === -1) return res.status(401).json({ message: 'Invalid token' });

    users[userIndex].videos = [...(users[userIndex].videos || []), req.file.filename];

    fs.writeFile(usersFile, JSON.stringify(users), 'utf8', (err) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      res.json({ videoName });
    });
  });
});

// Endpoint for video transcoding (any file type)
app.post('/transcode', transcode.single('video'), (req, res) => {
  const token = req.body.sessionToken;
  if (!token) {
    return res.status(400).json({ message: 'Session token is required' });
  }

  const inputPath = path.join(__dirname, 'uploads', req.file.filename);
  const outputFilename = `${Date.now()}.mp4`;
  const outputPath = path.join(__dirname, 'uploads', outputFilename);

  ffmpeg(inputPath)
    .output(outputPath)
    .videoCodec('libx264')
    .on('end', () => {
      fs.unlink(inputPath, (err) => {
        if (err) console.error('Error deleting original video file:', err);
      });

      const videoName = outputFilename;

      fs.readFile(usersFile, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ message: 'Server error' });

        const users = JSON.parse(data || '[]');
        const userIndex = users.findIndex(user => user.token === token);

        if (userIndex === -1) return res.status(401).json({ message: 'Invalid token' });

        users[userIndex].videos = [...(users[userIndex].videos || []), outputFilename];

        fs.writeFile(usersFile, JSON.stringify(users), 'utf8', (err) => {
          if (err) return res.status(500).json({ message: 'Server error' });
          res.json({ videoName });
        });
      });
    })
    .on('error', (err) => {
      console.error('Error during transcoding:', err);
      res.status(500).json({ message: 'Transcoding failed' });
    })
    .run();
});

// Endpoint to list all videos
app.get('/api/videos', (req, res) => {
  const videosDir = path.join(__dirname, 'uploads');

  fs.readdir(videosDir, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return res.status(500).json({ error: 'Unable to scan directory' });
    }

    const videoFiles = files.filter(file => file.endsWith('.mp4') || file.endsWith('.webm'));
    res.json(videoFiles);
  });
});

// Endpoint to get videos uploaded by the current user
app.get('/api/myvideos', (req, res) => {
  const token = req.query.sessionToken;
  if (!token) {
    return res.status(400).json({ message: 'Session token is required' });
  }

  fs.readFile(usersFile, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Server error' });

    const users = JSON.parse(data || '[]');
    const user = users.find(user => user.token === token);

    if (!user) return res.status(401).json({ message: 'Invalid token' });

    res.json(user.videos || []);
  });
});

// Endpoint to delete a video
app.delete('/api/delete-video', (req, res) => {
  const { filename, sessionToken } = req.query;

  if (!filename || !sessionToken) {
    return res.status(400).json({ message: 'Filename and sessionToken are required' });
  }

  fs.readFile(usersFile, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Server error' });

    const users = JSON.parse(data || '[]');
    const user = users.find(user => user.token === sessionToken);

    if (!user) return res.status(401).json({ message: 'Invalid session token' });

    user.videos = user.videos.filter(video => video !== filename);

    fs.writeFile(usersFile, JSON.stringify(users), 'utf8', (err) => {
      if (err) return res.status(500).json({ message: 'Server error' });

      const filePath = path.join(__dirname, 'uploads', filename);
      fs.unlink(filePath, (err) => {
        if (err) return res.status(500).json({ message: 'Failed to delete video file' });
        res.json({ message: 'Video deleted successfully' });
      });
    });
  });
});

// Endpoint to register a new user
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  fs.readFile(usersFile, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Server error' });

    const users = JSON.parse(data || '[]');
    const existingUser = users.find(user => user.email === email);

    if (existingUser) return res.status(409).json({ message: 'Email already in use' });

    const token = crypto.randomBytes(16).toString('hex');
    const newUser = { email, password, token, videos: [] };
    users.push(newUser);

    fs.writeFile(usersFile, JSON.stringify(users), 'utf8', (err) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      res.json({ token });
    });
  });
});

// Endpoint to login an existing user
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  fs.readFile(usersFile, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ message: 'Server error' });

    const users = JSON.parse(data || '[]');
    const user = users.find(user => user.email === email && user.password === password);

    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const newToken = crypto.randomBytes(16).toString('hex');
    user.token = newToken;

    fs.writeFile(usersFile, JSON.stringify(users), 'utf8', (err) => {
      if (err) return res.status(500).json({ message: 'Server error' });
      res.json({ token: newToken });
    });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
