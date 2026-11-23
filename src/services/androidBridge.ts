import { App } from '@capacitor/app';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { Track } from '../types/music';

interface VibeMusicAudioPlugin {
  syncMetadata(options: {
    title: string;
    artist: string;
    album: string;
    isPlaying: boolean;
    duration: number;
    position: number;
  }): Promise<void>;
  setPlaybackState(options: { isPlaying: boolean; position: number }): Promise<void>;
  stopService(): Promise<void>;
  addListener(
    eventName: 'mediaCommand',
    listenerFunc: (data: { command: 'play' | 'pause' | 'next' | 'previous' | 'toggle' | 'audioFocusLoss' | 'becomingNoisy' }) => void
  ): Promise<{ remove: () => void }>;
}

const VibeMusicAudio = registerPlugin<VibeMusicAudioPlugin>('VibeMusicAudio');

export const isNativeAndroid = (): boolean =>
  Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';

export function syncMediaSessionMetadata(track: Track | null, isPlaying: boolean): void {
  if ('mediaSession' in navigator) {
    if (track) {
      const artwork: MediaImage[] = track.coverUrl
        ? [
            { src: track.coverUrl, sizes: '256x256', type: 'image/jpeg' },
            { src: track.coverUrl, sizes: '512x512', type: 'image/jpeg' },
          ]
        : [];

      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: track.title,
          artist: track.artist,
          album: track.album || 'VibeMusic',
          artwork,
        });
      } catch {
        // Some older WebViews ignore artwork URLs if data URI is huge
        navigator.mediaSession.metadata = new MediaMetadata({
          title: track.title,
          artist: track.artist,
          album: track.album || 'VibeMusic',
        });
      }
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    } else {
      navigator.mediaSession.playbackState = 'none';
    }
  }

  if (isNativeAndroid() && track) {
    VibeMusicAudio.syncMetadata({
      title: track.title,
      artist: track.artist,
      album: track.album || 'VibeMusic',
      isPlaying,
      duration: Math.round(track.duration * 1000),
      position: 0,
    }).catch(() => {
      // Ignore if running in web browser
    });
  }
}

export function syncMediaSessionPosition(
  duration: number,
  currentTime: number,
  isPlaying: boolean
): void {
  if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
    if (Number.isFinite(duration) && duration > 0 && currentTime >= 0 && currentTime <= duration) {
      try {
        navigator.mediaSession.setPositionState({
          duration,
          playbackRate: isPlaying ? 1 : 0,
          position: currentTime,
        });
      } catch {
        // Ignore transient duration sync errors
      }
    }
  }

  if (isNativeAndroid()) {
    VibeMusicAudio.setPlaybackState({
      isPlaying,
      position: Math.round(currentTime * 1000),
    }).catch(() => {});
  }
}

export function registerMediaSessionHandlers(handlers: {
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeekTo: (time: number) => void;
}): () => void {
  if ('mediaSession' in navigator) {
    const safeSet = (action: MediaSessionAction, fn: MediaSessionActionHandler | null) => {
      try {
        navigator.mediaSession.setActionHandler(action, fn);
      } catch {
        // Action not supported on this browser/webview
      }
    };

    safeSet('play', () => handlers.onPlay());
    safeSet('pause', () => handlers.onPause());
    safeSet('nexttrack', () => handlers.onNext());
    safeSet('previoustrack', () => handlers.onPrevious());
    safeSet('seekto', (details) => {
      if (typeof details.seekTime === 'number') {
        handlers.onSeekTo(details.seekTime);
      }
    });
    safeSet('seekbackward', (details) => {
      handlers.onSeekTo(Math.max(0, -(details.seekOffset ?? 10)));
    });
    safeSet('seekforward', (details) => {
      handlers.onSeekTo(details.seekOffset ?? 10);
    });
  }

  let nativeHandle: { remove: () => void } | null = null;
  if (isNativeAndroid()) {
    VibeMusicAudio.addListener('mediaCommand', ({ command }) => {
      if (command === 'play') handlers.onPlay();
      else if (command === 'pause' || command === 'audioFocusLoss' || command === 'becomingNoisy') {
        handlers.onPause();
      } else if (command === 'next') handlers.onNext();
      else if (command === 'previous') handlers.onPrevious();
    })
      .then((handle) => {
        nativeHandle = handle;
      })
      .catch(() => {});
  }

  return () => {
    nativeHandle?.remove();
  };
}

export function registerAndroidLifecycle(callbacks: {
  onAppResume: () => void;
  onBackButton: () => boolean; // returns true if handled internally
}): () => void {
  let stateHandle: { remove: () => void } | null = null;
  let backHandle: { remove: () => void } | null = null;

  App.addListener('appStateChange', ({ isActive }) => {
    if (isActive) {
      callbacks.onAppResume();
    }
  })
    .then((h) => {
      stateHandle = h;
    })
    .catch(() => {});

  App.addListener('backButton', () => {
    const handled = callbacks.onBackButton();
    if (!handled && isNativeAndroid()) {
      App.minimizeApp().catch(() => {});
    }
  })
    .then((h) => {
      backHandle = h;
    })
    .catch(() => {});

  return () => {
    stateHandle?.remove();
    backHandle?.remove();
  };
}
