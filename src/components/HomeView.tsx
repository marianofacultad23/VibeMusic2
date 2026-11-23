import { FolderUp, Play, Shuffle } from 'lucide-react';
import { ALBUMS, ARTISTS, CATALOG_TRACKS, CATEGORIES } from '../data/catalog';
import { usePlayer } from '../context/PlayerContext';
import { getGreeting } from '../utils/format';
import { Artwork } from './Artwork';
import { TrackRow } from './TrackRow';

export function HomeView() {
  const {
    allTracks,
    localTracks,
    playlists,
    history,
    playTrack,
    setDetailView,
    setIsImportOpen,
    getTrackById,
  } = usePlayer();

  const recentTracks = history
    .map((h) => getTrackById(h.trackId))
    .filter((t): t is NonNullable<typeof t> => Boolean(t))
    .slice(0, 6);

  const recommendedTracks = (localTracks.length > 0
    ? [...localTracks.slice(0, 2), ...CATALOG_TRACKS.slice(0, 4)]
    : CATALOG_TRACKS.slice(0, 6));

  const quickGridItems = [
    ...playlists.slice(0, 3).map((pl) => ({
      id: pl.id,
      title: pl.name,
      coverUrl:
        pl.coverUrl ||
        (pl.trackIds[0] ? getTrackById(pl.trackIds[0])?.coverUrl : undefined),
      onClick: () => setDetailView({ type: 'playlist', id: pl.id }),
    })),
    ...ALBUMS.slice(0, 3).map((alb) => ({
      id: alb.id,
      title: alb.title,
      coverUrl: alb.coverUrl,
      onClick: () => setDetailView({ type: 'album', id: alb.id }),
    })),
  ];

  const handlePlayMix = () => {
    if (allTracks.length === 0) return;
    const randomTrack = allTracks[Math.floor(Math.random() * allTracks.length)];
    playTrack(randomTrack, allTracks);
  };

  return (
    <div className="space-y-8 pb-6">
      {/* Hero Atmospheric Greeting */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1DB954]/20 via-[#121216] to-[#09090B] border border-white/[0.07] p-5 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {getGreeting()}
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Tu colección musical lista para escuchar en cualquier lugar.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handlePlayMix}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1DB954] hover:bg-[#1ED760] text-black font-semibold text-sm transition-colors shadow-lg shadow-[#1DB954]/20 min-h-[44px] whitespace-nowrap"
            >
              <Shuffle className="w-4 h-4" />
              <span>Mezcla rápida</span>
            </button>

            <button
              type="button"
              onClick={() => setIsImportOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] text-white font-medium text-sm border border-white/10 transition-colors min-h-[44px] whitespace-nowrap"
            >
              <FolderUp className="w-4 h-4 text-[#1DB954]" />
              <span>Importar MP3/WAV</span>
            </button>
          </div>
        </div>

        {/* Quick-Access 2x3 Compact Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 mt-6">
          {quickGridItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              className="group flex items-center gap-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.11] transition-colors overflow-hidden text-left pr-3 min-h-[52px]"
            >
              <Artwork
                src={item.coverUrl}
                alt={item.title}
                className="w-13 h-13"
                rounded="rounded-none"
              />
              <span className="text-xs sm:text-sm font-semibold text-white truncate flex-1">
                {item.title}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Categorías musicales */}
      <section className="space-y-3.5">
        <h2 className="font-display text-lg sm:text-xl font-bold text-white">
          Categorías musicales
        </h2>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => setDetailView({ type: 'category', name: cat.name })}
              className={`shrink-0 w-40 sm:w-44 rounded-2xl bg-gradient-to-br ${cat.gradient} border border-white/[0.08] p-3.5 text-left hover:border-[#1DB954]/50 transition-colors`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <Artwork
                  src={cat.coverUrl}
                  alt={cat.name}
                  className="w-11 h-11"
                  rounded="rounded-lg"
                />
              </div>
              <p className="font-display text-sm font-bold text-white truncate">
                {cat.name}
              </p>
              <p className="text-[11px] text-zinc-300/80 line-clamp-2 mt-0.5 leading-snug">
                {cat.subtitle}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Música recomendada */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg sm:text-xl font-bold text-white">
            Música recomendada
          </h2>
          <button
            type="button"
            onClick={() => playTrack(recommendedTracks[0], recommendedTracks)}
            className="text-xs font-semibold text-[#1DB954] hover:underline min-h-[36px] px-2"
          >
            Reproducir todo
          </button>
        </div>
        <div className="rounded-2xl bg-[#121216] border border-white/[0.06] divide-y divide-white/[0.04] p-1.5">
          {recommendedTracks.map((track, idx) => (
            <TrackRow
              key={track.id}
              track={track}
              index={idx}
              contextQueue={recommendedTracks}
              showAlbum
            />
          ))}
        </div>
      </section>

      {/* Canciones recientes */}
      {recentTracks.length > 0 && (
        <section className="space-y-3.5">
          <h2 className="font-display text-lg sm:text-xl font-bold text-white">
            Escuchado recientemente
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {recentTracks.map((track) => (
              <button
                key={track.id}
                type="button"
                onClick={() => playTrack(track, recentTracks)}
                className="group rounded-2xl bg-[#121216] hover:bg-[#191920] border border-white/[0.06] p-3 text-left transition-colors"
              >
                <div className="relative aspect-square mb-2.5">
                  <Artwork
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-full h-full"
                    rounded="rounded-xl"
                    isLocal={track.isLocal}
                  />
                  <span className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-[#1DB954] text-black flex items-center justify-center shadow-lg opacity-95 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <Play className="w-4 h-4 fill-black ml-0.5" />
                  </span>
                </div>
                <p className="text-sm font-semibold text-white truncate">{track.title}</p>
                <p className="text-xs text-zinc-400 truncate mt-0.5">{track.artist}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Playlists */}
      <section className="space-y-3.5">
        <h2 className="font-display text-lg sm:text-xl font-bold text-white">
          Playlists para ti
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {playlists.map((pl) => {
            const firstCover =
              pl.coverUrl ||
              (pl.trackIds[0] ? getTrackById(pl.trackIds[0])?.coverUrl : undefined);
            return (
              <button
                key={pl.id}
                type="button"
                onClick={() => setDetailView({ type: 'playlist', id: pl.id })}
                className="group rounded-2xl bg-[#121216] hover:bg-[#191920] border border-white/[0.06] p-3.5 text-left transition-colors"
              >
                <div className="relative aspect-square mb-3">
                  <Artwork
                    src={firstCover}
                    alt={pl.name}
                    className="w-full h-full"
                    rounded="rounded-xl"
                  />
                </div>
                <p className="font-display text-sm font-bold text-white truncate">
                  {pl.name}
                </p>
                <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-snug">
                  {pl.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Álbumes */}
      <section className="space-y-3.5">
        <h2 className="font-display text-lg sm:text-xl font-bold text-white">
          Álbumes destacados
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {ALBUMS.map((album) => (
            <button
              key={album.id}
              type="button"
              onClick={() => setDetailView({ type: 'album', id: album.id })}
              className="group rounded-2xl bg-[#121216] hover:bg-[#191920] border border-white/[0.06] p-3 text-left transition-colors"
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
              <p className="text-xs text-zinc-400 truncate mt-0.5">
                <span>{album.artist}</span>
                <span className="mx-1 text-zinc-600" aria-hidden="true">
                  ·
                </span>
                <span className="font-mono-tabular">{album.year}</span>
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Artistas */}
      <section className="space-y-3.5">
        <h2 className="font-display text-lg sm:text-xl font-bold text-white">
          Artistas
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {ARTISTS.map((artist) => (
            <button
              key={artist.id}
              type="button"
              onClick={() => setDetailView({ type: 'artist', id: artist.id })}
              className="rounded-2xl bg-[#121216] hover:bg-[#191920] border border-white/[0.06] p-3.5 text-center transition-colors"
            >
              <div className="w-24 h-24 mx-auto mb-3">
                <Artwork
                  src={artist.imageUrl}
                  alt={artist.name}
                  className="w-full h-full"
                  isCircle
                />
              </div>
              <p className="text-sm font-semibold text-white truncate">{artist.name}</p>
              <p className="text-xs text-zinc-400 truncate mt-0.5">{artist.genre}</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
