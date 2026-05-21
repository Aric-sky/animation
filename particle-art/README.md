# 🎨 Particle Art Studio - Collaborative Living Particle Art

A real-time collaborative particle art application built with React, Vite, and Socket.IO. Create beautiful living particle art together with others in real-time!

## Features

- **Real-time Collaboration**: Multiple users can create art together simultaneously
- **Living Particles**: Particles move and evolve over time
- **Multiple Shapes**: Choose from circles, squares, triangles, and stars
- **Customizable Colors**: Pick any color for your particles
- **Adjustable Size**: Control the size of your particles
- **Glow Effects**: Beautiful glow effects make particles come alive
- **Responsive Design**: Works on desktop and mobile devices
- **User Tracking**: See how many artists are online

## Tech Stack

- **Frontend**: React 19 + Vite
- **Backend**: Node.js with Express and Socket.IO
- **Styling**: Custom CSS with glassmorphism effects
- **Real-time Communication**: Socket.IO for WebSocket connections

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository or navigate to the project directory:
```bash
cd particle-art
```

2. Install dependencies:
```bash
npm install
```

### Development Mode

Run the frontend development server:
```bash
npm run dev
```

In a separate terminal, run the backend server:
```bash
npm run server
```

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:3001`.

### Production Mode

Build and run for production:
```bash
npm run start
```

This will build the React app and serve it along with the Socket.IO server on port 3001.

## How to Use

1. Open the application in your browser
2. Enter your name (optional)
3. Choose your particle color using the color picker
4. Adjust the particle size with the slider
5. Select a shape (circle, square, triangle, or star)
6. Click or drag on the canvas to create particles
7. Watch as your particles come alive with motion!
8. See other users' creations in real-time

## Controls

- **Click**: Create a single particle
- **Drag**: Create a stream of particles
- **Settings Panel**: Toggle visibility with the gear icon
- **Clear Canvas**: Remove all particles

## Project Structure

```
particle-art/
├── src/
│   ├── App.jsx          # Main React component
│   ├── App.css          # Component styles
│   ├── index.css        # Global styles
│   └── main.jsx         # Entry point
├── server.js            # Socket.IO backend server
├── package.json         # Dependencies and scripts
└── vite.config.js       # Vite configuration
```

## Real-time Events

The application uses Socket.IO for real-time communication:

- `join`: User joins the session
- `createParticle`: New particle created
- `updateParticle`: Particle position/state updated
- `deleteParticle`: Particle removed
- `userJoined`: Notification when user joins
- `userLeft`: Notification when user leaves

## License

MIT License - feel free to use this project for learning or building upon!

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

---

Created with ❤️ using React, Vite, and Socket.IO
