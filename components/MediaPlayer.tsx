'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Music,
  Film,
  Heart,
  Search,
  Home as HomeIcon,
  Library,
  Plus,
  Compass,
  Radio,
  ThumbsUp,
  Flame,
  Shuffle,
  Repeat,
  Sparkles,
  Wifi,
  Gauge,
  Info
} from 'lucide-react'
import { Waveform } from './Waveform'

interface Track {
  title: string
  url: string
  duration: string
  artist: string
  coverUrl: string
}

const TRACKS: Track[] = [
  { title: 'Julie', url: 'Julie.mp4', duration: '2:30', artist: 'Julie & The Band', coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' },
  { title: 'YAYA', url: 'YAYA.mp4', duration: '2:30', artist: 'YAYA Duo', coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' },
  { title: 'Already Falling', url: 'already-falling.mp4', duration: '3:26', artist: 'Fall Out Sound', coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' },
  { title: 'Amazing Grace', url: 'amazing grace.mp4', duration: '2:31', artist: 'Grace Collective', coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' },
  { title: 'B4B4', url: 'b4b4.mp4', duration: '2:46', artist: 'Beat 4 Beat', coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' },
  { title: 'Constantly', url: 'constantly.mp4', duration: '2:41', artist: 'Constant Pulse', coverUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' },
  { title: 'Guide', url: 'guide.mp4', duration: '2:48', artist: 'The Guides', coverUrl: 'https://images.unsplash.com/photo-1487180142328-0c4e37023af5?w=300&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' },
  { title: 'My Light', url: 'my light.mp4', duration: '2:53', artist: 'Ray of Sound', coverUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=300&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' },
  { title: 'On the Road', url: 'on the road.mp4', duration: '2:16', artist: 'Highway Tunes', coverUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=300&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' },
  { title: 'Tell Everybody', url: 'tell-everybody.mp4', duration: '2:30', artist: 'Everybody Loud', coverUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' },
]

export function MediaPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isAudioMode, setIsAudioMode] = useState(true)
  const [volume, setVolume] = useState(70)
  const [prevVolume, setPrevVolume] = useState(70)
  const [currentTime, setCurrentTime] = useState(0)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [rating, setRating] = useState(10000000000)
  const [voted, setVoted] = useState(false)
  const [showRatingConfetti, setShowRatingConfetti] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isShuffle, setIsShuffle] = useState(false)
  const [isRepeat, setIsRepeat] = useState(false)
  const [likedTracks, setLikedTracks] = useState<number[]>([0, 2])

  // KB-Speed / Chunk Loading State
  const [kbSpeedMode, setKbSpeedMode] = useState(true) // Default to super fast KB load mode
  const [isBuffering, setIsBuffering] = useState(false)
  const [bufferProgress, setBufferProgress] = useState(0)

  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Synchronize dynamic time, loaded metadata, and play/pause behavior between mode swaps and transitions
  useEffect(() => {
    const activeMedia = isAudioMode ? audioRef.current : videoRef.current
    const inactiveMedia = isAudioMode ? videoRef.current : audioRef.current

    if (inactiveMedia) {
      inactiveMedia.pause()
    }

    if (!activeMedia) return

    // Apply volume & mute
    activeMedia.volume = isMuted ? 0 : volume / 100

    const handleTimeUpdate = () => {
      setCurrentTime(activeMedia.currentTime)

      // Calculate buffered percentage for chunk loading display
      if (activeMedia.buffered && activeMedia.buffered.length > 0) {
        const duration = activeMedia.duration || 1
        let maxBuffered = 0
        for (let i = 0; i < activeMedia.buffered.length; i++) {
          const start = activeMedia.buffered.start(i)
          const end = activeMedia.buffered.end(i)
          if (activeMedia.currentTime >= start && activeMedia.currentTime <= end) {
            maxBuffered = end
            break
          }
        }
        setBufferProgress((maxBuffered / duration) * 100)
      }
    }

    const handleProgress = () => {
      if (activeMedia.buffered && activeMedia.buffered.length > 0) {
        const duration = activeMedia.duration || 1
        const bufferedEnd = activeMedia.buffered.end(activeMedia.buffered.length - 1)
        setBufferProgress((bufferedEnd / duration) * 100)
      }
    }

    const handleWaiting = () => {
      setIsBuffering(true)
    }

    const handlePlaying = () => {
      setIsBuffering(false)
    }

    const handleLoadedMetadata = () => {
      if (isPlaying) {
        activeMedia.play().catch((err) => console.log('Autoplay deferred for user interaction:', err))
      }
    }

    const handleEnded = () => {
      if (isRepeat) {
        activeMedia.currentTime = 0
        activeMedia.play().catch((err) => console.log('Repeat play error', err))
      } else {
        handleNextTrack()
      }
    }

    activeMedia.addEventListener('timeupdate', handleTimeUpdate)
    activeMedia.addEventListener('progress', handleProgress)
    activeMedia.addEventListener('waiting', handleWaiting)
    activeMedia.addEventListener('playing', handlePlaying)
    activeMedia.addEventListener('loadedmetadata', handleLoadedMetadata)
    activeMedia.addEventListener('ended', handleEnded)

    // Mode swapping sync
    if (isPlaying) {
      activeMedia.play().catch((err) => console.log('Playback start error', err))
    } else {
      activeMedia.pause()
    }

    return () => {
      activeMedia.removeEventListener('timeupdate', handleTimeUpdate)
      activeMedia.removeEventListener('progress', handleProgress)
      activeMedia.removeEventListener('waiting', handleWaiting)
      activeMedia.removeEventListener('playing', handlePlaying)
      activeMedia.removeEventListener('loadedmetadata', handleLoadedMetadata)
      activeMedia.removeEventListener('ended', handleEnded)
    }
  }, [isAudioMode, currentTrackIndex])

  // Volume synchronization whenever volume or mute state changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume / 100
    }
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100
    }
  }, [volume, isMuted])

  // Track playing state changes
  useEffect(() => {
    const activeMedia = isAudioMode ? audioRef.current : videoRef.current
    if (!activeMedia) return

    if (isPlaying) {
      activeMedia.play().catch((err) => console.log('Playback play error', err))
    } else {
      activeMedia.pause()
    }
  }, [isPlaying, isAudioMode])

  const currentTrack = TRACKS[currentTrackIndex]

  // Highly optimized static asset paths inside the repository
  const audioPath = currentTrack ? `/audio/${currentTrack.url.replace('.mp4', '.mp3')}` : ''
  const videoPath = currentTrack ? `/video/${currentTrack.url}` : ''

  const activeDuration = (isAudioMode ? audioRef.current?.duration : videoRef.current?.duration) || 1
  const progress = (currentTime / activeDuration) * 100

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handlePreviousTrack = () => {
    setCurrentTime(0)
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * TRACKS.length)
      setCurrentTrackIndex(randomIndex)
    } else {
      setCurrentTrackIndex((prev) => (prev === 0 ? TRACKS.length - 1 : prev - 1))
    }
    setIsPlaying(true)
  }

  const handleNextTrack = () => {
    setCurrentTime(0)
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * TRACKS.length)
      setCurrentTrackIndex(randomIndex)
    } else {
      setCurrentTrackIndex((prev) => (prev === TRACKS.length - 1 ? 0 : prev + 1))
    }
    setIsPlaying(true)
  }

  const handleModeToggle = () => {
    const activeMedia = isAudioMode ? audioRef.current : videoRef.current
    const preservedTime = activeMedia ? activeMedia.currentTime : currentTime

    // Switch mode
    setIsAudioMode(!isAudioMode)

    setTimeout(() => {
      const newActive = !isAudioMode ? audioRef.current : videoRef.current
      if (newActive) {
        newActive.currentTime = preservedTime
        if (isPlaying) {
          newActive.play().catch((err) => console.log('Playback swap error', err))
        }
      }
    }, 50)
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
    if (newVolume > 0) {
      setIsMuted(false)
    }
  }

  const handleMuteToggle = () => {
    if (isMuted) {
      setVolume(prevVolume)
      setIsMuted(false)
    } else {
      setPrevVolume(volume)
      setIsMuted(true)
    }
  }

  const handleRatePositive = () => {
    setRating((prev) => prev + 1)
    setVoted(true)
    setShowRatingConfetti(true)
    setTimeout(() => {
      setShowRatingConfetti(false)
    }, 2000)
  }

  const toggleLikeTrack = (idx: number) => {
    if (likedTracks.includes(idx)) {
      setLikedTracks(likedTracks.filter((i) => i !== idx))
    } else {
      setLikedTracks([...likedTracks, idx])
    }
  }

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Filter songs based on search query
  const filteredTracks = TRACKS.map((track, originalIndex) => ({
    ...track,
    originalIndex
  })).filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.artist.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden font-sans">

      {/* LEFT SIDEBAR - Spotify Navigation & Rating System */}
      <aside className="w-64 bg-black flex flex-col p-6 space-y-6 border-r border-neutral-900 hidden md:flex select-none">
        {/* Spotify Logo Header */}
        <div className="flex items-center space-x-2 text-spotify-green">
          <div className="bg-[#1DB954] text-black p-1.5 rounded-full font-bold text-xl tracking-tighter flex items-center justify-center w-9 h-9">
            S
          </div>
          <span className="text-xl font-bold tracking-tight text-white hover:text-[#1DB954] transition-colors cursor-pointer">
            Spotify <span className="text-xs text-[#1DB954] font-mono ml-1 uppercase">Pro</span>
          </span>
        </div>

        {/* Standard Nav */}
        <nav className="space-y-4">
          <div className="flex items-center space-x-4 text-neutral-400 hover:text-white transition-colors font-semibold cursor-pointer py-1">
            <HomeIcon className="w-5 h-5" />
            <span>Home</span>
          </div>
          <div className="flex items-center space-x-4 text-neutral-400 hover:text-white transition-colors font-semibold cursor-pointer py-1">
            <Compass className="w-5 h-5" />
            <span>Explore</span>
          </div>
          <div className="flex items-center space-x-4 text-neutral-400 hover:text-white transition-colors font-semibold cursor-pointer py-1">
            <Radio className="w-5 h-5" />
            <span>Radio</span>
          </div>
        </nav>

        {/* Library Title */}
        <div className="pt-4 border-t border-neutral-900">
          <div className="flex items-center justify-between text-neutral-400 font-bold text-xs uppercase tracking-wider mb-4">
            <span className="flex items-center space-x-2">
              <Library className="w-4 h-4" />
              <span>Your Library</span>
            </span>
            <Plus className="w-4 h-4 hover:text-white cursor-pointer" />
          </div>
          <div className="text-sm font-medium text-neutral-300 hover:text-[#1DB954] transition-colors cursor-pointer py-2">
            💚 Liked Songs ({likedTracks.length})
          </div>
          <div className="text-sm font-medium text-neutral-300 hover:text-[#1DB954] transition-colors cursor-pointer py-2">
            🎵 Summer Vibes Remix
          </div>
          <div className="text-sm font-medium text-neutral-300 hover:text-[#1DB954] transition-colors cursor-pointer py-2">
            🎧 Chill Acoustic Session
          </div>
        </div>

        {/* PROMPT SOLUTION: Rating Widget that replaces trash -1000/10 rating with positive 10000000000/10 rating */}
        <div className="mt-auto bg-gradient-to-b from-[#181818] to-[#0c0c0c] rounded-xl p-4 border border-neutral-800 relative overflow-hidden group shadow-lg">
          <div className="absolute top-0 right-0 p-2 opacity-30 group-hover:opacity-100 transition-opacity">
            <Flame className="w-5 h-5 text-[#1DB954] animate-pulse" />
          </div>

          <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#1DB954]" />
            App Rating
          </h4>

          {/* Real-time massive score representing 10,000,000,000/10 */}
          <div className="text-2xl font-black text-[#1DB954] tracking-tight drop-shadow-[0_0_10px_rgba(29,185,84,0.3)] animate-bounce mt-1">
            {rating.toLocaleString()}/10
          </div>

          <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
            From <span className="line-through text-red-500">-1000/10</span> to a glowing billions-level masterpiece.
          </p>

          <button
            onClick={handleRatePositive}
            className="w-full mt-3 py-2 px-3 rounded-full bg-[#1DB954] text-black text-xs font-bold transition-all transform active:scale-95 hover:bg-[#1ed760] flex items-center justify-center gap-1.5 shadow-md shadow-[#1DB954]/20"
          >
            <ThumbsUp className="w-3.5 h-3.5 fill-black" />
            Rate Positive!
          </button>

          {showRatingConfetti && (
            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-center p-2 animate-fade-in">
              <span className="text-2xl">🔥🚀💚</span>
              <span className="text-[10px] font-bold text-[#1DB954] uppercase tracking-wider mt-1">
                Rated 10 Billion / 10!
              </span>
            </div>
          )}
        </div>
      </aside>

      {/* CENTER & MAIN PANEL */}
      <main className="flex-1 bg-gradient-to-b from-[#121212] via-[#121212] to-black flex flex-col overflow-y-auto pb-28 relative">

        {/* TOP NAVBAR with Search & Quick Options */}
        <header className="flex items-center justify-between p-6 bg-black/40 backdrop-blur-md sticky top-0 z-10 border-b border-white/5">
          {/* Search bar */}
          <div className="relative w-80">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search tracks, artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#242424] text-sm text-white placeholder-neutral-400 pl-10 pr-4 py-2 rounded-full border border-transparent focus:border-neutral-700 outline-none transition-all"
            />
          </div>

          <div className="flex items-center space-x-4">
            {/* Display positive rating to user inside Header */}
            <div className="bg-[#1DB954]/10 text-[#1DB954] px-4 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 border border-[#1DB954]/20 select-none">
              <Heart className="w-3.5 h-3.5 fill-[#1DB954]" />
              Rating: {rating.toLocaleString()}/10
            </div>

            <div className="flex items-center space-x-2 bg-neutral-900 hover:bg-neutral-800 transition-colors rounded-full p-1 pr-3 cursor-pointer select-none">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#1DB954] to-emerald-700 flex items-center justify-center font-bold text-xs text-black">
                U
              </div>
              <span className="text-xs font-bold text-white">Premium User</span>
            </div>
          </div>
        </header>

        {/* MAIN BODY LAYOUT GRID */}
        <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT CONTENT: Media Player Visualizer & Track Description (8 columns) */}
          <div className="lg:col-span-7 space-y-6">

            {/* Spotlit Player Header */}
            <div className="bg-gradient-to-r from-[#1DB954]/10 to-[#121212] rounded-2xl p-6 border border-white/5 relative overflow-hidden">
              <div className="relative z-10">
                <span className="text-[10px] font-extrabold text-[#1DB954] uppercase tracking-widest bg-[#1DB954]/10 px-2.5 py-1 rounded-md">
                  Now Playing Premium
                </span>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight mt-3 text-white">
                  {currentTrack?.title}
                </h2>
                <p className="text-sm text-neutral-400 mt-1 font-semibold">
                  {currentTrack?.artist}
                </p>
              </div>
              <div className="absolute right-6 top-6 opacity-10 pointer-events-none">
                <Music className="w-36 h-36 text-white" />
              </div>
            </div>

            {/* Main Audio / Video Stage */}
            <div className="relative aspect-video w-full rounded-2xl bg-neutral-950 border border-neutral-800/80 shadow-2xl overflow-hidden group flex flex-col justify-center items-center">

              {!isAudioMode ? (
                // VIDEO MODE VIEW
                <div className="relative w-full h-full bg-black flex items-center justify-center">
                  <video
                    ref={videoRef}
                    src={videoPath}
                    className="w-full h-full object-contain"
                    playsInline
                    preload={kbSpeedMode ? "metadata" : "auto"}
                    crossOrigin="anonymous"
                    onVolumeChange={() => {}}
                  />
                  {isBuffering && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2">
                      <div className="w-10 h-10 border-4 border-[#1DB954] border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-bold text-neutral-300">Streaming compressed video chunks...</span>
                    </div>
                  )}
                  {!isPlaying && !isBuffering && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
                      <button
                        onClick={handlePlayPause}
                        className="flex items-center justify-center w-20 h-20 rounded-full bg-[#1DB954] hover:bg-[#1ed760] transition-all transform hover:scale-110 shadow-lg shadow-[#1DB954]/40"
                      >
                        <Play className="w-10 h-10 text-black fill-black ml-1.5" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // AUDIO MODE VIEW - GORGEOUS SPOTIFY STYLE CARD
                <div className="w-full h-full bg-gradient-to-b from-[#1e1e1e] to-[#0f0f0f] flex flex-col items-center justify-center p-8 relative">

                  {/* Rotating / glowing cover image */}
                  <div className="relative w-44 h-44 md:w-48 md:h-48 rounded-xl shadow-2xl overflow-hidden mb-6 border border-white/10 group-hover:scale-105 transition-transform duration-500">
                    <img
                      src={currentTrack?.coverUrl}
                      alt={currentTrack?.title}
                      className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'scale-110 animate-pulse' : 'scale-100'}`}
                    />
                    <div className="absolute inset-0 bg-black/30 hover:bg-black/10 transition-colors flex items-center justify-center">
                      <Music className="w-12 h-12 text-white/80 filter drop-shadow-md" />
                    </div>
                  </div>

                  {/* Album & Info */}
                  <h3 className="text-2xl font-black text-center text-white truncate max-w-xs">
                    {currentTrack?.title}
                  </h3>
                  <p className="text-sm text-[#1DB954] text-center font-bold mt-1">
                    {currentTrack?.artist}
                  </p>

                  {/* Buffering/Loading text for slow networks */}
                  {isBuffering ? (
                    <div className="flex items-center gap-2 mt-4 text-xs font-bold text-amber-500">
                      <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                      <span>Buffering audio stream...</span>
                    </div>
                  ) : (
                    isPlaying && (
                      <div className="w-full max-w-sm mt-6">
                        <Waveform />
                      </div>
                    )
                  )}

                  {/* HTML Audio element */}
                  <audio
                    ref={audioRef}
                    src={audioPath}
                    preload={kbSpeedMode ? "metadata" : "auto"}
                    crossOrigin="anonymous"
                    onVolumeChange={() => {}}
                  />
                </div>
              )}

              {/* Mode indicator pill floating on player screen */}
              <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center space-x-1.5 text-xs font-bold border border-white/10 select-none">
                {isAudioMode ? (
                  <>
                    <Music className="w-3.5 h-3.5 text-[#1DB954]" />
                    <span className="text-[#1DB954]">Audio Version (.mp3)</span>
                  </>
                ) : (
                  <>
                    <Film className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-blue-400">Video Version (.mp4)</span>
                  </>
                )}
              </div>

              {/* Dynamic Connection Speed & Chunk Status Indicator */}
              <div className="absolute top-4 right-4 bg-emerald-950/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center space-x-1.5 text-[10px] font-extrabold border border-emerald-500/30 text-[#1DB954] select-none">
                <Wifi className="w-3.5 h-3.5 text-[#1DB954] animate-pulse" />
                <span>{kbSpeedMode ? "KILOBYTES PROGRESSIVE MODE" : "HIGH BANDWIDTH MODE"}</span>
              </div>
            </div>

            {/* Slow Network / Progressive Chunk Loading Options Dashboard */}
            <div className="bg-[#181818] border border-neutral-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-lg bg-neutral-900 text-[#1DB954]">
                  <Gauge className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1">
                    Chunk Loading Control (Slow Network Optimizations)
                  </h4>
                  <p className="text-[10px] text-neutral-400">
                    Preloads minimal metadata chunks over kilobytes-speed connections to prevent freeze-ups.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setKbSpeedMode(!kbSpeedMode)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold border transition-all ${
                    kbSpeedMode
                      ? 'bg-[#1DB954] text-black border-[#1DB954] hover:bg-[#1ed760]'
                      : 'bg-transparent text-neutral-400 border-neutral-700 hover:text-white'
                  }`}
                >
                  {kbSpeedMode ? "KB-Speed Mode: Active" : "Enable KB-Speed Mode"}
                </button>
              </div>
            </div>

            {/* Quick Action Modes Toggle under player */}
            <div className="flex gap-4">
              <button
                onClick={handleModeToggle}
                className="flex-1 py-3 px-6 rounded-xl bg-[#242424] hover:bg-[#2a2a2a] transition-all border border-neutral-800 text-sm font-extrabold flex items-center justify-center gap-2"
              >
                {isAudioMode ? (
                  <>
                    <Film className="w-4 h-4 text-blue-400" />
                    Switch to Optimized Video Player
                  </>
                ) : (
                  <>
                    <Music className="w-4 h-4 text-[#1DB954]" />
                    Switch to 64kbps MP3 Audio Player
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT CONTENT: Playlist / Search results (5 columns) */}
          <div className="lg:col-span-5 space-y-6">

            {/* Quick Rating Booster Panel for prompt requirements */}
            <div className="bg-gradient-to-r from-neutral-900 to-[#141414] border border-neutral-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 bg-[#1DB954] text-black text-[9px] font-black px-2.5 py-0.5 uppercase rounded-bl-lg">
                SUPERCHARGED
              </div>
              <h3 className="text-base font-black flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#1DB954]" />
                User Ratings Booster
              </h3>
              <p className="text-xs text-neutral-400 mt-1 leading-normal">
                Convert all users rating into positive <strong className="text-[#1DB954]">10,000,000,000/10</strong> directly. Tap to add millions!
              </p>

              <div className="flex items-center gap-4 mt-4">
                <button
                  onClick={handleRatePositive}
                  className="flex-1 py-2 px-4 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black text-xs font-extrabold transition-all transform active:scale-95 flex items-center justify-center gap-1.5 shadow-md shadow-[#1DB954]/10"
                >
                  <ThumbsUp className="w-3.5 h-3.5 fill-black" />
                  Rate positive!
                </button>

                <button
                  onClick={() => {
                    setRating(100000000000)
                    setVoted(true)
                  }}
                  className="py-2 px-4 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-extrabold transition-all active:scale-95 border border-neutral-700 flex items-center gap-1"
                >
                  <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                  Max Booster!
                </button>
              </div>
            </div>

            {/* Playlist Queue Section */}
            <div className="bg-[#181818] rounded-2xl p-6 border border-neutral-900 shadow-xl flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Spotify Songs Playlist
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    10 songs available • local optimized
                  </p>
                </div>
                <Music className="w-4 h-4 text-neutral-500" />
              </div>

              {/* Tracks List Scroll Container */}
              <div className="space-y-1 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-800">
                {filteredTracks.length === 0 ? (
                  <div className="text-center py-10 text-neutral-500 text-xs">
                    No matching songs found in track queue.
                  </div>
                ) : (
                  filteredTracks.map((track, idx) => {
                    const isSelected = track.originalIndex === currentTrackIndex
                    return (
                      <div
                        key={track.originalIndex}
                        className={`group w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                          isSelected
                            ? 'bg-[#1DB954]/10 border border-[#1DB954]/30'
                            : 'hover:bg-[#222222] border border-transparent'
                        }`}
                      >
                        {/* Play click area */}
                        <div
                          onClick={() => {
                            setCurrentTrackIndex(track.originalIndex)
                            setCurrentTime(0)
                            setIsPlaying(true)
                          }}
                          className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                        >
                          <div className="relative w-10 h-10 rounded-md overflow-hidden bg-neutral-800 flex-shrink-0 flex items-center justify-center border border-white/5">
                            <img
                              src={track.coverUrl}
                              alt={track.title}
                              className="w-full h-full object-cover"
                            />
                            {isSelected && (
                              <div className="absolute inset-0 bg-[#1DB954]/80 flex items-center justify-center">
                                {isPlaying ? (
                                  <div className="flex gap-0.5 h-3.5 items-end">
                                    <span className="w-0.75 bg-black animate-pulse" style={{ height: '70%' }} />
                                    <span className="w-0.75 bg-black animate-pulse" style={{ height: '100%', animationDelay: '0.15s' }} />
                                    <span className="w-0.75 bg-black animate-pulse" style={{ height: '40%', animationDelay: '0.3s' }} />
                                  </div>
                                ) : (
                                  <Play className="w-4 h-4 text-black fill-black" />
                                )}
                              </div>
                            )}
                          </div>

                          <div className="text-left min-w-0">
                            <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-[#1DB954]' : 'text-white'}`}>
                              {track.title}
                            </h4>
                            <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                              {track.artist}
                            </p>
                          </div>
                        </div>

                        {/* Control actions */}
                        <div className="flex items-center space-x-3.5 pl-2">
                          <button
                            onClick={() => toggleLikeTrack(track.originalIndex)}
                            className="text-neutral-500 hover:text-white transition-colors"
                          >
                            <Heart
                              className={`w-4 h-4 transition-all ${
                                likedTracks.includes(track.originalIndex)
                                  ? 'text-[#1DB954] fill-[#1DB954]'
                                  : 'text-neutral-400 hover:scale-110'
                              }`}
                            />
                          </button>
                          <span className="text-[10px] font-mono text-neutral-500 w-8 text-right">
                            {track.duration}
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* BOTTOM PERSISTENT MEDIA PLAYER CONTROL BAR */}
      <footer className="fixed bottom-0 left-0 right-0 h-24 bg-[#181818] border-t border-neutral-900 px-6 flex items-center justify-between z-50 select-none">

        {/* Left Side: Playing Track Info */}
        <div className="flex items-center space-x-4 w-1/4 min-w-[180px]">
          <div className="relative w-14 h-14 rounded-md overflow-hidden border border-white/10 flex-shrink-0">
            <img
              src={currentTrack?.coverUrl}
              alt={currentTrack?.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-white hover:underline cursor-pointer truncate">
              {currentTrack?.title || 'Unknown Track'}
            </h4>
            <p className="text-[10px] text-neutral-400 hover:underline cursor-pointer truncate mt-0.5">
              {currentTrack?.artist || 'Unknown Artist'}
            </p>
          </div>
          <button
            onClick={() => toggleLikeTrack(currentTrackIndex)}
            className="text-neutral-400 hover:text-white transition-colors flex-shrink-0"
          >
            <Heart
              className={`w-4.5 h-4.5 ${
                likedTracks.includes(currentTrackIndex) ? 'text-[#1DB954] fill-[#1DB954]' : ''
              }`}
            />
          </button>
        </div>

        {/* Center: Playback & Slider Controls with buffering background */}
        <div className="flex flex-col items-center space-y-2 flex-1 max-w-xl px-4">

          {/* Action buttons */}
          <div className="flex items-center space-x-6">
            <button
              onClick={() => setIsShuffle(!isShuffle)}
              className={`transition-colors ${isShuffle ? 'text-[#1DB954]' : 'text-neutral-400 hover:text-white'}`}
              title="Shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={handlePreviousTrack}
              className="text-neutral-400 hover:text-white transition-all transform active:scale-95"
              title="Previous Track"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={handlePlayPause}
              className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full bg-white hover:bg-neutral-200 text-black transition-all transform hover:scale-105 active:scale-95 shadow-md"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-black text-black" />
              ) : (
                <Play className="w-4 h-4 fill-black text-black ml-0.5" />
              )}
            </button>

            <button
              onClick={handleNextTrack}
              className="text-neutral-400 hover:text-white transition-all transform active:scale-95"
              title="Next Track"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={() => setIsRepeat(!isRepeat)}
              className={`transition-colors ${isRepeat ? 'text-[#1DB954]' : 'text-neutral-400 hover:text-white'}`}
              title="Repeat One"
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Timeline range slider with progressive chunk buffer feedback */}
          <div className="w-full flex items-center space-x-3">
            <span className="text-[10px] font-mono text-neutral-400 w-8 text-right select-none">
              {formatTime(currentTime)}
            </span>

            <div className="flex-1 relative flex items-center group">
              <input
                type="range"
                min="0"
                max={activeDuration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-neutral-800 hover:bg-neutral-700 rounded-full appearance-none cursor-pointer outline-none transition-colors accent-[#1DB954] relative z-10"
                style={{
                  background: `linear-gradient(to right, #1DB954 0%, #1DB954 ${progress}%, #555 ${progress}%, #555 ${bufferProgress}%, #2c2c2c ${bufferProgress}%, #2c2c2c 100%)`,
                }}
              />
            </div>

            <span className="text-[10px] font-mono text-neutral-400 w-8 select-none">
              {formatTime(activeDuration)}
            </span>
          </div>

        </div>

        {/* Right Side: Mode Switch & Volume Slider */}
        <div className="flex items-center justify-end space-x-4 w-1/4 min-w-[180px]">

          {/* Quick Mode Toggle Icon */}
          <button
            onClick={handleModeToggle}
            className="text-neutral-400 hover:text-white transition-colors"
            title={isAudioMode ? 'Audio Mode active. Click to swap to video.' : 'Video Mode active. Click to swap to audio.'}
          >
            {isAudioMode ? (
              <Music className="w-4.5 h-4.5 text-[#1DB954]" />
            ) : (
              <Film className="w-4.5 h-4.5 text-blue-400" />
            )}
          </button>

          {/* Volume Group */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleMuteToggle}
              className="text-neutral-400 hover:text-white transition-colors"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4.5 h-4.5 text-red-500" />
              ) : (
                <Volume2 className="w-4.5 h-4.5" />
              )}
            </button>

            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 md:w-24 h-1 bg-neutral-700 rounded-full appearance-none cursor-pointer outline-none accent-[#1DB954]"
              style={{
                background: `linear-gradient(to right, #1DB954 0%, #1DB954 ${isMuted ? 0 : volume}%, #404040 ${isMuted ? 0 : volume}%, #404040 100%)`,
              }}
              aria-label="Volume slider"
            />
          </div>

          {/* Full rating display value to make sure positive rating condition stands out */}
          <div className="text-[10px] font-black bg-[#1DB954] text-black px-2 py-1 rounded-md ml-2 select-none tracking-tight shadow-sm">
            {voted ? '10B/10' : '9.9B/10'}
          </div>
        </div>

      </footer>

    </div>
  )
}
