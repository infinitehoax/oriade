'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Maximize2,
  Music,
  Film,
} from 'lucide-react'
import { Waveform } from './Waveform'

interface Track {
  title: string
  url: string
  duration: number
}

const GITHUB_RAW_BASE = 'https://github.com/infinitehoax/oriade/raw/refs/heads/main/'

const TRACKS: Track[] = [
  { title: 'Julie', url: 'Julie.mp4', duration: 0 },
  { title: 'Already Falling', url: 'already-falling.mp4', duration: 0 },
  { title: 'Amazing Grace', url: 'amazing grace.mp4', duration: 0 },
  { title: 'B4B4', url: 'b4b4.mp4', duration: 0 },
  { title: 'Constantly', url: 'constantly.mp4', duration: 0 },
  { title: 'On the Road', url: 'on the road.mp4', duration: 0 },
  { title: 'Tell Everybody', url: 'tell-everybody.mp4', duration: 0 },
]

export function MediaPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isAudioMode, setIsAudioMode] = useState(false)
  const [volume, setVolume] = useState(70)
  const [currentTime, setCurrentTime] = useState(0)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const media = isAudioMode ? audioRef.current : videoRef.current
    if (!media) return

    const handleTimeUpdate = () => {
      setCurrentTime(media.currentTime)
    }

    const handleLoadedMetadata = () => {
      if (isPlaying && media.paused) {
        media.play()
      }
    }

    const handleEnded = () => {
      handleNextTrack()
    }

    media.addEventListener('timeupdate', handleTimeUpdate)
    media.addEventListener('loadedmetadata', handleLoadedMetadata)
    media.addEventListener('ended', handleEnded)

    return () => {
      media.removeEventListener('timeupdate', handleTimeUpdate)
      media.removeEventListener('loadedmetadata', handleLoadedMetadata)
      media.removeEventListener('ended', handleEnded)
    }
  }, [isAudioMode, isPlaying])

  const currentTrack = TRACKS[currentTrackIndex]
  const videoPath = currentTrack ? `${GITHUB_RAW_BASE}${encodeURI(currentTrack.url)}` : ''
  const progress = currentTrack ? (currentTime / (videoRef.current?.duration || 1)) * 100 : 0

  const handlePlayPause = () => {
    const media = isAudioMode ? audioRef.current : videoRef.current
    if (!media) return

    if (isPlaying) {
      media.pause()
    } else {
      media.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handlePreviousTrack = () => {
    setCurrentTrackIndex((prev) => (prev === 0 ? tracks.length - 1 : prev - 1))
    setCurrentTime(0)
    setIsPlaying(true)
  }

  const handleNextTrack = () => {
    setCurrentTrackIndex((prev) => (prev === tracks.length - 1 ? 0 : prev + 1))
    setCurrentTime(0)
    setIsPlaying(true)
  }

  const handleModeToggle = () => {
    if (isPlaying) {
      const media = isAudioMode ? videoRef.current : audioRef.current
      media?.play()
    }
    setIsAudioMode(!isAudioMode)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value)
    setCurrentTime(newTime)
    const media = isAudioMode ? audioRef.current : videoRef.current
    if (media) {
      media.currentTime = newTime
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (videoRef.current) videoRef.current.volume = newVolume / 100
    if (audioRef.current) audioRef.current.volume = newVolume / 100
  }

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const duration = (isAudioMode ? audioRef.current?.duration : videoRef.current?.duration) || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card-bg to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Main Player Card */}
        <div className="bg-gradient-to-br from-card-bg to-card-hover rounded-2xl p-8 backdrop-blur-xl border border-white/5 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-widest">
                Now Playing
              </p>
              <h1 className="text-2xl font-bold mt-1 text-primary-dark">
                {currentTrack?.title || 'Select Track'}
              </h1>
            </div>
            <div className={`p-4 rounded-full ${isAudioMode ? 'bg-accent/20' : 'bg-primary/20'}`}>
              {isAudioMode ? (
                <Music className="w-6 h-6 text-accent" />
              ) : (
                <Film className="w-6 h-6 text-primary" />
              )}
            </div>
          </div>

          {/* Media Display */}
          <div className="relative mb-8 overflow-hidden rounded-xl bg-black/40 border border-white/10">
            {!isAudioMode ? (
              <div className="relative aspect-video bg-black flex items-center justify-center">
                <video
                  ref={videoRef}
                  src={videoPath}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                  onVolumeChange={() => {}}
                />
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur">
                      <Play className="w-8 h-8 text-white fill-white ml-1" />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-video bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 flex flex-col items-center justify-center space-y-4 p-8">
                <div className="p-6 rounded-full bg-primary/30 backdrop-blur">
                  <Music className="w-12 h-12 text-primary-dark" />
                </div>
                <h2 className="text-xl font-semibold text-center text-white">
                  {currentTrack?.title || 'Audio Mode'}
                </h2>
                {isPlaying && (
                  <Waveform />
                )}
                <audio
                  ref={audioRef}
                  src={videoPath}
                  crossOrigin="anonymous"
                  onVolumeChange={() => {}}
                />
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 mb-6">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary"
              style={{
                background: `linear-gradient(to right, #1DB954 0%, #1DB954 ${progress}%, rgba(255,255,255,0.1) ${progress}%, rgba(255,255,255,0.1) 100%)`,
              }}
            />
            <div className="flex items-center justify-between text-xs text-white/60">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-4 mb-8">
            {/* Previous */}
            <button
              onClick={handlePreviousTrack}
              className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              aria-label="Previous track"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            {/* Play/Pause */}
            <button
              onClick={handlePlayPause}
              className="flex-1 flex items-center justify-center p-4 rounded-full bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg hover:shadow-primary/50 transition-all transform hover:scale-105"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-black fill-black" />
              ) : (
                <Play className="w-6 h-6 text-black fill-black ml-1" />
              )}
            </button>

            {/* Next */}
            <button
              onClick={handleNextTrack}
              className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              aria-label="Next track"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Toggle */}
          <button
            onClick={handleModeToggle}
            className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-white/10 to-white/5 hover:from-white/15 hover:to-white/10 transition-all border border-white/10 text-sm font-semibold flex items-center justify-center gap-2 mb-4"
          >
            {isAudioMode ? (
              <>
                <Film className="w-4 h-4" />
                Switch to Video Mode
              </>
            ) : (
              <>
                <Music className="w-4 h-4" />
                Switch to Audio Mode
              </>
            )}
          </button>

          {/* Volume Control */}
          <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
            <Volume2 className="w-4 h-4 text-white/60" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={handleVolumeChange}
              className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary"
              aria-label="Volume control"
            />
            <span className="text-xs text-white/60 w-8 text-right">{volume}%</span>
          </div>
        </div>

        {/* Playlist - Quick Access */}
        <div className="mt-8 bg-card-bg/50 backdrop-blur-xl rounded-2xl p-6 border border-white/5">
          <h3 className="text-sm font-semibold text-white/80 mb-4 uppercase tracking-widest">
            Playlist
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {TRACKS.map((track, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentTrackIndex(idx)
                  setCurrentTime(0)
                  setIsPlaying(true)
                }}
                className={`w-full px-4 py-3 rounded-lg transition-all text-left text-sm ${
                  idx === currentTrackIndex
                    ? 'bg-primary/20 border border-primary/50 text-primary-dark font-semibold'
                    : 'bg-white/5 hover:bg-white/10 border border-transparent text-white/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-white/40 font-mono">
                    {(idx + 1).toString().padStart(2, '0')}
                  </span>
                  <span>{track.title}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
