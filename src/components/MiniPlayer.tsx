import {
  Heart,
  ListMusic,
  Maximize2,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration } from '../utils/format';
import { Artwork } from './Artwork';

export function MiniPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    shuffle,
    repeatMode,
    favoriteIds,
    togglePlay,
    nextTrack,
    prevTrack,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    toggleFavorite,
    setIsFullPlayerOpen,
    isQueueOpen,
    setIsQueueOpen,
  } = usePlayer();

  if (!currentTrack) return null;

  const progressPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const isFav = favoriteIds.includes(currentTrack.id);

  return (
    <>
      {/* Mobile Compact Floating Mini-Player above bottom nav */}
      <div className="lg:hidden fixed left-2.5 right-2.5 bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px)+6px)] z-30">
        <div className="relative overflow-hidden rounded-2xl bg-[#18181E]/95 backdrop-blur-xl border border-white/10 shadow-2xl">
          {/* Top-edge subtle progress track */}
          <div className="absolute bottom-0 left-3 right-3 h-[2px] bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1DB954] transition-[width] duration-200"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="flex items-center gap-2.5 px-2.5 py-2">
            <button
              type="button"
              onClick={() => setIsFullPlayerOpen(true)}
              className="flex-1 min-w-0 flex items-center gap-2.5 text-left min-h-[44px]"
              aria-label="Abrir reproductor completo"
            >
              <Artwork
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-10 h-10"
                rounded="rounded-lg"
                isLocal={currentTrack.isLocal}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">
                  {currentTrack.title}
                </p>
                <p className="text-xs text-zinc-400 truncate">{currentTrack.artist}</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => toggleFavorite(currentTrack.id)}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center text-zinc-300"
              aria-label={isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            >
              <Heart
                className={`w-4 h-4 ${isFav ? 'text-[#1DB954] fill-[#1DB954]' : ''}`}
              />
            </button>

            <button
              type="button"
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shrink-0 active:scale-95 transition-transform"
              aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-black" />
              ) : (
                <Play className="w-4 h-4 fill-black ml-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={nextTrack}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center text-zinc-300"
              aria-label="Siguiente canción"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Full-Width Bottom Player Bar */}
      <footer className="hidden lg:flex items-center justify-between h-22 px-5 bg-[#09090B] border-t border-white/[0.08] shrink-0 select-none z-30">
        {/* Left: Track Info */}
        <div className="w-[30%] min-w-0 flex items-center gap-3.5">
          <button
            type="button"
            onClick={() => setIsFullPlayerOpen(true)}
            className="group relative shrink-0"
            aria-label="Expandir reproductor"
          >
            <Artwork
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-14 h-14"
              rounded="rounded-lg"
              isLocal={currentTrack.isLocal}
            />
            <span className="absolute inset-0 rounded-lg bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Maximize2 className="w-4 h-4 text-white" />
            </span>
          </button>

          <div className="min-w-0">
            <button
              type="button"
              onClick={() => setIsFullPlayerOpen(true)}
              className="text-sm font-semibold text-white hover:underline truncate block max-w-full text-left"
            >
              {currentTrack.title}
            </button>
            <p className="text-xs text-zinc-400 truncate mt-0.5">{currentTrack.artist}</p>
          </div>

          <button
            type="button"
            onClick={() => toggleFavorite(currentTrack.id)}
            className="p-2 text-zinc-400 hover:text-white transition-colors shrink-0"
            aria-label={isFav ? 'Quitar de favoritos' : 'Guardar en favoritos'}
          >
            <Heart
              className={`w-4 h-4 ${isFav ? 'text-[#1DB954] fill-[#1DB954]' : ''}`}
            />
          </button>
        </div>

        {/* Center: Playback Controls & Progress */}
        <div className="w-[40%] max-w-xl flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={toggleShuffle}
              className={`p-1.5 transition-colors ${
                shuffle ? 'text-[#1DB954]' : 'text-zinc-400 hover:text-white'
              }`}
              aria-label="Modo aleatorio"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={prevTrack}
              className="p-1.5 text-zinc-300 hover:text-white transition-colors"
              aria-label="Canción anterior"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            <button
              type="button"
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-white hover:scale-105 active:scale-95 text-black flex items-center justify-center transition-transform"
              aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-black" />
              ) : (
                <Play className="w-4 h-4 fill-black ml-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={nextTrack}
              className="p-1.5 text-zinc-300 hover:text-white transition-colors"
              aria-label="Siguiente canción"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>

            <button
              type="button"
              onClick={cycleRepeat}
              className={`p-1.5 transition-colors ${
                repeatMode !== 'off' ? 'text-[#1DB954]' : 'text-zinc-400 hover:text-white'
              }`}
              aria-label="Modo repetición"
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="w-4 h-4" />
              ) : (
                <Repeat className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="w-full flex items-center gap-2.5">
            <span className="text-[11px] font-mono-tabular text-zinc-400 w-9 text-right">
              {formatDuration(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={Math.min(currentTime, duration || 100)}
              onChange={(e) => seekTo(Number(e.target.value))}
              aria-label="Progreso de reproducción"
              className="flex-1 h-1 accent-[#1DB954] bg-zinc-800 rounded-full cursor-pointer"
            />
            <span className="text-[11px] font-mono-tabular text-zinc-400 w-9">
              {formatDuration(duration)}
            </span>
          </div>
        </div>

        {/* Right: Queue, Volume, Expand */}
        <div className="w-[30%] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setIsQueueOpen(!isQueueOpen)}
            className={`p-2 rounded-lg transition-colors ${
              isQueueOpen ? 'text-[#1DB954] bg-[#1DB954]/10' : 'text-zinc-400 hover:text-white'
            }`}
            aria-label="Cola de reproducción"
          >
            <ListMusic className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={toggleMute}
            className="p-2 text-zinc-400 hover:text-white transition-colors"
            aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            aria-label="Control de volumen"
            className="w-24 h-1 accent-[#1DB954] bg-zinc-800 rounded-full cursor-pointer"
          />

          <button
            type="button"
            onClick={() => setIsFullPlayerOpen(true)}
            className="p-2 text-zinc-400 hover:text-white transition-colors"
            aria-label="Abrir reproductor expandido"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </>
  );
}
