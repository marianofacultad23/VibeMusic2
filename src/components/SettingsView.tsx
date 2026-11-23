import {
  Bluetooth,
  FolderUp,
  HardDrive,
  PhoneOff,
  Radio,
  SlidersHorizontal,
  Smartphone,
  Trash2,
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { isNativeAndroid } from '../services/androidBridge';
import { EqPreset } from '../types/music';
import { formatBytes } from '../utils/format';

const EQ_OPTIONS: { id: EqPreset; label: string; desc: string }[] = [
  { id: 'flat', label: 'Natural', desc: 'Respuesta plana sin alteraciones' },
  { id: 'bass', label: 'Graves+', desc: 'Refuerzo de frecuencias bajas (+6 dB)' },
  { id: 'vocal', label: 'Vocal', desc: 'Claridad en voces e instrumentos medios' },
  { id: 'electronic', label: 'Electrónica', desc: 'Subgraves y brillo en agudos' },
  { id: 'night', label: 'Nocturno', desc: 'Agudos suaves para escucha relajada' },
];

export function SettingsView() {
  const {
    settings,
    updateSettings,
    storageStats,
    history,
    clearHistory,
    setIsImportOpen,
  } = usePlayer();

  const nativeAndroid = isNativeAndroid();

  return (
    <div className="space-y-6 pb-8 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Configuración</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Motor de audio, ecualizador, comportamiento en Android y almacenamiento local
        </p>
      </div>

      {/* Equalizer */}
      <section className="rounded-2xl bg-[#121216] border border-white/[0.06] p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <SlidersHorizontal className="w-5 h-5 text-[#1DB954]" />
          <h2 className="font-display text-base font-bold text-white">
            Ecualizador de audio
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {EQ_OPTIONS.map((opt) => {
            const active = settings.eqPreset === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => updateSettings({ eqPreset: opt.id })}
                className={`p-3.5 rounded-xl border text-left transition-colors ${
                  active
                    ? 'bg-[#1DB954]/15 border-[#1DB954]/50 text-white'
                    : 'bg-white/[0.02] border-white/[0.06] text-zinc-300 hover:bg-white/[0.05]'
                }`}
              >
                <p className="text-sm font-semibold">{opt.label}</p>
                <p className="text-xs text-zinc-400 mt-0.5">{opt.desc}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Android Background & Hardware Controls */}
      <section className="rounded-2xl bg-[#121216] border border-white/[0.06] p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <Smartphone className="w-5 h-5 text-[#1DB954]" />
          <h2 className="font-display text-base font-bold text-white">
            Reproducción en Android
          </h2>
        </div>

        <div className="divide-y divide-white/[0.06]">
          <ToggleRow
            icon={Radio}
            title="Reproducción en segundo plano y pantalla bloqueada"
            description="Mantiene el servicio MediaPlayback activo con controles en la notificación."
            checked={settings.backgroundPlayback}
            onChange={(v) => updateSettings({ backgroundPlayback: v })}
          />
          <ToggleRow
            icon={PhoneOff}
            title="Pausar ante llamadas entrantes (AudioFocus)"
            description="Detiene la reproducción automáticamente al recibir una llamada o alerta de voz."
            checked={settings.pauseOnCallInterruption}
            onChange={(v) => updateSettings({ pauseOnCallInterruption: v })}
          />
          <ToggleRow
            icon={Bluetooth}
            title="Pausa automática al desconectar Bluetooth"
            description="Evita que el audio suene por el altavoz si apagas tus auriculares inalámbricos."
            checked={settings.bluetoothAutoPause}
            onChange={(v) => updateSettings({ bluetoothAutoPause: v })}
          />
        </div>

        <p className="text-xs text-zinc-400 pt-1">
          Entorno actual:{' '}
          <span className="text-zinc-200 font-medium">
            {nativeAndroid
              ? 'Android nativo (Capacitor + MediaPlaybackService)'
              : 'Vista web compatible con Capacitor Android'}
          </span>
        </p>
      </section>

      {/* Local Storage */}
      <section className="rounded-2xl bg-[#121216] border border-white/[0.06] p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <HardDrive className="w-5 h-5 text-[#1DB954]" />
          <h2 className="font-display text-base font-bold text-white">
            Almacenamiento y biblioteca
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            <p className="text-xs text-zinc-400">Archivos importados</p>
            <p className="font-mono-tabular text-xl font-bold text-white mt-1">
              {storageStats.count}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            <p className="text-xs text-zinc-400">Espacio en biblioteca</p>
            <p className="font-mono-tabular text-xl font-bold text-white mt-1">
              {formatBytes(storageStats.totalBytes)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => setIsImportOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1DB954] hover:bg-[#1ED760] text-black text-xs font-semibold min-h-[42px]"
          >
            <FolderUp className="w-4 h-4" />
            <span>Importar más canciones</span>
          </button>

          <button
            type="button"
            disabled={history.length === 0}
            onClick={clearHistory}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.11] disabled:opacity-40 text-zinc-200 text-xs font-medium min-h-[42px]"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>Limpiar historial ({history.length})</span>
          </button>
        </div>
      </section>
    </div>
  );
}

function ToggleRow({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: typeof Radio;
  title: string;
  description: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <div className="py-3.5 flex items-center justify-between gap-4">
      <div className="flex items-start gap-3 min-w-0">
        <Icon className="w-4 h-4 text-zinc-400 mt-1 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-white">{title}</p>
          <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{description}</p>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
          checked ? 'bg-[#1DB954]' : 'bg-zinc-700'
        }`}
      >
        <span
          className={`block w-4 h-4 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
