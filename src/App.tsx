import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Zap, Plus, Music2, AlertCircle } from 'lucide-react';

// Importazione dei video locali
import normalVideo from './assets/anime-rezero.mp4';
import ncVideo from './assets/anime-rezero.mp4';

interface Track {
  name: string;
  url: string;
}

const App = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isNightcore, setIsNightcore] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (audioRef.current && playlist.length > 0) {
      audioRef.current.playbackRate = isNightcore ? 1.3 : 1.0;
      (audioRef.current as any).preservesPitch = !isNightcore;
    }
  }, [isNightcore, currentTrackIndex, playlist]);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, isNightcore, currentTrackIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio && playlist.length > 0) {
      audio.pause();
      audio.src = playlist[currentTrackIndex].url;
      audio.load();
  
      const startPlayback = () => {
        if (isPlaying) {
          audio.play().catch(err => {
            console.warn("Autoplay blocked by browser policy, user interaction required.");
          });
        }
      };
  
      audio.addEventListener('canplay', startPlayback, { once: true });
      
      return () => {
        audio.removeEventListener('canplay', startPlayback);
      };
    }
  }, [currentTrackIndex, playlist]);

  const handlePlayPause = () => {
    if (playlist.length === 0) {
      setError("Please add a song first!");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => {
          console.error("Playback error:", err);
          setError("Could not play this file.");
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newTracks = Array.from(files).map(file => ({
        name: file.name.replace(/\.[^/.]+$/, ""),
        url: URL.createObjectURL(file)
      }));
      setPlaylist(prev => [...prev, ...newTracks]);
      setError(null);
    }
  };

  const nextTrack = () => {
    if (playlist.length > 1) {
      setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
      setIsPlaying(true);
    }
  };

  const prevTrack = () => {
    if (playlist.length > 1) {
      setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
      setIsPlaying(true);
    }
  };

  return (
    <div className={`player-card ${isNightcore ? 'nc-active' : ''}`}>
      <div className="drag-region"></div>
      <div className="glow-border"></div>
      
      {error && (
        <div className="error-toast">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <div className="header">
        <span className="playing-label">STATUS:</span>
        <span className="track-info">
          {playlist.length > 0 ? playlist[currentTrackIndex].name : "Waiting for tracks..."}
        </span>
      </div>

      <div className="vibe-window">
        <video 
          ref={videoRef}
          src={isNightcore ? ncVideo : normalVideo}
          loop
          muted
          playsInline
          className="vibe-video"
        />
      </div>

      <div className="main-controls">
        <button className="btn-side" onClick={prevTrack}><SkipBack fill="currentColor" /></button>
        <button className="btn-play" onClick={handlePlayPause}>
          {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" style={{marginLeft: '5px'}} />}
        </button>
        <button className="btn-side" onClick={nextTrack}><SkipForward fill="currentColor" /></button>
      </div>

      <div className="nc-toggle-container">
        <div className={`nc-switch ${isNightcore ? 'on' : ''}`} onClick={() => setIsNightcore(!isNightcore)}>
          <Zap size={14} />
          <span>NIGHTCORE MODE</span>
          <div className="handle"></div>
        </div>
      </div>

      <div className="playlist-area">
        <div className="playlist-header">
           <span>Playlist ({playlist.length})</span>
           <label className="add-btn">
             <Plus size={14} /> ADD MUSIC
             <input type="file" accept="audio/*" multiple onChange={handleFileUpload} hidden />
           </label>
        </div>
        <div className="track-list">
          {playlist.length === 0 ? (
            <div className="empty-msg">No tracks found (╥﹏╥)</div>
          ) : (
            playlist.map((t, i) => (
              <div 
                key={i} 
                className={`track-item ${i === currentTrackIndex ? 'active' : ''}`} 
                onClick={() => {setCurrentTrackIndex(i); setIsPlaying(true);}}
              >
                <Music2 size={12} /> {t.name}
              </div>
            ))
          )}
        </div>
      </div>

      {playlist.length > 0 && (
        <audio 
          ref={audioRef} 
          src={playlist[currentTrackIndex].url} 
          onEnded={nextTrack}
        />
      )}
    </div>
  );
};

export default App;