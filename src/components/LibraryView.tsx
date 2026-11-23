import {
  Disc3,
  Edit3,
  FolderUp,
  Heart,
  History,
  ListMusic,
  Plus,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { ALBUMS } from '../data/catalog';
import { usePlayer } from '../context/PlayerContext';
import { Playlist } from '../types/music';
import { formatBytes } from '../utils/format';
import { Artwork } from './Artwork';
import { TrackRow } from './TrackRow';

type LibrarySection = 'playlists' | 'favorites' | 'albums' | 'local' | 'history';

interface LibraryViewProps {
  initialSection?: LibrarySection;
  onCreatePlaylist: () => void;
  onEditPlaylist: (pl: Playlist) => void;
}

export function LibraryView({
  initialSection = 'playlists',
  onCreatePlaylist,
  onEditPlaylist,
}: LibraryViewProps) {
  const {
    playlists,
    favoriteIds,
    savedAlbumIds,
    localTracks,
    history,
    storageStats,
    deletePlaylist,
    setDetailView,
    setIsImportOpen,
    clearHistory,
    getTrackById,
    playTrack,
  } = usePlayer();

  const [section, setSection] = useState<LibrarySection>(initialSection);

  const favoriteTracks = favoriteIds
    .map((id) => getTrackById(id))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  const savedAlbums = ALBUMS.filter((a) => savedAlbumIds.includes(a.id));

  const historyTracks = history
    .map((h) => getTrackById(h.trackId))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  const tabs: { id: LibrarySection; label: string; count?: number }[] = [
    { id: 'playlists', label: 'Playlists', count: playlists.length },
    { id: 'favorites', label: 'Favoritos', count: favoriteTracks.length },
    { id: 'albums', label: 'Álbumes', count: savedAlbums.length },
    { id: 'local', label: 'Local', count: localTracks.length },
    { id: 'history', label: 'Historial', count: historyTracks.length },
  ];

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Tu Biblioteca</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Playlists, favoritos, álbumes y archivos guardados localmente
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onCreatePlaylist}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] text-white text-xs font-semibold border border-white/10 min-h-[42px] whitespace-nowrap"
          >
            <Plus className="w-4 h-4 text-[#1DB954]" />
            <span>Crear playlist</span>
          </button>

          <button
            type="button"
            onClick={() => setIsImportOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#1DB954] hover:bg-[#1ED760] text-black text-xs font-semibold min-h-[42px] whitespace-nowrap"
          >
            <FolderUp className="w-4 h-4" />
            <span>Importar audio</span>
          </button>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSection(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 min-h-[38px] ${
              section === tab.id
                ? 'bg-[#1DB954] text-black'
                : 'bg-white/[0.06] text-zinc-300 hover:bg-white/[0.11]'
            }`}
          >
            {tab.label} ({tab.count ?? 0})
          </button>
        ))}
      </div>

      {/* Playlists */}
      {section === 'playlists' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {playlists.map((pl) => {
            const firstCover =
              pl.coverUrl ||
              (pl.trackIds[0] ? getTrackById(pl.trackIds[0])?.coverUrl : undefined);

            return (
              <div
                key={pl.id}
                className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#121216] border border-white/[0.06] hover:border-white/15 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setDetailView({ type: 'playlist', id: pl.id })}
                  className="flex-1 min-w-0 flex items-center gap-3.5 text-left"
                >
                  <Artwork
                    src={firstCover}
                    alt={pl.name}
                    className="w-16 h-16"
                    rounded="rounded-xl"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-sm font-bold text-white truncate">
                      {pl.name}
                    </p>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">
                      {pl.description}
                    </p>
                    <p className="text-[11px] font-mono-tabular text-zinc-500 mt-1">
                      {pl.trackIds.length}{' '}
                      {pl.trackIds.length === 1 ? 'canción' : 'canciones'}
                    </p>
                  </div>
                </button>

                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onEditPlaylist(pl)}
                    className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/5"
                    aria-label={`Editar ${pl.name}`}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deletePlaylist(pl.id)}
                    className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-white/5"
                    aria-label={`Eliminar ${pl.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Favoritos */}
      {section === 'favorites' && (
        <div className="space-y-3">
          {favoriteTracks.length === 0 ? (
            <div className="rounded-2xl bg-[#121216] border border-white/[0.06] p-8 text-center">
              <Heart className="w-8 h-8 text-zinc-500 mx-auto mb-2.5" />
              <p className="text-sm font-semibold text-white">Sin canciones favoritas aún</p>
              <p className="text-xs text-zinc-400 mt-1">
                Toca el icono de corazón en cualquier canción para guardarla aquí.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-xs font-mono-tabular text-zinc-400">
                  {favoriteTracks.length} canciones favoritas
                </p>
                <button
                  type="button"
                  onClick={() => playTrack(favoriteTracks[0], favoriteTracks)}
                  className="text-xs font-semibold text-[#1DB954] hover:underline"
                >
                  Reproducir favoritos
                </button>
              </div>
              <div className="rounded-2xl bg-[#121216] border border-white/[0.06] divide-y divide-white/[0.04] p-1.5">
                {favoriteTracks.map((t, idx) => (
                  <TrackRow
                    key={t.id}
                    track={t}
                    index={idx}
                    contextQueue={favoriteTracks}
                    showAlbum
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Álbumes guardados */}
      {section === 'albums' && (
        <div>
          {savedAlbums.length === 0 ? (
            <div className="rounded-2xl bg-[#121216] border border-white/[0.06] p-8 text-center">
              <ListMusic className="w-8 h-8 text-zinc-500 mx-auto mb-2.5" />
              <p className="text-sm font-semibold text-white">
                No tienes álbumes guardados
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                Abre cualquier álbum desde Inicio o Buscar y pulsa Guardar álbum.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {savedAlbums.map((album) => (
                <button
                  key={album.id}
                  type="button"
                  onClick={() => setDetailView({ type: 'album', id: album.id })}
                  className="rounded-2xl bg-[#121216] hover:bg-[#191920] border border-white/[0.06] p-3 text-left transition-colors"
                >
                  <div className="aspect-square mb-2.5">
                    <Artwork
                      src={album.coverUrl}
                      alt={album.title}
                      className="w-full h-full"
                      rounded="rounded-xl"
                    />
                  </div>
                  <p className="text-sm font-semibold text-white truncate">{album.title}</p>
                  <p className="text-xs text-zinc-400 truncate">{album.artist}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Música local importada */}
      {section === 'local' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-[#121216] border border-white/[0.06] px-4 py-3">
            <div className="text-xs text-zinc-400">
              <span className="font-semibold text-white">
                {localTracks.length} archivos locales
              </span>
              <span className="mx-2 text-zinc-600" aria-hidden="true">
                ·
              </span>
              <span className="font-mono-tabular">
                {formatBytes(storageStats.totalBytes)} en biblioteca
              </span>
            </div>
            {localTracks.length > 0 && (
              <button
                type="button"
                onClick={() => playTrack(localTracks[0], localTracks)}
                className="text-xs font-semibold text-[#1DB954] hover:underline"
              >
                Reproducir música local
              </button>
            )}
          </div>

          {localTracks.length === 0 ? (
            <div className="rounded-2xl bg-[#121216] border border-white/[0.06] p-8 text-center">
              <Disc3 className="w-8 h-8 text-[#1DB954] mx-auto mb-2.5" />
              <p className="text-sm font-semibold text-white">
                Aún no importaste archivos de audio
              </p>
              <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                Selecciona canciones MP3, WAV, M4A, OGG o FLAC desde tu teléfono para reproducirlas sin conexión.
              </p>
              <button
                type="button"
                onClick={() => setIsImportOpen(true)}
                className="mt-4 px-5 py-2.5 rounded-xl bg-[#1DB954] hover:bg-[#1ED760] text-black text-xs font-semibold"
              >
                Importar música ahora
              </button>
            </div>
          ) : (
            <div className="rounded-2xl bg-[#121216] border border-white/[0.06] divide-y divide-white/[0.04] p-1.5">
              {localTracks.map((track, idx) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  index={idx}
                  contextQueue={localTracks}
                  showAlbum
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Historial */}
      {section === 'history' && (
        <div className="space-y-3">
          {historyTracks.length === 0 ? (
            <div className="rounded-2xl bg-[#121216] border border-white/[0.06] p-8 text-center">
              <History className="w-8 h-8 text-zinc-500 mx-auto mb-2.5" />
              <p className="text-sm font-semibold text-white">Historial vacío</p>
              <p className="text-xs text-zinc-400 mt-1">
                Las canciones que escuches aparecerán aquí ordenadas por fecha.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-xs font-mono-tabular text-zinc-400">
                  Últimas {historyTracks.length} reproducciones
                </p>
                <button
                  type="button"
                  onClick={clearHistory}
                  className="text-xs font-medium text-zinc-400 hover:text-rose-400"
                >
                  Borrar historial
                </button>
              </div>
              <div className="rounded-2xl bg-[#121216] border border-white/[0.06] divide-y divide-white/[0.04] p-1.5">
                {historyTracks.map((track, idx) => (
                  <TrackRow
                    key={`${track.id}-${idx}`}
                    track={track}
                    index={idx}
                    contextQueue={historyTracks}
                    showAlbum
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
