import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ALBUMS, ARTISTS, CATALOG_TRACKS, DEFAULT_PLAYLISTS } from '../data/catalog';
import {
  registerAndroidLifecycle,
  registerMediaSessionHandlers,
  syncMediaSessionMetadata,
  syncMediaSessionPosition,
} from '../services/androidBridge';
import { extractAudioMetadata } from '../services/id3Parser';
import {
  DEFAULT_SETTINGS,
  deleteLocalTrackFromDB,
  getLocalAudioBlob,
  getLocalStorageStats,
  loadAllLocalTracks,
  loadPersistedState,
  persistFavorites,
  persistHistory,
  persistPlaylists,
  persistSavedAlbums,
  persistSettings,
  saveLocalAudioFile,
} from '../services/storage';
import { getSynthTrackUrl } from '../services/synthAudio';
import {
  AppSettings,
  DetailViewState,
  EqPreset,
  HistoryEntry,
  NavTab,
  Playlist,
  RepeatMode,
  Track,
} from '../types/music';

interface EqGains {
  low: number;
  mid: number;
  high: number;
}

const EQ_PRESETS: Record<EqPreset, EqGains> = {
  flat: { low: 0, mid: 0, high: 0 },
  bass: { low: 6, mid: -1, high: 1 },
  vocal: { low: -2, mid: 4, high: 2 },
  electronic: { low: 4, mid: -1, high: 4 },
  night: { low: 2, mid: 1, high: -3 },
};

interface PlayerContextValue {
  // Navigation & UI overlays
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  detailView: DetailViewState;
  setDetailView: (view: DetailViewState) => void;
  isFullPlayerOpen: boolean;
  setIsFullPlayerOpen: (open: boolean) => void;
  isQueueOpen: boolean;
  setIsQueueOpen: (open: boolean) => void;
  isImportOpen: boolean;
  setIsImportOpen: (open: boolean) => void;
  playlistPickerTrackId: string | null;
  setPlaylistPickerTrackId: (trackId: string | null) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Library Data
  allTracks: Track[];
  localTracks: Track[];
  playlists: Playlist[];
  favoriteIds: string[];
  savedAlbumIds: string[];
  history: HistoryEntry[];
  settings: AppSettings;
  storageStats: { count: number; totalBytes: number };
  isImporting: boolean;
  importProgress: { current: number; total: number } | null;

  // Playback State
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  shuffle: boolean;
  repeatMode: RepeatMode;
  sleepTimerRemaining: number | null;

  // Playback Actions
  playTrack: (track: Track, contextQueue?: Track[]) => Promise<void>;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  addToQueue: (track: Track, playNext?: boolean) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  setSleepTimer: (minutes: number | null) => void;

