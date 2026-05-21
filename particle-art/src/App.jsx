import { useEffect, useRef, useState, useCallback } from 'react'
import { io } from 'socket.io-client'
import { v4 as uuidv4 } from 'uuid'
import './App.css'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

function App() {
  const canvasRef = useRef(null)
  const socketRef = useRef(null)
  const particlesRef = useRef([])
  const animationFrameRef = useRef(null)
  const mouseRef = useRef({ x: 0, y: 0, isDown: false })
  const userRef = useRef({ id: null, name: '', color: '' })
  const [isConnected, setIsConnected] = useState(false)
  const [userCount, setUserCount] = useState(0)
  const [showSettings, setShowSettings] = useState(true)
  const [username, setUsername] = useState('')
  const [particleColor, setParticleColor] = useState('#ff6b6b')
  const [particleSize, setParticleSize] = useState(5)
  const [particleType, setParticleType] = useState('circle')

  // Initialize socket connection
  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    })

    socketRef.current.on('connect', () => {
      console.log('Connected to server')
      setIsConnected(true)
      
      // Join with user data
      socketRef.current.emit('join', {
        name: username || `User_${socketRef.current.id.slice(0, 4)}`,
        color: particleColor
      })
      
      userRef.current.id = socketRef.current.id
    })

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from server')
      setIsConnected(false)
    })

    socketRef.current.on('init', ({ users, particles }) => {
      console.log('Received initial state')
      particlesRef.current = particles
      setUserCount(users.length)
    })

    socketRef.current.on('userJoined', (user) => {
      console.log('User joined:', user.name)
      setUserCount(prev => prev + 1)
    })

    socketRef.current.on('userLeft', ({ userId, particleIds }) => {
      console.log('User left:', userId)
      setUserCount(prev => Math.max(0, prev - 1))
      // Remove particles from departed user
      particlesRef.current = particlesRef.current.filter(
        p => !particleIds.includes(p.id)
      )
    })

    socketRef.current.on('particleCreated', (particle) => {
      particlesRef.current.push(particle)
    })

    socketRef.current.on('particleUpdated', (updatedParticle) => {
      const index = particlesRef.current.findIndex(p => p.id === updatedParticle.id)
      if (index !== -1) {
        particlesRef.current[index] = updatedParticle
      }
    })

    socketRef.current.on('particleMoved', (data) => {
      const index = particlesRef.current.findIndex(p => p.id === data.id)
      if (index !== -1) {
        particlesRef.current[index] = { ...particlesRef.current[index], ...data }
      }
    })

    socketRef.current.on('particleDeleted', (particleId) => {
      particlesRef.current = particlesRef.current.filter(p => p.id !== particleId)
    })

    return () => {
      socketRef.current.disconnect()
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  // Canvas setup and animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 20, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw all particles
      particlesRef.current.forEach(particle => {
        ctx.beginPath()
        
        if (particle.type === 'circle') {
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        } else if (particle.type === 'square') {
          ctx.rect(
            particle.x - particle.size,
            particle.y - particle.size,
            particle.size * 2,
            particle.size * 2
          )
        } else if (particle.type === 'triangle') {
          ctx.moveTo(particle.x, particle.y - particle.size)
          ctx.lineTo(particle.x + particle.size, particle.y + particle.size)
          ctx.lineTo(particle.x - particle.size, particle.y + particle.size)
          ctx.closePath()
        } else if (particle.type === 'star') {
          const spikes = 5
          const outerRadius = particle.size
          const innerRadius = particle.size / 2
          let rot = Math.PI / 2 * 3
          let cx = particle.x
          let cy = particle.y
          const step = Math.PI / spikes

          ctx.moveTo(cx, cy - outerRadius)
          for (let i = 0; i < spikes; i++) {
            cx = particle.x + Math.cos(rot) * outerRadius
            cy = particle.y + Math.sin(rot) * outerRadius
            ctx.lineTo(cx, cy)
            rot += step

            cx = particle.x + Math.cos(rot) * innerRadius
            cy = particle.y + Math.sin(rot) * innerRadius
            ctx.lineTo(cx, cy)
            rot += step
          }
          ctx.lineTo(particle.x, particle.y - outerRadius)
          ctx.closePath()
        }

        ctx.fillStyle = particle.color
        ctx.fill()
        
        // Add glow effect
        ctx.shadowBlur = 15
        ctx.shadowColor = particle.color
      })

      ctx.shadowBlur = 0
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  const handleMouseDown = useCallback((e) => {
    mouseRef.current.isDown = true
    createParticle(e.clientX, e.clientY)
  }, [particleColor, particleSize, particleType])

  const handleMouseMove = useCallback((e) => {
    mouseRef.current.x = e.clientX
    mouseRef.current.y = e.clientY
    
    if (mouseRef.current.isDown) {
      createParticle(e.clientX, e.clientY)
    }
  }, [particleColor, particleSize, particleType])

  const handleMouseUp = useCallback(() => {
    mouseRef.current.isDown = false
  }, [])

  const createParticle = useCallback((x, y) => {
    const particle = {
      id: uuidv4(),
      x: x + (Math.random() - 0.5) * 20,
      y: y + (Math.random() - 0.5) * 20,
      size: particleSize + (Math.random() - 0.5) * 2,
      color: particleColor,
      type: particleType,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      life: 1.0
    }

    particlesRef.current.push(particle)
    
    // Emit to server
    socketRef.current.emit('createParticle', particle)

    // Update particle physics locally
    setTimeout(() => {
      particle.x += particle.vx
      particle.y += particle.vy
      particle.life -= 0.01
      
      if (particle.life > 0) {
        socketRef.current.emit('updateParticle', particle)
      } else {
        socketRef.current.emit('deleteParticle', particle.id)
        particlesRef.current = particlesRef.current.filter(p => p.id !== particle.id)
      }
    }, 50)
  }, [particleColor, particleSize, particleType])

  const clearCanvas = () => {
    particlesRef.current = []
    socketRef.current.emit('deleteParticle', 'all')
  }

  return (
    <div className="app">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={(e) => {
          const touch = e.touches[0]
          handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY })
        }}
        onTouchMove={(e) => {
          const touch = e.touches[0]
          handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY })
        }}
        onTouchEnd={handleMouseUp}
      />
      
      <div className="ui-overlay">
        <div className="status-bar">
          <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '● Connected' : '○ Disconnected'}
          </div>
          <div className="user-count">
            🎨 {userCount} artist{userCount !== 1 ? 's' : ''} online
          </div>
        </div>

        <button 
          className="settings-toggle"
          onClick={() => setShowSettings(!showSettings)}
        >
          {showSettings ? '✕' : '⚙️'}
        </button>

        {showSettings && (
          <div className="settings-panel">
            <h2>🎨 Particle Art Studio</h2>
            <p>Create living art together!</p>
            
            <div className="setting-group">
              <label>Your Name:</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name"
                maxLength={20}
              />
            </div>

            <div className="setting-group">
              <label>Particle Color:</label>
              <input
                type="color"
                value={particleColor}
                onChange={(e) => setParticleColor(e.target.value)}
              />
              <span>{particleColor}</span>
            </div>

            <div className="setting-group">
              <label>Size: {particleSize}px</label>
              <input
                type="range"
                min="2"
                max="20"
                value={particleSize}
                onChange={(e) => setParticleSize(Number(e.target.value))}
              />
            </div>

            <div className="setting-group">
              <label>Shape:</label>
              <div className="shape-selector">
                {['circle', 'square', 'triangle', 'star'].map(shape => (
                  <button
                    key={shape}
                    className={`shape-btn ${particleType === shape ? 'active' : ''}`}
                    onClick={() => setParticleType(shape)}
                  >
                    {shape === 'circle' && '⭕'}
                    {shape === 'square' && '⬜'}
                    {shape === 'triangle' && '🔺'}
                    {shape === 'star' && '⭐'}
                  </button>
                ))}
              </div>
            </div>

            <div className="instructions">
              <h3>How to use:</h3>
              <ul>
                <li>Click or drag to create particles</li>
                <li>Watch them come alive with motion</li>
                <li>See other artists' creations in real-time</li>
                <li>Experiment with colors and shapes!</li>
              </ul>
            </div>

            <button className="clear-btn" onClick={clearCanvas}>
              🗑️ Clear Canvas
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
