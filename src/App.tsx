import { Disc3, FolderUp, ListMusic } from 'lucide-react';
import { useState } from 'react';
import { DetailView } from './components/DetailView';
import { FavoritesView } from './components/FavoritesView';
import { FullPlayerModal } from './components/FullPlayerModal';
import { HomeView } from './components/HomeView';
import { ImportModal } from './components/ImportModal';
import { LibraryView } from './components/LibraryView';
import { MiniPlayer } from './components/MiniPlayer';
import { MobileNav } from './components/MobileNav';
import { AddToPlaylistSheet, PlaylistFormModal } from './components/PlaylistModals';
import { QueueSheet } from './components/QueueSheet';
import { SearchView } from './components/SearchView';
import { SettingsView } from './components/SettingsView';
import { Sidebar } from './components/Sidebar';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { Playlist } from './types/music';

function VibeMusicShell() {
  const {
    activeTab,
    detailView,
    currentTrack,
    setIsImportOpen,
    setIsQueueOpen,
    toastMessage,
  } = usePlayer();

  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);

  const openCreatePlaylist = () => {
    setEditingPlaylist(null);
    setPlaylistModalOpen(true);
  };

  const openEditPlaylist = (pl: Playlist) => {
    setEditingPlaylist(pl);
    setPlaylistModalOpen(true);
  };

  return (
    <div className="h-dvh w-full flex flex-col bg-[#09090B] text-[#F4F4F5] overflow-hidden">
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar onOpenCreatePlaylist={openCreatePlaylist} />

        {/* Main Viewport */}
        <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
          {/* Mobile Sticky Top Header */}
          <header className="lg:hidden sticky top-0 z-20 flex items-center justify-between px-4 h-14 bg-[#09090B]/90 backdrop-blur-xl border-b border-white/[0.06] pt-safe shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1ED760] to-[#128A3C] flex items-center justify-center">
                <Disc3 className="w-4 h-4 text-black" />
              </div>
              <span className="font-display text-base font-bold tracking-tight text-white">
                VibeMusic
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsImportOpen(true)}
                className="min-w-[42px] min-h-[42px] flex items-center justify-center rounded-full text-zinc-300 hover:text-white hover:bg-white/5"
                aria-label="Importar música local"
              >
                <FolderUp className="w-5 h-5 text-[#1DB954]" />
              </button>
              <button
                type="button"
                onClick={() => setIsQueueOpen(true)}
                className="min-w-[42px] min-h-[42px] flex items-center justify-center rounded-full text-zinc-300 hover:text-white hover:bg-white/5"
                aria-label="Ver cola de reproducción"
              >
                <ListMusic className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Scrollable Content Stage */}
          <main
            className={`flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 ${
              currentTrack
                ? 'pb-[calc(9.5rem+env(safe-area-inset-bottom,0px))] lg:pb-6'
                : 'pb-[calc(5rem+env(safe-area-inset-bottom,0px))] lg:pb-6'
            }`}
          >
            <div className="max-w-7xl mx-auto">
              {detailView ? (
                <DetailView onEditPlaylist={openEditPlaylist} />
              ) : activeTab === 'home' ? (
                <HomeView />
              ) : activeTab === 'search' ? (
                <SearchView />
              ) : activeTab === 'library' ? (
                <LibraryView
                  onCreatePlaylist={openCreatePlaylist}
                  onEditPlaylist={openEditPlaylist}
                />
              ) : activeTab === 'favorites' ? (
                <FavoritesView />
              ) : (
                <SettingsView />
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Desktop Bottom Bar & Mobile Floating MiniPlayer */}
      <MiniPlayer />

      {/* Mobile Bottom Tab Bar */}
      <MobileNav />

      {/* Modals & Drawers */}
      <FullPlayerModal />
      <QueueSheet />
      <ImportModal />
      <AddToPlaylistSheet />
      <PlaylistFormModal
        isOpen={playlistModalOpen}
        editingPlaylist={editingPlaylist}
        onClose={() => setPlaylistModalOpen(false)}
      />

      {/* Action Feedback Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed left-1/2 -translate-x-1/2 bottom-[calc(8.5rem+env(safe-area-inset-bottom,0px))] lg:bottom-26 z-[80] px-4 py-2.5 rounded-xl bg-[#1C1C22] border border-[#1DB954]/40 text-white text-xs font-medium shadow-2xl whitespace-nowrap max-w-[90vw] truncate"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <PlayerProvider>
      <VibeMusicShell />
    </PlayerProvider>
  );
}
