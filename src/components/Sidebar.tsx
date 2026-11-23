import {
  Disc3,
  FolderUp,
  Heart,
  Home,
  Library,
  Plus,
  Search,
  Settings,
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { NavTab } from '../types/music';

interface SidebarProps {
  onOpenCreatePlaylist: () => void;
}

export function Sidebar({ onOpenCreatePlaylist }: SidebarProps) {
  const {
    activeTab,
    setActiveTab,
    detailView,
    setDetailView,
    playlists,
    setIsImportOpen,
    localTracks,
  } = usePlayer();

  const navigate = (tab: NavTab) => {
    setDetailView(null);
    setActiveTab(tab);
  };

  const navItems: { id: NavTab; label: string; icon: typeof Home }[] = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'search', label: 'Buscar', icon: Search },
    { id: 'library', label: 'Tu Biblioteca', icon: Library },
    { id: 'favorites', label: 'Favoritos', icon: Heart },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-[#070709] border-r border-white/[0.06] h-full select-none">
      {/* Brand Wordmark */}
      <div className="px-6 pt-6 pb-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1ED760] to-[#128A3C] flex items-center justify-center shadow-lg shadow-[#1DB954]/20">
          <Disc3 className="w-5 h-5 text-black" />
        </div>
        <span className="font-display text-xl font-bold tracking-tight text-white whitespace-nowrap">
          VibeMusic
        </span>
      </div>

      {/* Primary Navigation */}
      <nav className="px-3 space-y-1" aria-label="Navegación principal">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id && !detailView;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-white/[0.08] text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 ${
                  isActive ? 'text-[#1DB954]' : 'text-zinc-400'
                }`}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Import Local Audio CTA */}
      <div className="px-4 mt-5">
        <button
          type="button"
          onClick={() => setIsImportOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1DB954] hover:bg-[#1ED760] text-black font-semibold text-sm transition-colors shadow-lg shadow-[#1DB954]/15 whitespace-nowrap"
        >
          <FolderUp className="w-4 h-4 shrink-0" />
          <span>Importar música</span>
        </button>
        <p className="text-[11px] text-zinc-500 mt-2 px-1 font-mono-tabular">
          {localTracks.length} {localTracks.length === 1 ? 'pista local' : 'pistas locales'}
        </p>
      </div>

      {/* Playlists Section */}
      <div className="mt-6 flex-1 min-h-0 flex flex-col border-t border-white/[0.06] pt-4">
        <div className="px-5 flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-zinc-400">Tus playlists</span>
          <button
            type="button"
            onClick={onOpenCreatePlaylist}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Crear nueva playlist"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5">
          {playlists.map((pl) => {
            const isActive = detailView?.type === 'playlist' && detailView.id === pl.id;
            return (
              <button
                key={pl.id}
                type="button"
                onClick={() => setDetailView({ type: 'playlist', id: pl.id })}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm truncate transition-colors ${
                  isActive
                    ? 'bg-white/[0.08] text-[#1DB954] font-medium'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]'
                }`}
              >
                {pl.name}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
