import { CheckCircle2, FileAudio, FolderUp, ShieldCheck, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { usePlayer } from '../context/PlayerContext';

export function ImportModal() {
  const {
    isImportOpen,
    setIsImportOpen,
    importAudioFiles,
    isImporting,
    importProgress,
    localTracks,
    setActiveTab,
    setDetailView,
  } = usePlayer();

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastImportedCount, setLastImportedCount] = useState<number | null>(null);

  if (!isImportOpen) return null;

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const count = await importAudioFiles(files);
    if (count > 0) {
      setLastImportedCount(count);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Importar música local"
    >
      <div className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl bg-[#141418] border border-white/10 shadow-2xl overflow-hidden pb-safe">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <FolderUp className="w-5 h-5 text-[#1DB954]" />
            <h2 className="font-display text-lg font-bold text-white">
              Importar música local
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              setLastImportedCount(null);
              setIsImportOpen(false);
            }}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-white/5"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <input
            ref={inputRef}
            type="file"
            accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac,.opus,.webm"
            multiple
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = '';
            }}
          />

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFiles(e.dataTransfer.files);
            }}
            className={`rounded-2xl border-2 border-dashed p-7 text-center transition-colors ${
              isDragging
                ? 'border-[#1DB954] bg-[#1DB954]/10'
                : 'border-white/15 bg-white/[0.02] hover:border-white/25'
            }`}
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#1DB954]/15 flex items-center justify-center mb-4">
              <FileAudio className="w-7 h-7 text-[#1DB954]" />
            </div>

            <h3 className="font-display text-base font-semibold text-white">
              Selecciona archivos de tu teléfono
            </h3>
            <p className="text-xs text-zinc-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
              Compatible con MP3, WAV, M4A, AAC, OGG y FLAC. Extraemos título, artista, duración y portada incrustada automáticamente.
            </p>

            <button
              type="button"
              disabled={isImporting}
              onClick={() => inputRef.current?.click()}
              className="mt-5 w-full sm:w-auto px-6 py-3 rounded-xl bg-[#1DB954] hover:bg-[#1ED760] disabled:opacity-60 text-black font-semibold text-sm transition-colors shadow-lg shadow-[#1DB954]/20 min-h-[44px]"
            >
              {isImporting && importProgress
                ? `Importando ${importProgress.current} de ${importProgress.total}...`
                : 'Abrir selector de archivos'}
            </button>
          </div>

          {lastImportedCount !== null && (
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#1DB954]/12 border border-[#1DB954]/25">
              <div className="flex items-center gap-2.5 min-w-0">
                <CheckCircle2 className="w-5 h-5 text-[#1DB954] shrink-0" />
                <p className="text-sm text-white truncate">
                  {lastImportedCount}{' '}
                  {lastImportedCount === 1 ? 'pista lista' : 'pistas listas'} en tu biblioteca
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsImportOpen(false);
                  setDetailView(null);
                  setActiveTab('library');
                }}
                className="text-xs font-semibold text-[#1DB954] hover:underline whitespace-nowrap shrink-0"
              >
                Ver biblioteca
              </button>
            </div>
          )}

          <div className="flex items-start gap-3 text-xs text-zinc-400 bg-white/[0.03] rounded-2xl p-3.5 border border-white/[0.06]">
            <ShieldCheck className="w-4 h-4 text-[#1DB954] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Tus canciones se guardan en la biblioteca privada de VibeMusic ({localTracks.length} pistas almacenadas). Si quitas una canción de la app, los archivos originales de tu teléfono permanecerán intactos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
