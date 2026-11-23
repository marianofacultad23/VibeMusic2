import {
  ChevronDown,
  Clock,
  Heart,
  ListMusic,
  Pause,
  Play,
  Plus,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  SlidersHorizontal,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { EqPreset } from '../types/music';
import { formatDuration } from '../utils/format';
import { Artwork } from './Artwork';

const EQ_LABELS: { id: EqPreset; label: string }[] = [
  { id: 'flat', label: 'Natural' },
  { id: 'bass', label: 'Graves+' },
  { id: 'vocal', label: 'Vocal' },
  { id: 'electronic', label: 'Electrónica' },
  { id: 'night', label: 'Nocturno' },
];

export function FullPlayerModal() {
  const {
    currentTrack,
    isFullPlayerOpen,
    setIsFullPlayerOpen,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    shuffle,
    repeatMode,
    favoriteIds,
    settings,
    sleepTimerRemaining,
    togglePlay,
    nextTrack,
    prevTrack,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    toggleFavorite,
    setIsQueueOpen,
    setPlaylistPickerTrackId,
    updateSettings,
    setSleepTimer,
  } = usePlayer();

  const [panel, setPanel] = useState<'none' | 'eq' | 'timer'>('none');

  if (!currentTrack) return null;

  const isFav = favoriteIds.includes(currentTrack.id);

  return (
    <AnimatePresence>
      {isFullPlayerOpen && (
        <motion.div
          initial={{ y: '100%', opacity: 0.7 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0.7 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 bg-[#09090B] flex flex-col pt-safe pb-safe overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Reproductor expandido"
        >
          {/* Ambient radial glow */}
          <div
            className="pointer-events-none fixed inset-0 opacity-45"
            style={{
              background:
                'radial-gradient(circle at 50% 22%, rgba(29,185,84,0.28) 0%, rgba(18,18,22,0.85) 55%, #09090B 100%)',
            }}
          />

          <div className="relative z-10 flex-1 flex flex-col max-w-2xl w-full mx-auto px-5 py-4 justify-between min-h-full">
            {/* Top Bar */}
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setIsFullPlayerOpen(false)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-white/10 text-zinc-200 transition-colors"
                aria-label="Minimizar reproductor"
              >
                <ChevronDown className="w-6 h-6" />
              </button>

              <div className="text-center min-w-0">
                <p className="text-[11px] font-medium text-zinc-400 truncate">
                  Reproduciendo desde
                </p>
                <p className="text-xs font-semibold text-white truncate">
                  {currentTrack.album || 'VibeMusic'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPlaylistPickerTrackId(currentTrack.id)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-white/10 text-zinc-200 transition-colors"
                aria-label="Añadir a playlist"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Cover Art */}
            <div className="my-5 flex items-center justify-center">
              <div className="w-full max-w-[330px] aspect-square rounded-3xl overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.75)] border border-white/10">
                <Artwork
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className="w-full h-full"
                  rounded="rounded-3xl"
                  isLocal={currentTrack.isLocal}
                />
              </div>
            </div>

            {/* Track Meta + Favorite */}
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-2xl font-bold text-white truncate">
                    {currentTrack.title}
                  </h2>
                  <p className="text-sm text-zinc-400 truncate mt-1">
                    {currentTrack.artist}
                    {currentTrack.isLocal && currentTrack.fileFormat ? (
                      <>
                        <span className="mx-1.5 text-zinc-600" aria-hidden="true">
                          ·
                        </span>
                        <span className="text-emerald-400">{currentTrack.fileFormat}</span>
                      </>
                    ) : null}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => toggleFavorite(currentTrack.id)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-white/5 transition-colors shrink-0"
                  aria-label={isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                >
                  <Heart
                    className={`w-6 h-6 transition-transform active:scale-90 ${
                      isFav ? 'text-[#1DB954] fill-[#1DB954]' : 'text-zinc-300'
                    }`}
                  />
                </button>
              </div>

              {/* Progress Slider */}
              <div className="space-y-1.5">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  value={Math.min(currentTime, duration || 100)}
                  onChange={(e) => seekTo(Number(e.target.value))}
                  aria-label="Posición de reproducción"
                  className="w-full h-1.5 accent-[#1DB954] bg-white/15 rounded-full cursor-pointer"
                />
                <div className="flex items-center justify-between text-xs font-mono-tabular text-zinc-400">
                  <span>{formatDuration(currentTime)}</span>
                  <span>{formatDuration(duration)}</span>
                </div>
              </div>

              {/* Main Transport Controls */}
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={toggleShuffle}
                  className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-colors ${
                    shuffle ? 'text-[#1DB954]' : 'text-zinc-400 hover:text-white'
                  }`}
                  aria-label="Modo aleatorio"
                >
                  <Shuffle className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={prevTrack}
                  className="min-w-[48px] min-h-[48px] flex items-center justify-center rounded-full text-white hover:bg-white/5 transition-colors"
                  aria-label="Canción anterior"
                >
                  <SkipBack className="w-7 h-7 fill-current" />
                </button>

                <button
                  type="button"
                  onClick={togglePlay}
                  className="w-16 h-16 rounded-full bg-[#1DB954] hover:bg-[#1ED760] text-black flex items-center justify-center shadow-xl shadow-[#1DB954]/25 active:scale-95 transition-transform"
                  aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
                >
                  {isPlaying ? (
                    <Pause className="w-7 h-7 fill-black" />
                  ) : (
                    <Play className="w-7 h-7 fill-black ml-1" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={nextTrack}
                  className="min-w-[48px] min-h-[48px] flex items-center justify-center rounded-full text-white hover:bg-white/5 transition-colors"
                  aria-label="Siguiente canción"
                >
                  <SkipForward className="w-7 h-7 fill-current" />
                </button>

                <button
                  type="button"
                  onClick={cycleRepeat}
                  className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-colors ${
                    repeatMode !== 'off' ? 'text-[#1DB954]' : 'text-zinc-400 hover:text-white'
                  }`}
                  aria-label="Modo repetición"
                >
                  {repeatMode === 'one' ? (
                    <Repeat1 className="w-5 h-5" />
                  ) : (
                    <Repeat className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Volume Bar */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center text-zinc-400 hover:text-white"
                  aria-label={isMuted ? 'Activar volumen' : 'Silenciar'}
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
                  aria-label="Volumen"
                  className="flex-1 h-1 accent-white bg-white/15 rounded-full cursor-pointer"
                />
                <span className="text-xs font-mono-tabular text-zinc-400 w-9 text-right">
                  {Math.round((isMuted ? 0 : volume) * 100)}%
                </span>
              </div>

              {/* Secondary Utility Row: EQ, Sleep Timer, Queue */}
              <div className="flex items-center justify-between pt-2 border-t border-white/[0.07]">
                <button
                  type="button"
                  onClick={() => setPanel(panel === 'eq' ? 'none' : 'eq')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors min-h-[40px] ${
                    panel === 'eq' || settings.eqPreset !== 'flat'
                      ? 'bg-[#1DB954]/15 text-[#1DB954]'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>EQ: {EQ_LABELS.find((e) => e.id === settings.eqPreset)?.label}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPanel(panel === 'timer' ? 'none' : 'timer')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors min-h-[40px] ${
                    panel === 'timer' || sleepTimerRemaining !== null
                      ? 'bg-[#1DB954]/15 text-[#1DB954]'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span className="font-mono-tabular">
                    {sleepTimerRemaining !== null
                      ? formatDuration(sleepTimerRemaining)
                      : 'Temporizador'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsQueueOpen(true);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors min-h-[40px]"
                >
                  <ListMusic className="w-4 h-4" />
                  <span>Cola</span>
                </button>
              </div>

              {/* Expandable EQ or Sleep Timer Sub-strip */}
              {panel === 'eq' && (
                <div className="grid grid-cols-5 gap-1.5 p-1.5 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
                  {EQ_LABELS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => updateSettings({ eqPreset: preset.id })}
                      className={`py-2 px-1 rounded-xl text-xs font-medium transition-colors truncate ${
                        settings.eqPreset === preset.id
                          ? 'bg-[#1DB954] text-black font-semibold'
                          : 'text-zinc-300 hover:bg-white/5'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              )}

              {panel === 'timer' && (
                <div className="grid grid-cols-5 gap-1.5 p-1.5 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
                  {[null, 10, 20, 30, 60].map((mins) => (
                    <button
                      key={String(mins)}
                      type="button"
                      onClick={() => {
                        setSleepTimer(mins);
                        setPanel('none');
                      }}
                      className={`py-2 px-1 rounded-xl text-xs font-medium transition-colors ${
                        mins === null && sleepTimerRemaining === null
                          ? 'bg-white/10 text-white'
                          : 'text-zinc-300 hover:bg-white/10'
                      }`}
                    >
                      {mins === null ? 'Off' : `${mins} min`}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