  // Library Actions
  toggleFavorite: (trackId: string) => void;
  toggleSaveAlbum: (albumId: string) => void;
  createPlaylist: (name: string, description: string, initialTrackId?: string) => Playlist;
  updatePlaylist: (id: string, name: string, description: string) => void;
  deletePlaylist: (id: string) => void;
  addTrackToPlaylist: (playlistId: string, trackId: string) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  importAudioFiles: (files: FileList | File[]) => Promise<number>;
  removeLocalTrack: (trackId: string) => Promise<void>;
  clearHistory: () => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  getTrackById: (id: string) => Track | undefined;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [detailView, setDetailView] = useState<DetailViewState>(null);
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [playlistPickerTrackId, setPlaylistPickerTrackId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [localTracks, setLocalTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>(DEFAULT_PLAYLISTS);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(['track-1', 'track-3']);
  const [savedAlbumIds, setSavedAlbumIds] = useState<string[]>([
    'album-midnight-pulse',
    'album-lofi-rain',
  ]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [storageStats, setStorageStats] = useState({ count: 0, totalBytes: 0 });
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(
    null
  );

  // Playback state
  const [queue, setQueue] = useState<Track[]>(CATALOG_TRACKS.slice(0, 6));
  const [queueIndex, setQueueIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(CATALOG_TRACKS[0].duration);
  const [volume, setVolumeState] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlCacheRef = useRef<Map<string, string>>(new Map());
  const toastTimerRef = useRef<number | null>(null);

  // Web Audio EQ nodes (created lazily on demand)
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const lowFilterRef = useRef<BiquadFilterNode | null>(null);
  const midFilterRef = useRef<BiquadFilterNode | null>(null);
  const highFilterRef = useRef<BiquadFilterNode | null>(null);

  const allTracks = useMemo(() => [...localTracks, ...CATALOG_TRACKS], [localTracks]);
  const currentTrack = queue[queueIndex] || null;

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  const getTrackById = useCallback(
    (id: string) => allTracks.find((t) => t.id === id),
    [allTracks]
  );

  // Hydrate persisted state & IndexedDB local tracks
  useEffect(() => {
    let mounted = true;
    (async () => {
      const [persisted, locals, stats] = await Promise.all([
        loadPersistedState(),
        loadAllLocalTracks(),
        getLocalStorageStats(),
      ]);
      if (!mounted) return;
      setPlaylists(persisted.playlists);
      setFavoriteIds(persisted.favoriteIds);
      setSavedAlbumIds(persisted.savedAlbumIds);
      setHistory(persisted.history);
      setSettings(persisted.settings);
      setLocalTracks(locals);
      setStorageStats(stats);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Create persistent HTML5 Audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.volume = volume;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
      blobUrlCacheRef.current.forEach((url) => URL.revokeObjectURL(url));
      blobUrlCacheRef.current.clear();
    };
  }, []);

  // Initialize or update Web Audio 3-band EQ safely
  const applyEqPreset = useCallback((preset: EqPreset) => {
    const gains = EQ_PRESETS[preset];
    if (!audioRef.current) return;

    // Only build Web Audio graph when user selects a non-flat EQ or if already built
    if (preset === 'flat' && !audioCtxRef.current) {
      return;
    }

    try {
      if (!audioCtxRef.current) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const source = ctx.createMediaElementSource(audioRef.current);
        const low = ctx.createBiquadFilter();
        low.type = 'lowshelf';
        low.frequency.value = 120;

        const mid = ctx.createBiquadFilter();
        mid.type = 'peaking';
        mid.frequency.value = 1000;
        mid.Q.value = 1.0;

        const high = ctx.createBiquadFilter();
        high.type = 'highshelf';
        high.frequency.value = 8000;

        source.connect(low);
        low.connect(mid);
        mid.connect(high);
        high.connect(ctx.destination);

        audioCtxRef.current = ctx;
        sourceNodeRef.current = source;
        lowFilterRef.current = low;
        midFilterRef.current = mid;
        highFilterRef.current = high;
      }

      if (lowFilterRef.current && midFilterRef.current && highFilterRef.current) {
        lowFilterRef.current.gain.value = gains.low;
        midFilterRef.current.gain.value = gains.mid;
        highFilterRef.current.gain.value = gains.high;
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
      }
    } catch {
      // Fallback safely to native <audio> output
    }
  }, []);

  useEffect(() => {
    applyEqPreset(settings.eqPreset);
  }, [settings.eqPreset, applyEqPreset]);

  const resolveAudioSource = useCallback(async (track: Track): Promise<string> => {
    if (!track.isLocal) {
      return getSynthTrackUrl(track.id, track.synthPreset);
    }
    const cached = blobUrlCacheRef.current.get(track.id);
    if (cached) return cached;

    const blob = await getLocalAudioBlob(track.id);
    if (!blob) {
      throw new Error('Archivo de audio no encontrado en la biblioteca local.');
    }
    const url = URL.createObjectURL(blob);
    blobUrlCacheRef.current.set(track.id, url);
    return url;
  }, []);

  const recordHistory = useCallback((trackId: string) => {
    setHistory((prev) => {
      const filtered = prev.filter((item) => item.trackId !== trackId);
      const next = [{ trackId, playedAt: Date.now() }, ...filtered].slice(0, 50);
      persistHistory(next);
      return next;
    });
  }, []);

  const loadAndPlayIndex = useCallback(
    async (targetQueue: Track[], idx: number) => {
      const track = targetQueue[idx];
      const audio = audioRef.current;
      if (!track || !audio) return;

      try {
        if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
          await audioCtxRef.current.resume().catch(() => {});
        }
        const src = await resolveAudioSource(track);
        if (audio.src !== src) {
          audio.src = src;
        }
        audio.currentTime = 0;
        setCurrentTime(0);
        setDuration(track.duration || 0);
        await audio.play();
        setIsPlaying(true);
        recordHistory(track.id);
        syncMediaSessionMetadata(track, true);
      } catch (err) {
        setIsPlaying(false);
        showToast(
          err instanceof Error ? err.message : 'No se pudo reproducir la pista seleccionada.'
        );
      }
    },
    [resolveAudioSource, recordHistory, showToast]
  );

  const playTrack = useCallback(
    async (track: Track, contextQueue?: Track[]) => {
      let nextQueue = queue;
      let nextIdx = queue.findIndex((t) => t.id === track.id);

      if (contextQueue && contextQueue.length > 0) {
        nextQueue = contextQueue;
        nextIdx = contextQueue.findIndex((t) => t.id === track.id);
        if (nextIdx === -1) {
          nextQueue = [track, ...contextQueue];
          nextIdx = 0;
        }
      } else if (nextIdx === -1) {
        nextQueue = [track, ...queue];
        nextIdx = 0;
      }

      setQueue(nextQueue);
      setQueueIndex(nextIdx);
      await loadAndPlayIndex(nextQueue, nextIdx);
    },
    [queue, loadAndPlayIndex]
  );

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      syncMediaSessionMetadata(currentTrack, false);
    } else {
      try {
        if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
          await audioCtxRef.current.resume().catch(() => {});
        }
        if (!audio.src) {
          await loadAndPlayIndex(queue, queueIndex);
          return;
        }
        await audio.play();
        setIsPlaying(true);
        syncMediaSessionMetadata(currentTrack, true);
      } catch {
        await loadAndPlayIndex(queue, queueIndex);
      }
    }
  }, [currentTrack, isPlaying, loadAndPlayIndex, queue, queueIndex]);

  const nextTrack = useCallback(() => {
    if (queue.length === 0) return;

    if (repeatMode === 'one') {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        setIsPlaying(true);
      }
      return;
    }

    let nextIdx: number;
    if (shuffle && queue.length > 1) {
      do {
        nextIdx = Math.floor(Math.random() * queue.length);
      } while (nextIdx === queueIndex);
    } else {
      nextIdx = queueIndex + 1;
      if (nextIdx >= queue.length) {
        if (repeatMode === 'all') {
          nextIdx = 0;
        } else {
          setIsPlaying(false);
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
          setCurrentTime(0);
          syncMediaSessionMetadata(currentTrack, false);
          return;
        }
      }
    }

    setQueueIndex(nextIdx);
    loadAndPlayIndex(queue, nextIdx);
  }, [queue, queueIndex, repeatMode, shuffle, loadAndPlayIndex, currentTrack]);

  const prevTrack = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || queue.length === 0) return;

    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    const prevIdx = queueIndex - 1 < 0 ? queue.length - 1 : queueIndex - 1;
    setQueueIndex(prevIdx);
    loadAndPlayIndex(queue, prevIdx);
  }, [queue, queueIndex, loadAndPlayIndex]);

  const seekTo = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const clamped = Math.max(0, Math.min(seconds, audio.duration || duration || 0));
    audio.currentTime = clamped;
    setCurrentTime(clamped);
    syncMediaSessionPosition(audio.duration || duration, clamped, !audio.paused);
  }, [duration]);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    setIsMuted(clamped === 0);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
      audioRef.current.muted = clamped === 0;
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (audioRef.current) {
        audioRef.current.muted = next;
      }
      return next;
    });
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffle((prev) => {
      const next = !prev;
      showToast(next ? 'Modo aleatorio activado' : 'Modo aleatorio desactivado');
      return next;
    });
  }, [showToast]);

  const cycleRepeat = useCallback(() => {
    setRepeatMode((prev) => {
      const next: RepeatMode = prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off';
      const labels: Record<RepeatMode, string> = {
        off: 'Repetición desactivada',
        all: 'Repetir toda la cola',
        one: 'Repetir canción actual',
      };
      showToast(labels[next]);
      return next;
    });
  }, [showToast]);

  const addToQueue = useCallback(
    (track: Track, playNext = false) => {
      setQueue((prev) => {
        if (prev.length === 0) return [track];
        const copy = [...prev];
        if (playNext) {
          copy.splice(queueIndex + 1, 0, track);
        } else {
          copy.push(track);
        }
        return copy;
      });
      showToast(playNext ? `"${track.title}" sonará a continuación` : `"${track.title}" añadida a la cola`);
    },
    [queueIndex, showToast]
  );

  const removeFromQueue = useCallback(
    (index: number) => {
      if (index === queueIndex) return;
      setQueue((prev) => prev.filter((_, i) => i !== index));
      if (index < queueIndex) {
        setQueueIndex((i) => Math.max(0, i - 1));
      }
    },
    [queueIndex]
  );

  const clearQueue = useCallback(() => {
    if (!currentTrack) {
      setQueue([]);
      setQueueIndex(0);
      return;
    }
    setQueue([currentTrack]);
    setQueueIndex(0);
    showToast('Cola de reproducción limpiada');
  }, [currentTrack, showToast]);

  // Wire HTML5 audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onLoadedMetadata = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
        syncMediaSessionPosition(audio.duration, audio.currentTime, !audio.paused);
      }
    };

    const onEnded = () => {
      nextTrack();
    };

    // Handles OS audio focus interruptions (incoming phone calls, Bluetooth disconnect)
    const onPause = () => {
      setIsPlaying(false);
      syncMediaSessionMetadata(currentTrack, false);
    };

    const onPlay = () => {
      setIsPlaying(true);
      syncMediaSessionMetadata(currentTrack, true);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('play', onPlay);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('play', onPlay);
    };
  }, [nextTrack, currentTrack]);

  // Periodically sync MediaSession position bar on Android notification/lock-screen
  useEffect(() => {
    if (!isPlaying) return;
    const id = window.setInterval(() => {
      const audio = audioRef.current;
      if (audio && Number.isFinite(audio.duration) && audio.duration > 0) {
        syncMediaSessionPosition(audio.duration, audio.currentTime, true);
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [isPlaying]);

  // MediaSession + Android Native Media Button handlers
  useEffect(() => {
    return registerMediaSessionHandlers({
      onPlay: () => {
        if (!isPlaying) togglePlay();
      },
      onPause: () => {
        if (isPlaying) togglePlay();
      },
      onNext: nextTrack,
      onPrevious: prevTrack,
      onSeekTo: seekTo,
    });
  }, [isPlaying, togglePlay, nextTrack, prevTrack, seekTo]);

  // Android App Lifecycle & Hardware Back Button
  useEffect(() => {
    return registerAndroidLifecycle({
      onAppResume: () => {
        if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume().catch(() => {});
        }
      },
      onBackButton: () => {
        if (playlistPickerTrackId) {
          setPlaylistPickerTrackId(null);
          return true;
        }
        if (isImportOpen) {
          setIsImportOpen(false);
          return true;
        }
        if (isQueueOpen) {
          setIsQueueOpen(false);
          return true;
        }
        if (isFullPlayerOpen) {
          setIsFullPlayerOpen(false);
          return true;
        }
        if (detailView) {
          setDetailView(null);
          return true;
        }
        if (activeTab !== 'home') {
          setActiveTab('home');
          return true;
        }
        return false;
      },
    });
  }, [playlistPickerTrackId, isImportOpen, isQueueOpen, isFullPlayerOpen, detailView, activeTab]);

  // Sleep Timer countdown
  useEffect(() => {
    if (sleepTimerRemaining === null) return;
    if (sleepTimerRemaining <= 0) {
      if (isPlaying && audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      setSleepTimerRemaining(null);
      showToast('Temporizador finalizado · Música pausada');
      return;
    }
    const id = window.setInterval(() => {
      setSleepTimerRemaining((s) => (s !== null ? s - 1 : null));
    }, 1000);
    return () => window.clearInterval(id);
  }, [sleepTimerRemaining, isPlaying, showToast]);

  const setSleepTimer = useCallback(
    (minutes: number | null) => {
      if (minutes === null) {
        setSleepTimerRemaining(null);
        showToast('Temporizador desactivado');
      } else {
        setSleepTimerRemaining(minutes * 60);
        showToast(`Temporizador activado: ${minutes} min`);
      }
    },
    [showToast]
  );

  // Favorites, Albums, Playlists, Local Library
  const toggleFavorite = useCallback(
    (trackId: string) => {
      setFavoriteIds((prev) => {
        const exists = prev.includes(trackId);
        const next = exists ? prev.filter((id) => id !== trackId) : [trackId, ...prev];
        persistFavorites(next);
        showToast(exists ? 'Quitada de Favoritos' : 'Guardada en Favoritos');
        return next;
      });
    },
    [showToast]
  );

  const toggleSaveAlbum = useCallback(
    (albumId: string) => {
      setSavedAlbumIds((prev) => {
        const exists = prev.includes(albumId);
        const next = exists ? prev.filter((id) => id !== albumId) : [albumId, ...prev];
        persistSavedAlbums(next);
        const album = ALBUMS.find((a) => a.id === albumId);
        showToast(
          exists
            ? `${album?.title || 'Álbum'} eliminado de tu biblioteca`
            : `${album?.title || 'Álbum'} guardado en tu biblioteca`
        );
        return next;
      });
    },
    [showToast]
  );

  const createPlaylist = useCallback(
    (name: string, description: string, initialTrackId?: string): Playlist => {
      const now = Date.now();
      const newPlaylist: Playlist = {
        id: `playlist-${now}-${Math.random().toString(36).slice(2, 6)}`,
        name: name.trim() || 'Nueva playlist',
        description: description.trim() || 'Playlist creada en VibeMusic',
        trackIds: initialTrackId ? [initialTrackId] : [],
        createdAt: now,
        updatedAt: now,
        accentColor: '#1DB954',
      };
      setPlaylists((prev) => {
        const next = [newPlaylist, ...prev];
        persistPlaylists(next);
        return next;
      });
      showToast(`Playlist "${newPlaylist.name}" creada`);
      return newPlaylist;
    },
    [showToast]
  );

  const updatePlaylist = useCallback(
    (id: string, name: string, description: string) => {
      setPlaylists((prev) => {
        const next = prev.map((pl) =>
          pl.id === id
            ? {
                ...pl,
                name: name.trim() || pl.name,
                description: description.trim(),
                updatedAt: Date.now(),
              }
            : pl
        );
        persistPlaylists(next);
        return next;
      });
      showToast('Playlist actualizada');
    },
    [showToast]
  );

  const deletePlaylist = useCallback(
    (id: string) => {
      setPlaylists((prev) => {
        const next = prev.filter((pl) => pl.id !== id);
        persistPlaylists(next);
        return next;
      });
      if (detailView?.type === 'playlist' && detailView.id === id) {
        setDetailView(null);
      }
      showToast('Playlist eliminada');
    },
    [detailView, showToast]
  );

  const addTrackToPlaylist = useCallback(
    (playlistId: string, trackId: string) => {
      setPlaylists((prev) => {
        const next = prev.map((pl) => {
          if (pl.id !== playlistId) return pl;
          if (pl.trackIds.includes(trackId)) return pl;
          return {
            ...pl,
            trackIds: [...pl.trackIds, trackId],
            updatedAt: Date.now(),
          };
        });
        persistPlaylists(next);
        return next;
      });
      const pl = playlists.find((p) => p.id === playlistId);
      showToast(`Añadida a "${pl?.name || 'playlist'}"`);
    },
    [playlists, showToast]
  );

  const removeTrackFromPlaylist = useCallback(
    (playlistId: string, trackId: string) => {
      setPlaylists((prev) => {
        const next = prev.map((pl) =>
          pl.id === playlistId
            ? { ...pl, trackIds: pl.trackIds.filter((id) => id !== trackId), updatedAt: Date.now() }
            : pl
        );
        persistPlaylists(next);
        return next;
      });
      showToast('Canción quitada de la playlist');
    },
    [showToast]
  );

  const importAudioFiles = useCallback(
    async (fileList: FileList | File[]): Promise<number> => {
      const files = Array.from(fileList).filter(
        (f) =>
          f.type.startsWith('audio/') ||
          /\.(mp3|wav|ogg|m4a|aac|flac|opus|webm)$/i.test(f.name)
      );
      if (files.length === 0) {
        showToast('Selecciona archivos de audio compatibles (MP3, WAV, M4A, OGG, FLAC).');
        return 0;
      }

      setIsImporting(true);
      setImportProgress({ current: 0, total: files.length });

      const imported: Track[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setImportProgress({ current: i + 1, total: files.length });
        try {
          const meta = await extractAudioMetadata(file);
          const track: Track = {
            id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            title: meta.title,
            artist: meta.artist,
            album: meta.album,
            duration: meta.duration,
            coverUrl: meta.coverUrl,
            category: 'Local',
            isLocal: true,
            fileName: file.name,
            fileFormat: meta.fileFormat,
            fileSize: file.size,
            addedAt: Date.now() + i,
          };
          await saveLocalAudioFile(track, file);
          imported.push(track);
        } catch {
          // Continue remaining files even if one fails
        }
      }

      if (imported.length > 0) {
        setLocalTracks((prev) => [...imported.reverse(), ...prev]);
        const stats = await getLocalStorageStats();
        setStorageStats(stats);
        showToast(
          imported.length === 1
            ? `"${imported[0].title}" importada a tu biblioteca`
            : `${imported.length} canciones importadas a tu biblioteca`
        );
      }

      setIsImporting(false);
      setImportProgress(null);
      return imported.length;
    },
    [showToast]
  );

  const removeLocalTrack = useCallback(
    async (trackId: string) => {
      // Only deletes VibeMusic's internal IndexedDB copy, never the original device file
      await deleteLocalTrackFromDB(trackId);
      const cachedUrl = blobUrlCacheRef.current.get(trackId);
      if (cachedUrl) {
        URL.revokeObjectURL(cachedUrl);
        blobUrlCacheRef.current.delete(trackId);
      }

      setLocalTracks((prev) => prev.filter((t) => t.id !== trackId));
      setFavoriteIds((prev) => {
        const next = prev.filter((id) => id !== trackId);
        persistFavorites(next);
        return next;
      });
      setPlaylists((prev) => {
        const next = prev.map((pl) => ({
          ...pl,
          trackIds: pl.trackIds.filter((id) => id !== trackId),
        }));
        persistPlaylists(next);
        return next;
      });
      setHistory((prev) => {
        const next = prev.filter((h) => h.trackId !== trackId);
        persistHistory(next);
        return next;
      });
      setQueue((prev) => prev.filter((t) => t.id !== trackId));

      const stats = await getLocalStorageStats();
      setStorageStats(stats);
      showToast('Quitada de la biblioteca (archivo original intacto)');
    },
    [showToast]
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
    persistHistory([]);
    showToast('Historial de reproducción borrado');
  }, [showToast]);

  const updateSettings = useCallback(
    (patch: Partial<AppSettings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...patch };
        persistSettings(next);
        return next;
      });
    },
    []
  );

  // Keep references to ARTISTS/ALBUMS accessible via module exports
  void ARTISTS;

  const value: PlayerContextValue = {
    activeTab,
    setActiveTab,
    detailView,
    setDetailView,
    isFullPlayerOpen,
    setIsFullPlayerOpen,
    isQueueOpen,
    setIsQueueOpen,
    isImportOpen,
    setIsImportOpen,
    playlistPickerTrackId,
    setPlaylistPickerTrackId,
    toastMessage,
    showToast,
    allTracks,
    localTracks,
    playlists,
    favoriteIds,
    savedAlbumIds,
    history,
    settings,
    storageStats,
    isImporting,
    importProgress,
    currentTrack,
    queue,
    queueIndex,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    shuffle,
    repeatMode,
    sleepTimerRemaining,
    playTrack,
    togglePlay,
    nextTrack,
    prevTrack,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    addToQueue,
    removeFromQueue,
    clearQueue,
    setSleepTimer,
    toggleFavorite,
    toggleSaveAlbum,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    importAudioFiles,
    removeLocalTrack,
    clearHistory,
    updateSettings,
    getTrackById,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used inside PlayerProvider');
  return ctx;
}
