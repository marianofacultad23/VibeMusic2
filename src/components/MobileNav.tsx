import { Heart, Home, Library, Search, Settings } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { NavTab } from '../types/music';

export function MobileNav() {
  const { activeTab, setActiveTab, setDetailView } = usePlayer();

  const tabs: { id: NavTab; label: string; icon: typeof Home }[] = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'search', label: 'Buscar', icon: Search },
    { id: 'library', label: 'Biblioteca', icon: Library },
    { id: 'favorites', label: 'Favoritos', icon: Heart },
    { id: 'settings', label: 'Ajustes', icon: Settings },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0B0B0E]/95 backdrop-blur-xl border-t border-white/[0.07] pb-safe"
      aria-label="Navegación móvil"
    >
      <div className="grid grid-cols-5 h-14 items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setDetailView(null);
                setActiveTab(tab.id);
              }}
              className="h-full flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px]"
            >
              <Icon
                className={`w-5 h-5 transition-colors ${
                  isActive ? 'text-[#1DB954]' : 'text-zinc-400'
                }`}
              />
              <span
                className={`text-[10px] font-medium tracking-tight whitespace-nowrap ${
                  isActive ? 'text-[#1DB954]' : 'text-zinc-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
