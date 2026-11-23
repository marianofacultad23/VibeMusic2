import { ListMusic, Pause, Play, Trash2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration } from '../utils/format';
import { Artwork } from './Artwork';

export function QueueSheet() {
  const {
    isQueueOpen,
    setIsQueueOpen,
    queue,
    queueIndex,
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    removeFromQueue,
    clearQueue,
  } = usePlayer();

  const upNext = queue
    .map((track, idx) => ({ track, idx }))
    .filter(({ idx }) => idx > queueIndex);

  return (
    <AnimatePresence>
      {isQueueOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsQueueOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md bg-[#121216] border-l border-white/10 h-full flex flex-col pt-safe pb-safe"
            aria-label="Cola de reproducción"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <ListMusic className="w-5 h-5 text-[#1DB954]" />
                <h2 className="font-display text-lg font-bold text-white">Cola</h2>
              </div>

              <div className="flex items-center gap-2">
                {upNext.length > 0 && (
                  <button
                    type="button"
                    onClick={clearQueue}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Limpiar cola
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsQueueOpen(false)}
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-white/5"
                  aria-label="Cerrar cola"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
              {currentTrack && (
                <div>
                  <h3 className="text-xs font-semibold text-zinc-400 px-2 mb-2">
                    Sonando ahora
                  </h3>
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#1DB954]/12 border border-[#1DB954]/25">
                    <Artwork
                      src={currentTrack.coverUrl}
                      alt={currentTrack.title}
                      className="w-11 h-11"
                      isLocal={currentTrack.isLocal}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#1DB954] truncate">
                        {currentTrack.title}
                      </p>
                      <p className="text-xs text-zinc-400 truncate">
                        {currentTrack.artist}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="w-9 h-9 rounded-full bg-[#1DB954] text-black flex items-center justify-center shrink-0"
                      aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 fill-black" />
                      ) : (
                        <Play className="w-4 h-4 fill-black ml-0.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-xs font-semibold text-zinc-400 px-2 mb-2">
                  A continuación ({upNext.length})
                </h3>
                {upNext.length === 0 ? (
                  <p className="text-sm text-zinc-500 px-2 py-6 text-center">
                    No hay más canciones en la cola. Añade pistas desde cualquier lista o álbum.
                  </p>
                ) : (
                  <div className="space-y-1">
                    {upNext.map(({ track, idx }) => (
                      <div
                        key={`${track.id}-${idx}`}
                        className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/[0.04]"
                      >
                        <button
                          type="button"
                          onClick={() => playTrack(track, queue)}
                          className="flex-1 min-w-0 flex items-center gap-3 text-left min-h-[44px]"
                        >
                          <Artwork
                            src={track.coverUrl}
                            alt={track.title}
                            className="w-10 h-10"
                            isLocal={track.isLocal}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-white truncate">
                              {track.title}
                            </p>
                            <p className="text-xs text-zinc-400 truncate">
                              {track.artist}
                              <span className="mx-1.5 text-zinc-600" aria-hidden="true">
                                ·
                              </span>
                              <span className="font-mono-tabular">
                                {formatDuration(track.duration)}
                              </span>
                            </p>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFromQueue(idx)}
                          className="min-w-[40px] min-h-[40px] flex items-center justify-center text-zinc-500 hover:text-rose-400 rounded-full"
                          aria-label={`Quitar ${track.title} de la cola`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
