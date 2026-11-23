import { Album, Artist, Playlist, Track } from '../types/music';

export const COVER_MIDNIGHT_PULSE = '/src/assets/images/cover_midnight_pulse_1795454757229.jpg';
export const COVER_LOFI_RAIN = '/src/assets/images/cover_lofi_rain_1795454757576.jpg';
export const COVER_NEON_HORIZON = '/src/assets/images/cover_neon_horizon_1795454756675.jpg';
export const COVER_VELVET_JAZZ = '/src/assets/images/cover_velvet_jazz_1795454756777.jpg';
export const COVER_DEEP_FOCUS = '/src/assets/images/cover_deep_focus_1795454756794.jpg';
export const COVER_ACOUSTIC_DAWN = '/src/assets/images/cover_acoustic_dawn_1795454757051.jpg';

export interface MusicCategory {
  name: string;
  subtitle: string;
  gradient: string;
  coverUrl: string;
}

export const CATEGORIES: MusicCategory[] = [
  {
    name: 'Electrónica',
    subtitle: 'Ritmos profundos y sintetizadores',
    gradient: 'from-emerald-900/80 to-zinc-900',
    coverUrl: COVER_MIDNIGHT_PULSE,
  },
  {
    name: 'Lo-Fi',
    subtitle: 'Beats cálidos para estudiar o descansar',
    gradient: 'from-amber-900/70 to-zinc-900',
    coverUrl: COVER_LOFI_RAIN,
  },
  {
    name: 'Synthwave',
    subtitle: 'Horizontes nocturnos y bajos analógicos',
    gradient: 'from-teal-900/75 to-zinc-900',
    coverUrl: COVER_NEON_HORIZON,
  },
  {
    name: 'Jazz & Soul',
    subtitle: 'Sesiones de cinta analógica y metales',
    gradient: 'from-stone-800/80 to-zinc-900',
    coverUrl: COVER_VELVET_JAZZ,
  },
  {
    name: 'Focus',
    subtitle: 'Texturas minimalistas de concentración',
    gradient: 'from-slate-800/80 to-zinc-900',
    coverUrl: COVER_DEEP_FOCUS,
  },
  {
    name: 'Acústica',
    subtitle: 'Cuerdas limpias y mañanas tranquilas',
    gradient: 'from-orange-900/70 to-zinc-900',
    coverUrl: COVER_ACOUSTIC_DAWN,
  },
];

export const ARTISTS: Artist[] = [
  {
    id: 'artist-kairo',
    name: 'Kairo Vance',
    genre: 'Electrónica',
    bio: 'Productor de electrónica atmosférica y diseño sonoro analógico radicado en Berlín.',
    imageUrl: COVER_MIDNIGHT_PULSE,
    accentColor: '#1DB954',
  },
  {
    id: 'artist-mira',
    name: 'Mira Sato',
    genre: 'Lo-Fi',
    bio: 'Compositora de beats lo-fi grabados en cinta con pianos eléctricos y lluvia urbana.',
    imageUrl: COVER_LOFI_RAIN,
    accentColor: '#D97706',
  },
  {
    id: 'artist-solaris',
    name: 'Solaris Drive',
    genre: 'Synthwave',
    bio: 'Dúo de synthwave nocturno enfocado en bajos profundos y paisajes cinematográficos.',
    imageUrl: COVER_NEON_HORIZON,
    accentColor: '#10B981',
  },
  {
    id: 'artist-nocturne',
    name: 'Elías Navarro Quartet',
    genre: 'Jazz & Soul',
    bio: 'Cuarteto contemporáneo que mezcla jazz de club nocturno con grabación en bobina abierta.',
    imageUrl: COVER_VELVET_JAZZ,
    accentColor: '#CA8A04',
  },
  {
    id: 'artist-monolith',
    name: 'Studio Monolith',
    genre: 'Focus',
    bio: 'Arquitecturas sonoras minimalistas pensadas para sesiones largas de estudio y código.',
    imageUrl: COVER_DEEP_FOCUS,
    accentColor: '#64748B',
  },
  {
    id: 'artist-clara',
    name: 'Clara Luz',
    genre: 'Acústica',
    bio: 'Cantautora y guitarrista acústica con grabaciones íntimas a una sola toma.',
    imageUrl: COVER_ACOUSTIC_DAWN,
    accentColor: '#EA580C',
  },
];

