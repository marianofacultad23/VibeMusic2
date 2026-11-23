import {
  ArrowLeft,
  BookmarkCheck,
  BookmarkPlus,
  Edit3,
  Play,
  Shuffle,
  Trash2,
} from 'lucide-react';
import { ALBUMS, ARTISTS, CATEGORIES } from '../data/catalog';
import { usePlayer } from '../context/PlayerContext';
import { Playlist, Track } from '../types/music';
import { formatDuration } from '../utils/format';
import { Artwork } from './Artwork';
import { TrackRow } from './TrackRow';

interface DetailViewProps {
  onEditPlaylist: (pl: Playlist) => void;
}

export function DetailView({ onEditPlaylist }: DetailViewProps) {
  const {
    detailView,
    setDetailView,
    allTracks,
    playlists,
    savedAlbumIds,
    toggleSaveAlbum,
    deletePlaylist,
    removeTrackFromPlaylist,
    playTrack,
    getTrackById,
  } = usePlayer();

  if (!detailView) return null;

  let title = '';
  let subtitle = '';
  let metaLine = '';
  let coverUrl: string | undefined;
  let isCircle = false;
  let tracks: Track[] = [];
  let activePlaylist: Playlist | undefined;
  let activeAlbumId: string | undefined;

  if (detailView.type === 'album') {
    const album = ALBUMS.find((a) => a.id === detailView.id);
    if (!album) return null;
    activeAlbumId = album.id;
    title = album.title;
    subtitle = album.artist;
    coverUrl = album.coverUrl;
    tracks = allTracks.filter((t) => t.albumId === album.id);
    const totalSec = tracks.reduce((s, t) => s + t.duration, 0);
    metaLine = `Álbum · ${album.year} · ${tracks.length} canciones · ${formatDuration(totalSec)}`;
  } else if (detailView.type === 'playlist') {
    const pl = playlists.find((p) => p.id === detailView.id);
    if (!pl) return null;
    activePlaylist = pl;
    title = pl.name;
    subtitle = pl.description;
    tracks = pl.trackIds
      .map((id) => getTrackById(id))
      .filter((t): t is Track => Boolean(t));
    coverUrl = pl.coverUrl || tracks[0]?.coverUrl;
    const totalSec = tracks.reduce((s, t) => s + t.duration, 0);
    metaLine = `Playlist · ${tracks.length} canciones · ${formatDuration(totalSec)}`;
  } else if (detailView.type === 'artist') {
    const artist = ARTISTS.find((a) => a.id === detailView.id);
    if (!artist) return null;
    title = artist.name;
    subtitle = artist.bio;
    coverUrl = artist.imageUrl;
    isCircle = true;
    tracks = allTracks.filter((t) => t.artistId === artist.id);
    metaLine = `Artista · ${artist.genre} · ${tracks.length} canciones`;
  } else if (detailView.type === 'category') {
    const cat = CATEGORIES.find((c) => c.name === detailView.name);
    title = detailView.name;
    subtitle = cat?.subtitle || 'Selección por categoría musical';
    coverUrl = cat?.coverUrl;
    tracks = allTracks.filter((t) => t.category === detailView.name);
    metaLine = `Categoría · ${tracks.length} canciones`;
  }

  const isSavedAlbum = activeAlbumId ? savedAlbumIds.includes(activeAlbumId) : false;

  const handlePlayAll = () => {
    if (tracks.length === 0) return;
    playTrack(tracks[0], tracks);
  };

  const handleShufflePlay = () => {
    if (tracks.length === 0) return;
    const copy = [...tracks].sort(() => Math.random() - 0.5);
    playTrack(copy[0], copy);
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Back Button */}
      <button
        type="button"
        onClick={() => setDetailView(null)}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] min-h-[44px]"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver</span>
      </button>

      {/* Hero Header */}
      <div className="rounded-3xl bg-gradient-to-b from-white/[0.07] to-[#121216] border border-white/[0.07] p-5 sm:p-7 flex flex-col sm:flex-row items-center sm:items-end gap-6">
        <Artwork
          src={coverUrl}
          alt={title}
          className="w-44 h-44 sm:w-48 sm:h-48 shadow-2xl"
          rounded="rounded-2xl"
          isCircle={isCircle}
        />

        <div className="flex-1 min-w-0 text-center sm:text-left">
          <p className="text-xs text-zinc-400 font-mono-tabular">{metaLine}</p>
          <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-white mt-1.5 break-words">
            {title}
          </h1>
          <p className="text-sm text-zinc-300 mt-2 max-w-2xl leading-relaxed">
            {subtitle}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mt-5">
            <button
              type="button"
              disabled={tracks.length === 0}
              onClick={handlePlayAll}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1DB954] hover:bg-[#1ED760] disabled:opacity-40 text-black font-semibold text-sm min-h-[44px]"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>Reproducir</span>
            </button>

            <button
              type="button"
              disabled={tracks.length === 0}
              onClick={handleShufflePlay}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] disabled:opacity-40 text-white font-medium text-sm min-h-[44px]"
            >
              <Shuffle className="w-4 h-4 text-[#1DB954]" />
              <span>Aleatorio</span>
            </button>

            {activeAlbumId && (
              <button
                type="button"
                onClick={() => toggleSaveAlbum(activeAlbumId)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium min-h-[44px] transition-colors ${
                  isSavedAlbum
                    ? 'bg-[#1DB954]/15 border-[#1DB954]/40 text-[#1DB954]'
                    : 'bg-white/[0.05] border-white/10 text-zinc-200 hover:bg-white/10'
                }`}
              >
                {isSavedAlbum ? (
                  <BookmarkCheck className="w-4 h-4" />
                ) : (
                  <BookmarkPlus className="w-4 h-4" />
                )}
                <span>{isSavedAlbum ? 'Guardado' : 'Guardar álbum'}</span>
              </button>
            )}

            {activePlaylist && (
              <>
                <button
                  type="button"
                  onClick={() => onEditPlaylist(activePlaylist)}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-zinc-200 text-sm font-medium min-h-[44px]"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Editar</span>
                </button>
                <button
                  type="button"
                  onClick={() => deletePlaylist(activePlaylist.id)}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-rose-500/15 border border-white/10 text-rose-400 text-sm font-medium min-h-[44px]"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Track List */}
      {tracks.length === 0 ? (
        <div className="rounded-2xl bg-[#121216] border border-white/[0.06] p-8 text-center">
          <p className="text-sm font-semibold text-white">Lista vacía</p>
          <p className="text-xs text-zinc-400 mt-1">
            Usa el menú de opciones de cualquier canción para añadirla aquí.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#121216] border border-white/[0.06] divide-y divide-white/[0.04] p-1.5">
          {tracks.map((track, idx) => (
            <TrackRow
              key={`${track.id}-${idx}`}
              track={track}
              index={idx}
              contextQueue={tracks}
              showAlbum={detailView.type !== 'album'}
              onRemoveFromPlaylist={
                activePlaylist
                  ? (trackId) => removeTrackFromPlaylist(activePlaylist.id, trackId)
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
