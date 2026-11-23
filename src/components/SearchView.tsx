import { Search as SearchIcon, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ALBUMS, ARTISTS, CATEGORIES } from '../data/catalog';
import { usePlayer } from '../context/PlayerContext';
import { Artwork } from './Artwork';
import { TrackRow } from './TrackRow';

type SearchFilter = 'all' | 'tracks' | 'artists' | 'albums' | 'playlists' | 'local';

const FILTERS: { id: SearchFilter; label: string }[] = [
  { id: 'all', label: 'Todo' },
  { id: 'tracks', label: 'Canciones' },
  { id: 'artists', label: 'Artistas' },
  { id: 'albums', label: 'Álbumes' },
  { id: 'playlists', label: 'Playlists' },
  { id: 'local', label: 'Local' },
];

export function SearchView() {
  const { allTracks, playlists, setDetailView, getTrackById } = usePlayer();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<SearchFilter>('all');

  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    const matchedTracks = allTracks.filter((t) => {
      if (filter === 'local' && !t.isLocal) return false;
      if (!q) return filter === 'local' ? t.isLocal : true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.album.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    });

    const matchedArtists = ARTISTS.filter(
      (a) =>
        !q || a.name.toLowerCase().includes(q) || a.genre.toLowerCase().includes(q)
    );

    const matchedAlbums = ALBUMS.filter(
      (al) =>
        !q ||
        al.title.toLowerCase().includes(q) ||
        al.artist.toLowerCase().includes(q) ||
        al.category.toLowerCase().includes(q)
    );

    const matchedPlaylists = playlists.filter(
      (pl) =>
        !q ||
        pl.name.toLowerCase().includes(q) ||
        pl.description.toLowerCase().includes(q)
    );

    return { matchedTracks, matchedArtists, matchedAlbums, matchedPlaylists };
  }, [allTracks, playlists, q, filter]);

  const showCategoriesOnly = !q && filter === 'all';

  return (
    <div className="space-y-6 pb-6">
      <div className="space-y-4">
        <h1 className="font-display text-2xl font-bold text-white">Buscar</h1>

        {/* Search Input */}
        <div className="relative">
          <SearchIcon className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Canciones, artistas, álbumes o archivos locales..."
            aria-label="Buscar música"
            className="w-full pl-12 pr-11 py-3.5 rounded-2xl bg-[#16161B] border border-white/10 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#1DB954] transition-colors"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 min-w-[40px] min-h-[40px] flex items-center justify-center text-zinc-400 hover:text-white"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Interactive Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 min-h-[38px] ${
                filter === f.id
                  ? 'bg-[#1DB954] text-black'
                  : 'bg-white/[0.06] text-zinc-300 hover:bg-white/[0.11]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {showCategoriesOnly ? (
        <section className="space-y-3.5">
          <h2 className="font-display text-lg font-bold text-white">
            Explorar por género
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => setDetailView({ type: 'category', name: cat.name })}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${cat.gradient} border border-white/[0.08] p-4 text-left h-28 flex flex-col justify-between hover:border-[#1DB954]/50 transition-colors`}
              >
                <span className="font-display text-base font-bold text-white relative z-10">
                  {cat.name}
                </span>
                <span className="text-[11px] text-zinc-300/90 relative z-10 line-clamp-1">
                  {cat.subtitle}
                </span>
                <div className="absolute -right-3 -bottom-3 w-16 h-16 opacity-60 rotate-12 pointer-events-none">
                  <Artwork src={cat.coverUrl} alt={cat.name} className="w-full h-full" />
                </div>
              </button>
            ))}
          </div>
        </section>
      ) : (
        <div className="space-y-7">
          {/* Canciones */}
          {(filter === 'all' || filter === 'tracks' || filter === 'local') && (
            <section className="space-y-2.5">
              <h2 className="font-display text-base font-bold text-white">
                {filter === 'local' ? 'Música local' : 'Canciones'} (
                <span className="font-mono-tabular">{results.matchedTracks.length}</span>)
              </h2>
              {results.matchedTracks.length === 0 ? (
                <p className="text-sm text-zinc-500 py-4">
                  No se encontraron canciones con ese criterio.
                </p>
              ) : (
                <div className="rounded-2xl bg-[#121216] border border-white/[0.06] divide-y divide-white/[0.04] p-1.5">
                  {results.matchedTracks.map((track, idx) => (
                    <TrackRow
                      key={track.id}
                      track={track}
                      index={idx}
                      contextQueue={results.matchedTracks}
                      showAlbum
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Artistas */}
          {(filter === 'all' || filter === 'artists') &&
            results.matchedArtists.length > 0 && (
              <section className="space-y-3">
                <h2 className="font-display text-base font-bold text-white">Artistas</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {results.matchedArtists.map((artist) => (
                    <button
                      key={artist.id}
                      type="button"
                      onClick={() => setDetailView({ type: 'artist', id: artist.id })}
                      className="rounded-2xl bg-[#121216] hover:bg-[#191920] border border-white/[0.06] p-3 text-center transition-colors"
                    >
                      <div className="w-20 h-20 mx-auto mb-2.5">
                        <Artwork
                          src={artist.imageUrl}
                          alt={artist.name}
                          className="w-full h-full"
                          isCircle
                        />
                      </div>
                      <p className="text-sm font-semibold text-white truncate">
                        {artist.name}
                      </p>
                      <p className="text-xs text-zinc-400 truncate">{artist.genre}</p>
                    </button>
                  ))}
                </div>
              </section>
            )}

          {/* Álbumes */}
          {(filter === 'all' || filter === 'albums') &&
            results.matchedAlbums.length > 0 && (
              <section className="space-y-3">
                <h2 className="font-display text-base font-bold text-white">Álbumes</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {results.matchedAlbums.map((album) => (
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
                      <p className="text-sm font-semibold text-white truncate">
                        {album.title}
                      </p>
                      <p className="text-xs text-zinc-400 truncate">{album.artist}</p>
                    </button>
                  ))}
                </div>
              </section>
            )}

          {/* Playlists */}
          {(filter === 'all' || filter === 'playlists') &&
            results.matchedPlaylists.length > 0 && (
              <section className="space-y-3">
                <h2 className="font-display text-base font-bold text-white">Playlists</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {results.matchedPlaylists.map((pl) => {
                    const cover =
                      pl.coverUrl ||
                      (pl.trackIds[0]
                        ? getTrackById(pl.trackIds[0])?.coverUrl
                        : undefined);
                    return (
                      <button
                        key={pl.id}
                        type="button"
                        onClick={() => setDetailView({ type: 'playlist', id: pl.id })}
                        className="rounded-2xl bg-[#121216] hover:bg-[#191920] border border-white/[0.06] p-3 text-left transition-colors"
                      >
                        <div className="aspect-square mb-2.5">
                          <Artwork
                            src={cover}
                            alt={pl.name}
                            className="w-full h-full"
                            rounded="rounded-xl"
                          />
                        </div>
                        <p className="text-sm font-semibold text-white truncate">
                          {pl.name}
                        </p>
                        <p className="text-xs text-zinc-400 font-mono-tabular">
                          {pl.trackIds.length} canciones
                        </p>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}
        </div>
      )}
    </div>
  );
}