export const ALBUMS: Album[] = [
  {
    id: 'album-midnight-pulse',
    title: 'Obsidian Signal',
    artist: 'Kairo Vance',
    artistId: 'artist-kairo',
    year: 2026,
    coverUrl: COVER_MIDNIGHT_PULSE,
    category: 'Electrónica',
    accentColor: '#1DB954',
  },
  {
    id: 'album-lofi-rain',
    title: 'Estudio Bajo Lluvia',
    artist: 'Mira Sato',
    artistId: 'artist-mira',
    year: 2026,
    coverUrl: COVER_LOFI_RAIN,
    category: 'Lo-Fi',
    accentColor: '#D97706',
  },
  {
    id: 'album-neon-horizon',
    title: 'Marea de Cromo',
    artist: 'Solaris Drive',
    artistId: 'artist-solaris',
    year: 2025,
    coverUrl: COVER_NEON_HORIZON,
    category: 'Synthwave',
    accentColor: '#10B981',
  },
  {
    id: 'album-velvet-jazz',
    title: 'Cinta 04: Medianoche',
    artist: 'Elías Navarro Quartet',
    artistId: 'artist-nocturne',
    year: 2025,
    coverUrl: COVER_VELVET_JAZZ,
    category: 'Jazz & Soul',
    accentColor: '#CA8A04',
  },
  {
    id: 'album-deep-focus',
    title: 'Estructuras Lunares',
    artist: 'Studio Monolith',
    artistId: 'artist-monolith',
    year: 2026,
    coverUrl: COVER_DEEP_FOCUS,
    category: 'Focus',
    accentColor: '#64748B',
  },
  {
    id: 'album-acoustic-dawn',
    title: 'Luz de Ventana',
    artist: 'Clara Luz',
    artistId: 'artist-clara',
    year: 2026,
    coverUrl: COVER_ACOUSTIC_DAWN,
    category: 'Acústica',
    accentColor: '#EA580C',
  },
];

