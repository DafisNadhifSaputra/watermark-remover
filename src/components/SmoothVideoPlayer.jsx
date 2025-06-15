import { useState, useRef, useEffect, useCallback } from 'react'
import './SmoothVideoPlayer.css'

const SmoothVideoPlayer = ({ 
  videoUrl, 
  onSelectionChange, 
  selections = [], 
  onTimeUpdate 
}) => {  const videoRef = useRef(null)
  const containerRef = useRef(null)
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPoint, setStartPoint] = useState(null)
  const [tempSelection, setTempSelection] = useState(null)
  const [videoSize, setVideoSize] = useState({ width: 0, height: 0 })

  // Handle video metadata load
  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
      const video = videoRef.current
      setVideoSize({
        width: video.videoWidth,
        height: video.videoHeight
      })
    }
  }, [])

  // Handle time updates
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime
      setCurrentTime(time)
      onTimeUpdate?.(time)
    }
  }, [onTimeUpdate])

  // Play/Pause toggle
  const togglePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }, [isPlaying])

  // Seek to specific time
  const handleSeek = useCallback((e) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect()
      const percentage = (e.clientX - rect.left) / rect.width
      const newTime = percentage * duration
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }, [duration])

  // Handle volume change
  const handleVolumeChange = useCallback((e) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
  }, [])

  // Get relative coordinates
  const getRelativeCoordinates = useCallback((e) => {
    if (!videoRef.current || !containerRef.current) return null
    
    const container = containerRef.current
    const rect = container.getBoundingClientRect()
    const video = videoRef.current
    
    // Calculate video display size accounting for object-fit: contain
    const containerAspect = rect.width / rect.height
    const videoAspect = video.videoWidth / video.videoHeight
    
    let displayWidth, displayHeight, offsetX = 0, offsetY = 0
    
    if (containerAspect > videoAspect) {
      // Container is wider - video fits to height
      displayHeight = rect.height
      displayWidth = displayHeight * videoAspect
      offsetX = (rect.width - displayWidth) / 2
    } else {
      // Container is taller - video fits to width
      displayWidth = rect.width
      displayHeight = displayWidth / videoAspect
      offsetY = (rect.height - displayHeight) / 2
    }
    
    const x = e.clientX - rect.left - offsetX
    const y = e.clientY - rect.top - offsetY
    
    // Convert to video coordinates
    const videoX = (x / displayWidth) * video.videoWidth
    const videoY = (y / displayHeight) * video.videoHeight
    
    return {
      x: Math.max(0, Math.min(videoX, video.videoWidth)),
      y: Math.max(0, Math.min(videoY, video.videoHeight)),
      displayX: x,
      displayY: y,
      displayWidth,
      displayHeight,
      offsetX,
      offsetY
    }
  }, [])

  // Mouse down - start selection
  const handleMouseDown = useCallback((e) => {
    e.preventDefault()
    const coords = getRelativeCoordinates(e)
    if (!coords) return
    
    setIsDrawing(true)
    setStartPoint(coords)
    setTempSelection({
      x: coords.x,
      y: coords.y,
      width: 0,
      height: 0,
      displayX: coords.displayX,
      displayY: coords.displayY,
      displayWidth: 0,
      displayHeight: 0
    })
  }, [getRelativeCoordinates])

  // Mouse move - update selection
  const handleMouseMove = useCallback((e) => {
    if (!isDrawing || !startPoint) return
    
    const coords = getRelativeCoordinates(e)
    if (!coords) return
    
    const width = Math.abs(coords.x - startPoint.x)
    const height = Math.abs(coords.y - startPoint.y)
    const x = Math.min(coords.x, startPoint.x)
    const y = Math.min(coords.y, startPoint.y)
    
    const displayWidth = Math.abs(coords.displayX - startPoint.displayX)
    const displayHeight = Math.abs(coords.displayY - startPoint.displayY)
    const displayX = Math.min(coords.displayX, startPoint.displayX)
    const displayY = Math.min(coords.displayY, startPoint.displayY)
    
    setTempSelection({
      x, y, width, height,
      displayX, displayY, displayWidth, displayHeight
    })
  }, [isDrawing, startPoint, getRelativeCoordinates])

  // Mouse up - finish selection
  const handleMouseUp = useCallback(() => {
    if (isDrawing && tempSelection && tempSelection.width > 10 && tempSelection.height > 10) {
      const newSelection = {
        id: Date.now(),
        x: Math.round(tempSelection.x),
        y: Math.round(tempSelection.y),
        width: Math.round(tempSelection.width),
        height: Math.round(tempSelection.height)
      }
      
      onSelectionChange([...selections, newSelection])
    }
    
    setIsDrawing(false)
    setStartPoint(null)
    setTempSelection(null)
  }, [isDrawing, tempSelection, selections, onSelectionChange])

  // Remove selection
  const removeSelection = useCallback((id) => {
    onSelectionChange(selections.filter(sel => sel.id !== id))
  }, [selections, onSelectionChange])

  // Format time display
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Add event listeners
  useEffect(() => {
    const handleGlobalMouseMove = (e) => handleMouseMove(e)
    const handleGlobalMouseUp = () => handleMouseUp()
    
    if (isDrawing) {
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)
    }
    
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [isDrawing, handleMouseMove, handleMouseUp])

  return (
    <div className="smooth-video-player">
      <div 
        ref={containerRef}
        className="video-container"
        onMouseDown={handleMouseDown}
      >
        <video
          ref={videoRef}
          src={videoUrl}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          className="video-element"
          preload="metadata"
        />
        
        {/* Selection Overlay */}
        <div className="selection-overlay">
          {/* Existing selections */}
          {selections.map((selection) => (
            <div
              key={selection.id}
              className="selection-box"
              style={{
                left: `${(selection.x / videoSize.width) * 100}%`,
                top: `${(selection.y / videoSize.height) * 100}%`,
                width: `${(selection.width / videoSize.width) * 100}%`,
                height: `${(selection.height / videoSize.height) * 100}%`
              }}
            >
              <div className="selection-info">
                {Math.round(selection.width)}×{Math.round(selection.height)}
              </div>
              <button
                className="remove-selection"
                onClick={() => removeSelection(selection.id)}
              >
                ×
              </button>
            </div>
          ))}
          
          {/* Temporary selection while drawing */}
          {tempSelection && (
            <div
              className="selection-box temp-selection"
              style={{
                left: `${(tempSelection.x / videoSize.width) * 100}%`,
                top: `${(tempSelection.y / videoSize.height) * 100}%`,
                width: `${(tempSelection.width / videoSize.width) * 100}%`,
                height: `${(tempSelection.height / videoSize.height) * 100}%`
              }}
            />
          )}
        </div>
      </div>
      
      {/* Video Controls */}
      <div className="video-controls">
        <button className="play-pause-btn" onClick={togglePlayPause}>
          {isPlaying ? '⏸️' : '▶️'}
        </button>
        
        <div className="time-display">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
        
        <div 
          className="progress-bar"
          onClick={handleSeek}
        >
          <div 
            className="progress-fill"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
        </div>
        
        <div className="volume-control">
          <span>🔊</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="volume-slider"
          />
        </div>
      </div>
      
      {/* Selection Info */}
      <div className="selection-info-panel">
        <h4>Watermark Areas ({selections.length})</h4>
        {selections.length === 0 ? (
          <p className="no-selections">Click and drag on video to select watermark areas</p>
        ) : (
          <div className="selections-list">
            {selections.map((sel, index) => (
              <div key={sel.id} className="selection-item">
                <span>Area {index + 1}: {Math.round(sel.width)}×{Math.round(sel.height)} at ({Math.round(sel.x)}, {Math.round(sel.y)})</span>
                <button onClick={() => removeSelection(sel.id)} className="remove-btn">Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SmoothVideoPlayer
