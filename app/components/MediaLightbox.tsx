'use client';

import React, { useEffect, useCallback, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ZoomIn, ZoomOut, RotateCw, Download, Play, Pause,
  Volume2, VolumeX, Maximize2, PictureInPicture, ExternalLink
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
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setIsPlaying(false);
      setCurrentTime(0);
      setShowControls(true);
      setIsLoaded(false);
    }
  }, [isOpen, src]);

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
        if (type === 'video') toggleFullscreen();
        break;
      case 'ArrowLeft':
        if (type === 'video' && videoRef.current) {
          videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
        }
        break;
      case 'ArrowRight':
        if (type === 'video' && videoRef.current) {
          videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 5);
        }
        break;
    }
  }, [isOpen, onClose, type, duration]);

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

  useEffect(() => {
    if (type !== 'video' || !videoRef.current) return;

    const video = videoRef.current;
    const updateProgress = () => setCurrentTime(video.currentTime);

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', () => {
      setDuration(video.duration);
      setIsLoaded(true);
    });
    video.addEventListener('ended', () => setIsPlaying(false));
    video.addEventListener('loadeddata', () => setIsLoaded(true));

    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('loadedmetadata', () => {});
      video.removeEventListener('ended', () => {});
      video.removeEventListener('loadeddata', () => {});
    };
  }, [type, isOpen]);

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
      videoRef.current.play().catch(() => {
        // Autoplay might be blocked
      });
    }
    setIsPlaying(!isPlaying);
  };

  const toggleFullscreen = async () => {
    if (!videoRef.current) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await videoRef.current.requestFullscreen();
      }
    } catch (e) {
      // Ignore fullscreen errors
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const time = parseFloat(e.target.value);
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const downloadMedia = () => {
    // For images, use the download attribute
    if (type === 'image') {
      const link = document.createElement('a');
      link.href = src;
      link.download = alt || src.split('/').pop() || 'image';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // For videos, open in new tab
      window.open(src, '_blank');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isRemote = src.startsWith('http://') || src.startsWith('https://');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Glassmorphism */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-[var(--bg-main)]/95 backdrop-blur-xl"
          />

          {/* Modal Container */}
          <div
            className="fixed inset-0 z-[101] flex flex-col pointer-events-none"
            onClick={(e) => {
              if (e.target === e.currentTarget) onClose();
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-12 pb-3 pointer-events-auto">
              <div className="flex items-center gap-3">
                {alt && (
                  <span className="text-[var(--text-primary)] text-sm truncate max-w-md">
                    {alt}
                  </span>
                )}
                {/* Media type badge */}
                <span className="px-2 py-1 bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded text-xs text-[var(--text-secondary)]">
                  {type === 'video' ? '视频' : '图片'}
                  {isRemote && type === 'video' && ' • 远程'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadMedia}
                  className="p-2 rounded-lg bg-[var(--glass-surface)] border border-[var(--glass-border)] hover:bg-[var(--glass-surface-hover)] text-[var(--text-primary)] transition-colors"
                  title="下载"
                >
                  <Download size={18} />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg bg-[var(--glass-surface)] border border-[var(--glass-border)] hover:bg-[var(--glass-surface-hover)] text-[var(--text-primary)] transition-colors"
                  title="关闭 (Esc)"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Media Content */}
            <div
              ref={containerRef}
              className="flex-1 flex items-center justify-center p-4 overflow-hidden"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', bounce: 0.15, duration: 0.3 }}
                className="relative max-w-full max-h-full"
              >
                {type === 'image' ? (
                  <div
                    className="relative"
                    style={{
                      transform: `scale(${zoom}) rotate(${rotation}deg)`,
                      transition: 'transform 0.2s ease-out',
                    }}
                  >
                    <img
                      src={src}
                      alt={alt}
                      className="max-w-full max-h-[calc(100vh-200px)] object-contain rounded-lg shadow-2xl"
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      className="max-w-full max-h-[calc(100vh-200px)] rounded-lg shadow-2xl"
                      playsInline
                      muted={isMuted}
                      onClick={togglePlay}
                      onLoadedData={() => setIsLoaded(true)}
                      style={{
                        colorPrimaries: 'bt2020',
                        transferCharacteristics: 'smpte2084',
                        matrixCoefficients: 'bt2020-ncl',
                      }}
                    >
                      <source src={src} type="video/mp4" />
                      您的浏览器不支持视频播放
                    </video>

                    {/* Loading indicator */}
                    {!isLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                        <div className="w-8 h-8 border-2 border-[var(--accent-color)] border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}

                    {/* Video Controls */}
                    <div
                      className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 rounded-b-lg transition-opacity duration-300 ${
                        showControls ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      {/* Progress */}
                      <input
                        type="range"
                        min={0}
                        max={duration || 100}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer mb-3
                          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-[var(--accent-color)] [&::-webkit-slider-thumb]:rounded-full
                          [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:bg-[var(--accent-color)] [&::-moz-range-thumb]:rounded-full"
                      />

                      {/* Controls Row */}
                      <div className="flex items-center justify-between">
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

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setIsMuted(!isMuted)}
                            className="p-2 hover:bg-white/20 rounded-full text-white transition-colors"
                            title={isMuted ? '取消静音 (m)' : '静音 (m)'}
                          >
                            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                          </button>
                          <button
                            onClick={toggleFullscreen}
                            className="p-2 hover:bg-white/20 rounded-full text-white transition-colors"
                            title="全屏 (f)"
                          >
                            <Maximize2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Play Overlay */}
                    {!isPlaying && isLoaded && (
                      <button
                        onClick={togglePlay}
                        className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors rounded-lg"
                      >
                        <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play size={32} className="text-white ml-1" />
                        </div>
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Bottom Toolbar - Glassmorphism */}
            <div className="px-4 pb-8 pointer-events-auto">
              <div className="flex items-center justify-center gap-2 bg-[var(--glass-surface)]/80 backdrop-blur-xl border border-[var(--glass-border)] rounded-2xl p-2 mx-auto max-w-md">
                {type === 'image' && (
                  <>
                    <button
                      onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))}
                      className="p-3 rounded-xl hover:bg-[var(--glass-surface-hover)] text-[var(--text-primary)] transition-colors"
                      title="缩小 (-)"
                    >
                      <ZoomOut size={20} />
                    </button>
                    <button
                      onClick={() => setZoom(1)}
                      className="px-4 py-2 rounded-xl hover:bg-[var(--glass-surface-hover)] text-[var(--text-primary)] text-sm transition-colors"
                    >
                      {Math.round(zoom * 100)}%
                    </button>
                    <button
                      onClick={() => setZoom(z => Math.min(z + 0.25, 3))}
                      className="p-3 rounded-xl hover:bg-[var(--glass-surface-hover)] text-[var(--text-primary)] transition-colors"
                      title="放大 (+)"
                    >
                      <ZoomIn size={20} />
                    </button>
                    <div className="w-px h-6 bg-[var(--glass-border)]" />
                    <button
                      onClick={() => setRotation(r => (r + 90) % 360)}
                      className="p-3 rounded-xl hover:bg-[var(--glass-surface-hover)] text-[var(--text-primary)] transition-colors"
                      title="旋转 (r)"
                    >
                      <RotateCw size={20} />
                    </button>
                  </>
                )}
                <button
                  onClick={downloadMedia}
                  className="p-3 rounded-xl hover:bg-[var(--glass-surface-hover)] text-[var(--text-primary)] transition-colors"
                  title="下载"
                >
                  <Download size={20} />
                </button>
                {type === 'video' && (
                  <>
                    <button
                      onClick={() => videoRef.current?.requestPictureInPicture()}
                      className="p-3 rounded-xl hover:bg-[var(--glass-surface-hover)] text-[var(--text-primary)] transition-colors"
                      title="画中画"
                    >
                      <PictureInPicture size={20} />
                    </button>
                    <a
                      href={src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl hover:bg-[var(--glass-surface-hover)] text-[var(--text-primary)] transition-colors"
                      title="在新标签页打开"
                    >
                      <ExternalLink size={20} />
                    </a>
                  </>
                )}
              </div>

              {/* Shortcuts hint */}
              {type === 'image' && (
                <p className="text-center text-[var(--text-tertiary)] text-xs mt-3">
                  +/- 缩放 • r 旋转 • Esc 关闭
                </p>
              )}
              {type === 'video' && (
                <p className="text-center text-[var(--text-tertiary)] text-xs mt-3">
                  空格 播放/暂停 • m 静音 • f 全屏 • ←/→ 快进/后退
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
