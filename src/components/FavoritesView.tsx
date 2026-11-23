import { Heart, Play, Shuffle } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { TrackRow } from './TrackRow';

export function FavoritesView() {
  const { favoriteIds, getTrackById, playTrack } = usePlayer();

  const favoriteTracks = favoriteIds
    .map((id) => getTrackById(id))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  const handlePlayAll = () => {
    if (favoriteTracks.length === 0) return;
    playTrack(favoriteTracks[0], favoriteTracks);
  };

  const handleShuffle = () => {
    if (favoriteTracks.length === 0) return;
    const shuffled = [...favoriteTracks].sort(() => Math.random() - 0.5);
    playTrack(shuffled[0], shuffled);
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="rounded-3xl bg-gradient-to-br from-[#1DB954]/25 via-[#121216] to-[#09090B] border border-white/[0.07] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#1ED760] to-[#0D6B2E] flex items-center justify-center shadow-xl shadow-[#1DB954]/20 shrink-0">
            <Heart className="w-8 h-8 text-black fill-black" />
          </div>
          <div>
            <p className="text-xs text-zinc-300 font-mono-tabular">
              Colección personal · {favoriteTracks.length}{' '}
              {favoriteTracks.length === 1 ? 'canción' : 'canciones'}
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Tus Favoritos
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            disabled={favoriteTracks.length === 0}
            onClick={handlePlayAll}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1DB954] hover:bg-[#1ED760] disabled:opacity-40 text-black font-semibold text-sm min-h-[44px]"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>Reproducir</span>
          </button>
          <button
            type="button"
            disabled={favoriteTracks.length === 0}
            onClick={handleShuffle}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] disabled:opacity-40 text-white font-medium text-sm min-h-[44px]"
          >
            <Shuffle className="w-4 h-4 text-[#1DB954]" />
            <span>Aleatorio</span>
          </button>
        </div>
      </div>

      {favoriteTracks.length === 0 ? (
        <div className="rounded-2xl bg-[#121216] border border-white/[0.06] p-10 text-center">
          <Heart className="w-9 h-9 text-zinc-500 mx-auto mb-3" />
          <p className="font-display text-base font-bold text-white">
            Aún no tienes canciones favoritas
          </p>
          <p className="text-xs text-zinc-400 mt-1.5 max-w-sm mx-auto">
            Pulsa el corazón en cualquier canción del catálogo o de tus archivos locales para guardarla aquí.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#121216] border border-white/[0.06] divide-y divide-white/[0.04] p-1.5">
          {favoriteTracks.map((track, idx) => (
            <TrackRow
              key={track.id}
              track={track}
              index={idx}
              contextQueue={favoriteTracks}
              showAlbum
            />
          ))}
        </div>
      )}
    </div>
  );
}
