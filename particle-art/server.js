import { createServer } from 'http';
import { Server } from 'socket.io';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

// Serve static files from the React build
app.use(express.static(path.join(__dirname, 'dist')));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store active users and their particles
const users = new Map();
const particles = [];

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Send current state to new user
  socket.emit('init', {
    users: Array.from(users.values()),
    particles: particles
  });

  socket.on('join', (userData) => {
    const user = {
      id: socket.id,
      name: userData.name || `User_${socket.id.slice(0, 4)}`,
      color: userData.color || `hsl(${Math.random() * 360}, 70%, 50%)`
    };
    
    users.set(socket.id, user);
    io.emit('userJoined', user);
    console.log('User joined:', user.name);
  });

  socket.on('particleUpdate', (data) => {
    // Broadcast particle movement to all other users
    socket.broadcast.emit('particleMoved', {
      userId: socket.id,
      ...data
    });
  });

  socket.on('createParticle', (particleData) => {
    const particle = {
      id: `${socket.id}-${Date.now()}`,
      userId: socket.id,
      ...particleData
    };
    particles.push(particle);
    io.emit('particleCreated', particle);
  });

  socket.on('updateParticle', (data) => {
    const particleIndex = particles.findIndex(p => p.id === data.id);
    if (particleIndex !== -1) {
      particles[particleIndex] = { ...particles[particleIndex], ...data };
      io.emit('particleUpdated', particles[particleIndex]);
    }
  });

  socket.on('deleteParticle', (particleId) => {
    const index = particles.findIndex(p => p.id === particleId);
    if (index !== -1) {
      particles.splice(index, 1);
      io.emit('particleDeleted', particleId);
    }
  });

  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      users.delete(socket.id);
      // Remove all particles belonging to this user
      const userParticles = particles.filter(p => p.userId === socket.id);
      userParticles.forEach(p => {
        const index = particles.indexOf(p);
        if (index !== -1) {
          particles.splice(index, 1);
        }
      });
      
      io.emit('userLeft', {
        userId: socket.id,
        particleIds: userParticles.map(p => p.id)
      });
      console.log('User disconnected:', user.name);
    }
  });
});

// Handle React routing for production - skip API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/socket.io')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
