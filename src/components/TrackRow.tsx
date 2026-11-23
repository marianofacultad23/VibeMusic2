import {
  Heart,
  ListPlus,
  MoreVertical,
  Pause,
  Play,
  Plus,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Track } from '../types/music';
import { formatDuration } from '../utils/format';
import { Artwork } from './Artwork';

interface TrackRowProps {
  track: Track;
  index?: number;
  contextQueue?: Track[];
  playlistId?: string;
  showAlbum?: boolean;
  onRemoveFromPlaylist?: (trackId: string) => void;
}

export function TrackRow({
  track,
  index,
  contextQueue,
  showAlbum = false,
  onRemoveFromPlaylist,
}: TrackRowProps) {
  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    favoriteIds,
    toggleFavorite,
    addToQueue,
    setPlaylistPickerTrackId,
    removeLocalTrack,
  } = usePlayer();

  const [menuOpen, setMenuOpen] = useState(false);

  const isCurrent = currentTrack?.id === track.id;
  const isFav = favoriteIds.includes(track.id);

  const handleRowClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, contextQueue);
    }
  };

  return (
    <div
      className={`group relative flex items-center gap-3 px-3 py-2 rounded-xl transition-colors duration-150 ${
        isCurrent
          ? 'bg-[#1DB954]/12'
          : 'hover:bg-white/[0.05] active:bg-white/[0.08]'
      }`}
    >
      {/* Index or Play state indicator on desktop */}
      {typeof index === 'number' && (
        <button
          type="button"
          onClick={handleRowClick}
          className="hidden sm:flex w-7 h-7 items-center justify-center shrink-0 text-xs font-mono-tabular text-zinc-400 group-hover:text-white"
          aria-label={isCurrent && isPlaying ? `Pausar ${track.title}` : `Reproducir ${track.title}`}
        >
          {isCurrent && isPlaying ? (
            <Pause className="w-4 h-4 text-[#1DB954] fill-[#1DB954]" />
          ) : isCurrent ? (
            <Play className="w-4 h-4 text-[#1DB954] fill-[#1DB954]" />
          ) : (
            <>
              <span className="group-hover:hidden">{index + 1}</span>
              <Play className="w-3.5 h-3.5 hidden group-hover:block fill-white text-white" />
            </>
          )}
        </button>
      )}

      {/* Main clickable tap area */}
      <button
        type="button"
        onClick={handleRowClick}
        className="flex-1 min-w-0 flex items-center gap-3 text-left min-h-[44px]"
      >
        <div className="relative shrink-0">
          <Artwork
            src={track.coverUrl}
            alt={track.title}
            className="w-11 h-11"
            rounded="rounded-lg"
            isLocal={track.isLocal}
          />
          {isCurrent && (
            <div className="sm:hidden absolute inset-0 rounded-lg bg-black/55 flex items-center justify-center">
              {isPlaying ? (
                <Pause className="w-4 h-4 text-[#1DB954] fill-[#1DB954]" />
              ) : (
                <Play className="w-4 h-4 text-[#1DB954] fill-[#1DB954]" />
              )}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-semibold truncate ${
              isCurrent ? 'text-[#1DB954]' : 'text-zinc-100'
            }`}
          >
            {track.title}
          </p>
          <p className="text-xs text-zinc-400 truncate mt-0.5">
            <span>{track.artist}</span>
            {showAlbum && track.album ? (
              <>
                <span className="mx-1.5 text-zinc-600" aria-hidden="true">
                  ·
                </span>
                <span>{track.album}</span>
              </>
            ) : null}
            {track.isLocal && (
              <>
                <span className="mx-1.5 text-zinc-600" aria-hidden="true">
                  ·
                </span>
                <span className="text-emerald-400/90">{track.fileFormat || 'LOCAL'}</span>
              </>
            )}
          </p>
        </div>
      </button>

      {/* Duration (tabular) */}
      <span className="hidden xs:inline-block sm:inline-block text-xs font-mono-tabular text-zinc-500 shrink-0 pr-1">
        {formatDuration(track.duration)}
      </span>

      {/* Favorite button */}
      <button
        type="button"
        onClick={() => toggleFavorite(track.id)}
        className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-zinc-400 hover:text-white transition-colors shrink-0"
        aria-label={isFav ? `Quitar ${track.title} de favoritos` : `Añadir ${track.title} a favoritos`}
      >
        <Heart
          className={`w-4 h-4 transition-transform active:scale-90 ${
            isFav ? 'text-[#1DB954] fill-[#1DB954]' : ''
          }`}
        />
      </button>

      {/* Context Menu Trigger */}
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-zinc-400 hover:text-white transition-colors"
          aria-label={`Opciones de ${track.title}`}
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute right-0 top-10 z-50 w-56 rounded-2xl bg-[#1C1C22] border border-white/10 shadow-2xl py-1.5 text-sm text-zinc-200">
              <button
                type="button"
                onClick={() => {
                  addToQueue(track, true);
                  setMenuOpen(false);
                }}
                className="w-full px-3.5 py-2.5 flex items-center gap-2.5 hover:bg-white/5 text-left"
              >
                <Play className="w-4 h-4 text-[#1DB954]" />
                <span>Reproducir siguiente</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  addToQueue(track, false);
                  setMenuOpen(false);
                }}
                className="w-full px-3.5 py-2.5 flex items-center gap-2.5 hover:bg-white/5 text-left"
              >
                <ListPlus className="w-4 h-4 text-zinc-400" />
                <span>Añadir a la cola</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPlaylistPickerTrackId(track.id);
                  setMenuOpen(false);
                }}
                className="w-full px-3.5 py-2.5 flex items-center gap-2.5 hover:bg-white/5 text-left"
              >
                <Plus className="w-4 h-4 text-zinc-400" />
                <span>Añadir a playlist</span>
              </button>

              {onRemoveFromPlaylist && (
                <button
                  type="button"
                  onClick={() => {
                    onRemoveFromPlaylist(track.id);
                    setMenuOpen(false);
                  }}
                  className="w-full px-3.5 py-2.5 flex items-center gap-2.5 hover:bg-white/5 text-left text-amber-400"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Quitar de playlist</span>
                </button>
              )}

              {track.isLocal && (
                <button
                  type="button"
                  onClick={() => {
                    removeLocalTrack(track.id);
                    setMenuOpen(false);
                  }}
                  className="w-full px-3.5 py-2.5 flex items-center gap-2.5 hover:bg-white/5 text-left text-rose-400 border-t border-white/5 mt-1 pt-2.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Quitar de biblioteca</span>
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
