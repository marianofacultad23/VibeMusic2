import { Preferences } from '@capacitor/preferences';
import { AppSettings, HistoryEntry, Playlist, Track } from '../types/music';
import { DEFAULT_PLAYLISTS } from '../data/catalog';

const DB_NAME = 'VibeMusicDB';
const DB_VERSION = 1;
const STORE_FILES = 'audioFiles';
const STORE_TRACKS = 'localTracks';

const KEYS = {
  PLAYLISTS: 'vibemusic_playlists',
  FAVORITES: 'vibemusic_favorites',
  SAVED_ALBUMS: 'vibemusic_saved_albums',
  HISTORY: 'vibemusic_history',
  SETTINGS: 'vibemusic_settings',
};

export const DEFAULT_SETTINGS: AppSettings = {
  eqPreset: 'flat',
  backgroundPlayback: true,
  pauseOnCallInterruption: true,
  bluetoothAutoPause: true,
  keepScreenAwakeInPlayer: false,
  highQualityAudio: true,
};

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_FILES)) {
        db.createObjectStore(STORE_FILES);
      }
      if (!db.objectStoreNames.contains(STORE_TRACKS)) {
        db.createObjectStore(STORE_TRACKS, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveLocalAudioFile(track: Track, fileBlob: Blob): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_FILES, STORE_TRACKS], 'readwrite');
    tx.objectStore(STORE_FILES).put(fileBlob, track.id);
    tx.objectStore(STORE_TRACKS).put(track);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

export async function getLocalAudioBlob(trackId: string): Promise<Blob | null> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_FILES, 'readonly');
    const req = tx.objectStore(STORE_FILES).get(trackId);
    req.onsuccess = () => {
      db.close();
      resolve((req.result as Blob) || null);
    };
    req.onerror = () => {
      db.close();
      reject(req.error);
    };
  });
}

export async function loadAllLocalTracks(): Promise<Track[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_TRACKS, 'readonly');
      const req = tx.objectStore(STORE_TRACKS).getAll();
      req.onsuccess = () => {
        db.close();
        const items = (req.result as Track[]) || [];
        resolve(items.sort((a, b) => b.addedAt - a.addedAt));
      };
      req.onerror = () => {
        db.close();
        reject(req.error);
      };
    });
  } catch {
    return [];
  }
}

export async function deleteLocalTrackFromDB(trackId: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_FILES, STORE_TRACKS], 'readwrite');
    tx.objectStore(STORE_FILES).delete(trackId);
    tx.objectStore(STORE_TRACKS).delete(trackId);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

export async function getLocalStorageStats(): Promise<{ count: number; totalBytes: number }> {
  const tracks = await loadAllLocalTracks();
  const totalBytes = tracks.reduce((sum, t) => sum + (t.fileSize || 0), 0);
  return { count: tracks.length, totalBytes };
}

async function setPref(key: string, value: unknown): Promise<void> {
  const json = JSON.stringify(value);
  try {
    localStorage.setItem(key, json);
  } catch {
    // Ignore quota errors in restricted webviews
  }
  try {
    await Preferences.set({ key, value: json });
  } catch {
    // Web fallback already handled by localStorage
  }
}

async function getPref<T>(key: string, fallback: T): Promise<T> {
  try {
    const { value } = await Preferences.get({ key });
    if (value) {
      return JSON.parse(value) as T;
    }
  } catch {
    // Fallback to localStorage
  }
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw) as T;
    }
  } catch {
    // Ignore parse errors
  }
  return fallback;
}

export async function loadPersistedState(): Promise<{
  playlists: Playlist[];
  favoriteIds: string[];
  savedAlbumIds: string[];
  history: HistoryEntry[];
  settings: AppSettings;
}> {
  const [playlists, favoriteIds, savedAlbumIds, history, settings] = await Promise.all([
    getPref<Playlist[]>(KEYS.PLAYLISTS, DEFAULT_PLAYLISTS),
    getPref<string[]>(KEYS.FAVORITES, ['track-1', 'track-3']),
    getPref<string[]>(KEYS.SAVED_ALBUMS, ['album-midnight-pulse', 'album-lofi-rain']),
    getPref<HistoryEntry[]>(KEYS.HISTORY, []),
    getPref<AppSettings>(KEYS.SETTINGS, DEFAULT_SETTINGS),
  ]);

  return {
    playlists: playlists.length > 0 ? playlists : DEFAULT_PLAYLISTS,
    favoriteIds,
    savedAlbumIds,
    history,
    settings: { ...DEFAULT_SETTINGS, ...settings },
  };
}

export const persistPlaylists = (playlists: Playlist[]) => setPref(KEYS.PLAYLISTS, playlists);
export const persistFavorites = (favoriteIds: string[]) => setPref(KEYS.FAVORITES, favoriteIds);
export const persistSavedAlbums = (albumIds: string[]) => setPref(KEYS.SAVED_ALBUMS, albumIds);
export const persistHistory = (history: HistoryEntry[]) => setPref(KEYS.HISTORY, history);
export const persistSettings = (settings: AppSettings) => setPref(KEYS.SETTINGS, settings);
