const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto'); // For generating tokens

const app = express();
const port = 5000;
const usersFile = path.join(__dirname, 'users.json'); // Path to the user data file

app.use(cors());
app.use(express.static('uploads')); // Serve files from the 'uploads' folder
app.use(bodyParser.json()); // Middleware for parsing JSON request bodies

// Multer setup for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Add a timestamp to prevent name collisions
  },
});

const upload = multer({ storage });

// Endpoint for video uploads
app.post('/upload', upload.single('video'), (req, res) => {
  const videoUrl = `http://localhost:5000/${req.file.filename}`; // Fixed syntax error with template literals
  res.json({ videoUrl });
});

// Endpoint to list all videos
app.get('/api/videos', (req, res) => {
  const videosDir = path.join(__dirname, 'uploads');

  // Read all files in the uploads directory
  fs.readdir(videosDir, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return res.status(500).json({ error: 'Unable to scan directory' });
    }

    // Filter for video files (e.g., .mp4, .webm)
    const videoFiles = files.filter(file => file.endsWith('.mp4') || file.endsWith('.webm'));
    console.log('Video files found:', videoFiles);

    res.json(videoFiles);
  });
});

// Endpoint to register a new user
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  fs.readFile(usersFile, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Server error' });
    }

    const users = JSON.parse(data || '[]');
    const existingUser = users.find(user => user.email === email);

    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    // Generate an initial token (for simplicity, we use a random token here)
    const token = crypto.randomBytes(16).toString('hex');
    users.push({ email, password, token });
    fs.writeFile(usersFile, JSON.stringify(users), 'utf8', (err) => {
      if (err) {
        return res.status(500).json({ message: 'Server error' });
      }
      res.status(201).json({ message: 'User registered successfully' });
    });
  });
});

// Endpoint to login a user
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  fs.readFile(usersFile, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ message: 'Server error' });
    }

    const users = JSON.parse(data || '[]');
    const user = users.find(user => user.email === email && user.password === password);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate a new token
    const token = crypto.randomBytes(16).toString('hex');
    user.token = token; // Update the token
    fs.writeFile(usersFile, JSON.stringify(users), 'utf8', (err) => {
      if (err) {
        return res.status(500).json({ message: 'Server error' });
      }
      res.json({ token });
    });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`); // Fixed template literal syntax
});
