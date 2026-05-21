import { useState, useRef } from 'react'

function App() {
  const [image, setImage] = useState(null)
  const [voxelData, setVoxelData] = useState([])
  const [resolution, setResolution] = useState(32)
  const [depth, setDepth] = useState(10)
  const canvasRef = useRef(null)

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          setImage(img)
          processImage(img)
        }
        img.src = event.target.result
      }
      reader.readAsDataURL(file)
    }
  }

  const processImage = (img) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = resolution
    canvas.height = resolution

    ctx.drawImage(img, 0, 0, resolution, resolution)
    const imageData = ctx.getImageData(0, 0, resolution, resolution)
    const pixels = imageData.data

    const voxels = []
    for (let y = 0; y < resolution; y++) {
      for (let x = 0; x < resolution; x++) {
        const i = (y * resolution + x) * 4
        const r = pixels[i]
        const g = pixels[i + 1]
        const b = pixels[i + 2]
        const a = pixels[i + 3]

        if (a > 128) {
          const brightness = (r + g + b) / 3
          const voxelHeight = Math.floor((brightness / 255) * depth) + 1

          voxels.push({
            x,
            y: resolution - y - 1,
            z: voxelHeight,
            color: `rgb(${r},${g},${b})`
          })
        }
      }
    }

    setVoxelData(voxels)
    renderVoxels(voxels)
  }

  const renderVoxels = (voxels) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height

    ctx.clearRect(0, 0, width, height)

    const isoAngle = Math.PI / 6
    const voxelSize = Math.min(width, height) / (resolution * 1.5)

    const originX = width / 2
    const originY = height / 4

    const toIso = (x, y, z) => {
      const isoX = (x - y) * Math.cos(isoAngle) * voxelSize
      const isoY = (x + y) * Math.sin(isoAngle) * voxelSize - z * voxelSize
      return { x: originX + isoX, y: originY + isoY }
    }

    voxels.sort((a, b) => {
      const depthA = a.x + a.y + a.z
      const depthB = b.x + b.y + b.z
      return depthB - depthA
    })

    voxels.forEach(voxel => {
      const { x, y, z, color } = voxel

      const top = toIso(x, y, z)
      const right = toIso(x + 1, y, z)
      const left = toIso(x, y + 1, z)
      const bottom = toIso(x, y, z - 1)

      ctx.fillStyle = color
      ctx.beginPath()
      ctx.moveTo(top.x, top.y)
      ctx.lineTo(right.x, right.y)
      ctx.lineTo(bottom.x, bottom.y)
      ctx.lineTo(left.x, left.y)
      ctx.closePath()
      ctx.fill()

      ctx.fillStyle = adjustColor(color, -20)
      ctx.beginPath()
      ctx.moveTo(right.x, right.y)
      ctx.lineTo(toIso(x + 1, y, z - 1).x, toIso(x + 1, y, z - 1).y)
      ctx.lineTo(toIso(x, y + 1, z - 1).x, toIso(x, y + 1, z - 1).y)
      ctx.lineTo(left.x, left.y)
      ctx.closePath()
      ctx.fill()

      ctx.strokeStyle = 'rgba(0,0,0,0.1)'
      ctx.lineWidth = 0.5
      ctx.stroke()
    })
  }

  const adjustColor = (color, amount) => {
    const match = color.match(/rgb\((\d+),(\d+),(\d+)\)/)
    if (!match) return color

    const r = Math.max(0, Math.min(255, parseInt(match[1]) + amount))
    const g = Math.max(0, Math.min(255, parseInt(match[2]) + amount))
    const b = Math.max(0, Math.min(255, parseInt(match[3]) + amount))

    return `rgb(${r},${g},${b})`
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ 
        textAlign: 'center', 
        color: 'white', 
        marginBottom: '2rem',
        fontSize: '2.5rem',
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
      }}>
        🎨 Voxel Art Generator
      </h1>

      <div style={{ 
        display: 'flex', 
        gap: '2rem', 
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <div style={{ 
          background: 'white', 
          padding: '2rem', 
          borderRadius: '10px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          minWidth: '300px'
        }}>
          <h2 style={{ marginBottom: '1rem', color: '#333' }}>Upload Image</h2>
          
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ marginBottom: '1rem', width: '100%' }}
          />

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333' }}>
              Resolution: {resolution}x{resolution}
            </label>
            <input
              type="range"
              min="8"
              max="64"
              value={resolution}
              onChange={(e) => setResolution(parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333' }}>
              Depth: {depth}
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={depth}
              onChange={(e) => setDepth(parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {image && (
            <div style={{ marginTop: '1rem' }}>
              <p style={{ color: '#666', marginBottom: '0.5rem' }}>Original:</p>
              <img 
                src={image.src} 
                alt="Original" 
                style={{ maxWidth: '100%', borderRadius: '5px' }}
              />
            </div>
          )}
        </div>

        <div style={{ 
          background: 'white', 
          padding: '2rem', 
          borderRadius: '10px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          flex: '1',
          minWidth: '400px'
        }}>
          <h2 style={{ marginBottom: '1rem', color: '#333' }}>Voxel Preview</h2>
          <canvas
            ref={canvasRef}
            width={600}
            height={400}
            style={{ 
              width: '100%', 
              border: '1px solid #ddd',
              borderRadius: '5px',
              background: '#f9f9f9'
            }}
          />
          {voxelData.length > 0 && (
            <p style={{ marginTop: '1rem', color: '#666' }}>
              Generated {voxelData.length} voxels
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
