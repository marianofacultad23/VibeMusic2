import { Check, ListPlus, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Playlist } from '../types/music';
import { Artwork } from './Artwork';

interface PlaylistFormModalProps {
  isOpen: boolean;
  editingPlaylist: Playlist | null;
  onClose: () => void;
}

export function PlaylistFormModal({
  isOpen,
  editingPlaylist,
  onClose,
}: PlaylistFormModalProps) {
  const { createPlaylist, updatePlaylist } = usePlayer();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (editingPlaylist) {
      setName(editingPlaylist.name);
      setDescription(editingPlaylist.description);
    } else {
      setName('');
      setDescription('');
    }
  }, [editingPlaylist, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (editingPlaylist) {
      updatePlaylist(editingPlaylist.id, name, description);
    } else {
      createPlaylist(name, description);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[75] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={editingPlaylist ? 'Editar playlist' : 'Crear playlist'}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-[#141418] border border-white/10 shadow-2xl overflow-hidden pb-safe"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h2 className="font-display text-lg font-bold text-white">
            {editingPlaylist ? 'Editar playlist' : 'Nueva playlist'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-zinc-400 hover:text-white"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label
              htmlFor="playlist-name"
              className="block text-xs font-medium text-zinc-400 mb-1.5"
            >
              Nombre de la playlist
            </label>
            <input
              id="playlist-name"
              type="text"
              required
              maxLength={60}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Entrenamiento nocturno"
              className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-[#1DB954]"
            />
          </div>

          <div>
            <label
              htmlFor="playlist-desc"
              className="block text-xs font-medium text-zinc-400 mb-1.5"
            >
              Descripción (opcional)
            </label>
            <textarea
              id="playlist-desc"
              rows={3}
              maxLength={160}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el estilo o momento de esta selección..."
              className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-[#1DB954] resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-300 hover:bg-white/5 min-h-[44px]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#1DB954] hover:bg-[#1ED760] text-black font-semibold text-sm min-h-[44px]"
            >
              {editingPlaylist ? 'Guardar cambios' : 'Crear playlist'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export function AddToPlaylistSheet() {
  const {
    playlistPickerTrackId,
    setPlaylistPickerTrackId,
    playlists,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    createPlaylist,
    getTrackById,
  } = usePlayer();

  const [quickName, setQuickName] = useState('');

  if (!playlistPickerTrackId) return null;
  const track = getTrackById(playlistPickerTrackId);

  const handleQuickCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim()) return;
    createPlaylist(quickName.trim(), 'Playlist creada desde VibeMusic', playlistPickerTrackId);
    setQuickName('');
    setPlaylistPickerTrackId(null);
  };

  return (
    <div
      className="fixed inset-0 z-[75] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Añadir a playlist"
    >
      <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-[#141418] border border-white/10 shadow-2xl overflow-hidden pb-safe max-h-[82vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5 min-w-0">
            <ListPlus className="w-5 h-5 text-[#1DB954] shrink-0" />
            <div className="min-w-0">
              <h2 className="font-display text-base font-bold text-white truncate">
                Añadir a playlist
              </h2>
              {track && (
                <p className="text-xs text-zinc-400 truncate">{track.title}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPlaylistPickerTrackId(null)}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-zinc-400 hover:text-white"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleQuickCreate} className="px-5 pt-4 pb-2 flex gap-2">
          <input
            type="text"
            value={quickName}
            onChange={(e) => setQuickName(e.target.value)}
            placeholder="Crear nueva playlist rápida..."
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#1DB954]"
          />
          <button
            type="submit"
            disabled={!quickName.trim()}
            className="px-3.5 py-2.5 rounded-xl bg-[#1DB954] disabled:opacity-40 text-black font-semibold text-sm flex items-center gap-1 shrink-0 min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Crear</span>
          </button>
        </form>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5">
          {playlists.map((pl) => {
            const hasTrack = pl.trackIds.includes(playlistPickerTrackId);
            const firstTrack = pl.trackIds.length > 0 ? getTrackById(pl.trackIds[0]) : undefined;
            const cover = pl.coverUrl || firstTrack?.coverUrl;

            return (
              <button
                key={pl.id}
                type="button"
                onClick={() => {
                  if (hasTrack) {
                    removeTrackFromPlaylist(pl.id, playlistPickerTrackId);
                  } else {
                    addTrackToPlaylist(pl.id, playlistPickerTrackId);
                    setPlaylistPickerTrackId(null);
                  }
                }}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.05] text-left min-h-[52px]"
              >
                <Artwork src={cover} alt={pl.name} className="w-11 h-11" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate">{pl.name}</p>
                  <p className="text-xs text-zinc-400 font-mono-tabular">
                    {pl.trackIds.length}{' '}
                    {pl.trackIds.length === 1 ? 'canción' : 'canciones'}
                  </p>
                </div>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                    hasTrack
                      ? 'bg-[#1DB954] border-[#1DB954] text-black'
                      : 'border-zinc-600 text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
