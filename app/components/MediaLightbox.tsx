'use client';

import React, { useEffect, useCallback, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ZoomIn, ZoomOut, RotateCw, Download, Play, Pause,
  Volume2, VolumeX, Maximize2, PictureInPicture, Settings
} from 'lucide-react';

type MediaType = 'image' | 'video';

interface MediaLightboxProps {
  src: string;
  alt?: string;
  type: MediaType;
  isOpen: boolean;
  onClose: () => void;
}

export default function MediaLightbox({ src, alt = '', type, isOpen, onClose }: MediaLightboxProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Reset state when media changes
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setIsPlaying(false);
      setCurrentTime(0);
      setShowControls(true);
    }
  }, [isOpen, src]);

  // Handle keyboard events
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case '+':
      case '=':
        setZoom(z => Math.min(z + 0.25, 3));
        break;
      case '-':
        setZoom(z => Math.max(z - 0.25, 0.5));
        break;
      case 'r':
        setRotation(r => (r + 90) % 360);
        break;
      case ' ':
        e.preventDefault();
        if (type === 'video') togglePlay();
        break;
      case 'm':
        if (type === 'video') setIsMuted(m => !m);
        break;
      case 'f':
        toggleFullscreen();
        break;
    }
  }, [isOpen, onClose, type]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  // Video progress update
  useEffect(() => {
    if (type !== 'video' || !videoRef.current) return;

    const video = videoRef.current;
    const updateProgress = () => setCurrentTime(video.currentTime);

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', () => setDuration(video.duration));
    video.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('loadedmetadata', () => {});
      video.removeEventListener('ended', () => {});
    };
  }, [type, isOpen]);

  // Hide controls after inactivity
  useEffect(() => {
    if (!isOpen || type !== 'video') return;

    const resetControlsTimeout = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 3000);
    };

    window.addEventListener('mousemove', resetControlsTimeout);
    return () => {
      window.removeEventListener('mousemove', resetControlsTimeout);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isOpen, type, isPlaying]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const time = parseFloat(e.target.value);
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const downloadMedia = async () => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = src.split('/').pop() || 'media';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      // Fallback: open in new tab
      window.open(src, '_blank');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md cursor-pointer"
          />

          {/* Media Container */}
          <div
            ref={containerRef}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
              className="relative max-w-7xl max-h-[90vh] w-full"
            >
              {/* Top Toolbar */}
              <div className="absolute -top-16 left-0 right-0 flex items-center justify-between z-10">
                {/* Media Info */}
                <div className="text-white/80 text-sm truncate">
                  {type === 'video' && (
                    <span className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-red-500 text-white text-xs rounded">HDR</span>
                      {alt || src.split('/').pop()}
                    </span>
                  )}
                  {type === 'image' && alt && <span>{alt}</span>}
                </div>

                {/* Tools */}
                <div className="flex items-center gap-1 bg-black/50 rounded-full p-1">
                  {type === 'image' && (
                    <>
                      <button
                        onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))}
                        className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
                        title="缩小 (-)"
                      >
                        <ZoomOut size={18} />
                      </button>
                      <button
                        onClick={() => setZoom(1)}
                        className="px-3 py-1 rounded-full hover:bg-white/20 text-white text-sm transition-colors"
                        title="重置"
                      >
                        {Math.round(zoom * 100)}%
                      </button>
                      <button
                        onClick={() => setZoom(z => Math.min(z + 0.25, 3))}
                        className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
                        title="放大 (+)"
                      >
                        <ZoomIn size={18} />
                      </button>
                      <button
                        onClick={() => setRotation(r => (r + 90) % 360)}
                        className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
                        title="旋转 (r)"
                      >
                        <RotateCw size={18} />
                      </button>
                    </>
                  )}
                  <button
                    onClick={downloadMedia}
                    className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
                    title="下载"
                  >
                    <Download size={18} />
                  </button>
                  {type === 'video' && (
                    <>
                      <button
                        onClick={toggleFullscreen}
                        className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
                        title="全屏 (f)"
                      >
                        <Maximize2 size={18} />
                      </button>
                      <button
                        onClick={() => videoRef.current?.requestPictureInPicture()}
                        className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
                        title="画中画"
                      >
                        <PictureInPicture size={18} />
                      </button>
                    </>
                  )}
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-red-500/50 text-white transition-colors ml-1"
                    title="关闭 (Esc)"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Media Content */}
              <div
                className="relative bg-black/50 rounded-xl overflow-hidden"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transition: 'transform 0.2s ease-out',
                }}
              >
                {type === 'image' ? (
                  <img
                    src={src}
                    alt={alt}
                    className="max-w-full max-h-[80vh] object-contain"
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                ) : (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      className="max-w-full max-h-[80vh]"
                      playsInline
                      webkit-playsinline
                      muted={isMuted}
                      onClick={togglePlay}
                      // HDR metadata for PQ (SMPTE2084) - HDR10
                      style={{
                        colorPrimaries: 'bt2020',
                        transferCharacteristics: 'smpte2084',
                        matrixCoefficients: 'bt2020-ncl',
                      }}
                    >
                      <source src={src} type="video/mp4" />
                      您的浏览器不支持视频播放
                    </video>

                    {/* Video Controls */}
                    <div
                      className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300 ${
                        showControls ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      {/* Progress Bar */}
                      <input
                        type="range"
                        min={0}
                        max={duration || 100}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                      />

                      {/* Control Buttons */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={togglePlay}
                            className="p-2 hover:bg-white/20 rounded-full text-white transition-colors"
                          >
                            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                          </button>

                          <span className="text-white/80 text-sm font-mono">
                            {formatTime(currentTime)} / {formatTime(duration)}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setIsMuted(!isMuted)}
                            className="p-2 hover:bg-white/20 rounded-full text-white transition-colors"
                          >
                            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                          </button>
                          <span className="text-white/60 text-xs bg-white/10 px-2 py-1 rounded">
                            HDR10
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Play Button Overlay */}
                    {!isPlaying && (
                      <button
                        onClick={togglePlay}
                        className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
                      >
                        <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <Play size={32} className="text-white ml-1" />
                        </div>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Info */}
              {type === 'image' && (
                <p className="mt-4 text-center text-sm text-white/60">
                  快捷键: +/- 缩放 | r 旋转 | Esc 关闭
                </p>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