export const CATALOG_TRACKS: Track[] = [
  {
    id: 'track-1',
    title: 'Pulso de Obsidiana',
    artist: 'Kairo Vance',
    artistId: 'artist-kairo',
    album: 'Obsidian Signal',
    albumId: 'album-midnight-pulse',
    duration: 24,
    coverUrl: COVER_MIDNIGHT_PULSE,
    category: 'Electrónica',
    isLocal: false,
    addedAt: 1700000001000,
    synthPreset: {
      bpm: 120,
      rootFreq: 110, // A2
      scale: [0, 3, 7, 10, 12],
      mood: 'pulse',
    },
  },
  {
    id: 'track-2',
    title: 'Refracción Verde',
    artist: 'Kairo Vance',
    artistId: 'artist-kairo',
    album: 'Obsidian Signal',
    albumId: 'album-midnight-pulse',
    duration: 24,
    coverUrl: COVER_MIDNIGHT_PULSE,
    category: 'Electrónica',
    isLocal: false,
    addedAt: 1700000002000,
    synthPreset: {
      bpm: 124,
      rootFreq: 130.81, // C3
      scale: [0, 3, 5, 7, 10],
      mood: 'pulse',
    },
  },
  {
    id: 'track-3',
    title: 'Lámpara y Cristal',
    artist: 'Mira Sato',
    artistId: 'artist-mira',
    album: 'Estudio Bajo Lluvia',
    albumId: 'album-lofi-rain',
    duration: 24,
    coverUrl: COVER_LOFI_RAIN,
    category: 'Lo-Fi',
    isLocal: false,
    addedAt: 1700000003000,
    synthPreset: {
      bpm: 82,
      rootFreq: 174.61, // F3
      scale: [0, 4, 7, 11, 14],
      mood: 'chill',
    },
  },
  {
    id: 'track-4',
    title: 'Café de las 2 AM',
    artist: 'Mira Sato',
    artistId: 'artist-mira',
    album: 'Estudio Bajo Lluvia',
    albumId: 'album-lofi-rain',
    duration: 24,
    coverUrl: COVER_LOFI_RAIN,
    category: 'Lo-Fi',
    isLocal: false,
    addedAt: 1700000004000,
    synthPreset: {
      bpm: 78,
      rootFreq: 146.83, // D3
      scale: [0, 3, 7, 10, 14],
      mood: 'chill',
    },
  },
  {
    id: 'track-5',
    title: 'Faro del Océano',
    artist: 'Solaris Drive',
    artistId: 'artist-solaris',
    album: 'Marea de Cromo',
    albumId: 'album-neon-horizon',
    duration: 24,
    coverUrl: COVER_NEON_HORIZON,
    category: 'Synthwave',
    isLocal: false,
    addedAt: 1700000005000,
    synthPreset: {
      bpm: 112,
      rootFreq: 98.0, // G2
      scale: [0, 2, 3, 7, 10],
      mood: 'synth',
    },
  },
  {
    id: 'track-6',
    title: 'Crepúsculo Analógico',
    artist: 'Solaris Drive',
    artistId: 'artist-solaris',
    album: 'Marea de Cromo',
    albumId: 'album-neon-horizon',
    duration: 24,
    coverUrl: COVER_NEON_HORIZON,
    category: 'Synthwave',
    isLocal: false,
    addedAt: 1700000006000,
    synthPreset: {
      bpm: 108,
      rootFreq: 123.47, // B2
      scale: [0, 2, 4, 7, 9],
      mood: 'synth',
    },
  },
  {
    id: 'track-7',
    title: 'Bobina Abierta',
    artist: 'Elías Navarro Quartet',
    artistId: 'artist-nocturne',
    album: 'Cinta 04: Medianoche',
    albumId: 'album-velvet-jazz',
    duration: 24,
    coverUrl: COVER_VELVET_JAZZ,
    category: 'Jazz & Soul',
    isLocal: false,
    addedAt: 1700000007000,
    synthPreset: {
      bpm: 90,
      rootFreq: 164.81, // E3
      scale: [0, 3, 7, 10, 14],
      mood: 'jazz',
    },
  },
  {
    id: 'track-8',
    title: 'Humos de Latón',
    artist: 'Elías Navarro Quartet',
    artistId: 'artist-nocturne',
    album: 'Cinta 04: Medianoche',
    albumId: 'album-velvet-jazz',
    duration: 24,
    coverUrl: COVER_VELVET_JAZZ,
    category: 'Jazz & Soul',
    isLocal: false,
    addedAt: 1700000008000,
    synthPreset: {
      bpm: 86,
      rootFreq: 196.0, // G3
      scale: [0, 4, 7, 11, 14],
      mood: 'jazz',
    },
  },
  {
    id: 'track-9',
    title: 'Arco de Hormigón',
    artist: 'Studio Monolith',
    artistId: 'artist-monolith',
    album: 'Estructuras Lunares',
    albumId: 'album-deep-focus',
    duration: 24,
    coverUrl: COVER_DEEP_FOCUS,
    category: 'Focus',
    isLocal: false,
    addedAt: 1700000009000,
    synthPreset: {
      bpm: 72,
      rootFreq: 110.0, // A2
      scale: [0, 2, 7, 9, 12],
      mood: 'ambient',
    },
  },
  {
    id: 'track-10',
    title: 'Silencio Orbital',
    artist: 'Studio Monolith',
    artistId: 'artist-monolith',
    album: 'Estructuras Lunares',
    albumId: 'album-deep-focus',
    duration: 24,
    coverUrl: COVER_DEEP_FOCUS,
    category: 'Focus',
    isLocal: false,
    addedAt: 1700000010000,
    synthPreset: {
      bpm: 68,
      rootFreq: 130.81, // C3
      scale: [0, 4, 7, 9, 12],
      mood: 'ambient',
    },
  },
  {
    id: 'track-11',
    title: 'Mañana en Madera',
    artist: 'Clara Luz',
    artistId: 'artist-clara',
    album: 'Luz de Ventana',
    albumId: 'album-acoustic-dawn',
    duration: 24,
    coverUrl: COVER_ACOUSTIC_DAWN,
    category: 'Acústica',
    isLocal: false,
    addedAt: 1700000011000,
    synthPreset: {
      bpm: 94,
      rootFreq: 196.0, // G3
      scale: [0, 2, 4, 7, 9],
      mood: 'acoustic',
    },
  },
  {
    id: 'track-12',
    title: 'Cuerda Dorada',
    artist: 'Clara Luz',
    artistId: 'artist-clara',
    album: 'Luz de Ventana',
    albumId: 'album-acoustic-dawn',
    duration: 24,
    coverUrl: COVER_ACOUSTIC_DAWN,
    category: 'Acústica',
    isLocal: false,
    addedAt: 1700000012000,
    synthPreset: {
      bpm: 88,
      rootFreq: 146.83, // D3
      scale: [0, 4, 7, 9, 12],
      mood: 'acoustic',
    },
  },
];

export const DEFAULT_PLAYLISTS: Playlist[] = [
  {
    id: 'playlist-late-night',
    name: 'Sesión Nocturna',
    description: 'Electrónica oscura, synthwave y beats atmosféricos para la madrugada.',
    coverUrl: COVER_MIDNIGHT_PULSE,
    trackIds: ['track-1', 'track-5', 'track-2', 'track-6'],
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
    accentColor: '#1DB954',
  },
  {
    id: 'playlist-deep-coding',
    name: 'Concentración Profunda',
    description: 'Lo-Fi y paisajes minimalistas diseñados para trabajar sin distracciones.',
    coverUrl: COVER_DEEP_FOCUS,
    trackIds: ['track-3', 'track-9', 'track-4', 'track-10'],
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
    accentColor: '#64748B',
  },
  {
    id: 'playlist-vinyl-lounge',
    name: 'Lounge Analógico',
    description: 'Jazz de estudio y guitarra acústica con calidez de cinta magnética.',
    coverUrl: COVER_VELVET_JAZZ,
    trackIds: ['track-7', 'track-11', 'track-8', 'track-12'],
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
    accentColor: '#CA8A04',
  },
];
