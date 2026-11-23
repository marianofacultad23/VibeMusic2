export type RepeatMode = 'off' | 'all' | 'one';

export type EqPreset = 'flat' | 'bass' | 'vocal' | 'electronic' | 'night';

export type NavTab = 'home' | 'search' | 'library' | 'favorites' | 'settings';

export type DetailViewState =
  | { type: 'album'; id: string }
  | { type: 'playlist'; id: string }
  | { type: 'artist'; id: string }
  | { type: 'category'; name: string }
  | null;

export interface SynthPreset {
  bpm: number;
  rootFreq: number;
  scale: number[];
  mood: 'chill' | 'pulse' | 'synth' | 'jazz' | 'ambient' | 'acoustic';
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  album: string;
  albumId?: string;
  duration: number; // seconds
  coverUrl?: string;
  category: string;
  isLocal: boolean;
  fileName?: string;
  fileFormat?: string;
  fileSize?: number;
  addedAt: number;
  synthPreset?: SynthPreset;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  year: number;
  coverUrl: string;
  category: string;
  accentColor: string;
}

export interface Artist {
  id: string;
  name: string;
  genre: string;
  bio: string;
  imageUrl: string;
  accentColor: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverUrl?: string;
  trackIds: string[];
  createdAt: number;
  updatedAt: number;
  isSystem?: boolean;
  accentColor?: string;
}

export interface HistoryEntry {
  trackId: string;
  playedAt: number;
}

export interface AppSettings {
  eqPreset: EqPreset;
  backgroundPlayback: boolean;
  pauseOnCallInterruption: boolean;
  bluetoothAutoPause: boolean;
  keepScreenAwakeInPlayer: boolean;
  highQualityAudio: boolean;
}
