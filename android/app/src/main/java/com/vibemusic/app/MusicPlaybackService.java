package com.vibemusic.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.ServiceInfo;
import android.media.AudioAttributes;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import android.support.v4.media.MediaMetadataCompat;
import android.support.v4.media.session.MediaSessionCompat;
import android.support.v4.media.session.PlaybackStateCompat;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import androidx.media.app.NotificationCompat.MediaStyle;

public class MusicPlaybackService extends Service {

    public static final String CHANNEL_ID = "vibemusic_playback_channel";
    public static final int NOTIFICATION_ID = 1042;

    public static final String ACTION_UPDATE = "com.vibemusic.app.ACTION_UPDATE";
    public static final String ACTION_PLAY = "com.vibemusic.app.ACTION_PLAY";
    public static final String ACTION_PAUSE = "com.vibemusic.app.ACTION_PAUSE";
    public static final String ACTION_NEXT = "com.vibemusic.app.ACTION_NEXT";
    public static final String ACTION_PREV = "com.vibemusic.app.ACTION_PREV";
    public static final String ACTION_STOP = "com.vibemusic.app.ACTION_STOP";

    private MediaSessionCompat mediaSession;
    private AudioManager audioManager;
    private AudioFocusRequest audioFocusRequest;
    private PowerManager.WakeLock wakeLock;

    private String currentTitle = "VibeMusic";
    private String currentArtist = "Listo para reproducir";
    private String currentAlbum = "VibeMusic";
    private long currentDuration = 0L;
    private long currentPosition = 0L;
    private boolean isPlaying = false;
    private boolean pausedByTransientFocus = false;

    private final BroadcastReceiver noisyReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if (AudioManager.ACTION_AUDIO_BECOMING_NOISY.equals(intent.getAction())) {
                VibeMusicAudioPlugin.emitMediaCommand("becomingNoisy");
            }
        }
    };

    private final AudioManager.OnAudioFocusChangeListener focusListener = focusChange -> {
        if (focusChange == AudioManager.AUDIOFOCUS_LOSS || focusChange == AudioManager.AUDIOFOCUS_LOSS_TRANSIENT) {
            if (isPlaying) {
                pausedByTransientFocus = (focusChange == AudioManager.AUDIOFOCUS_LOSS_TRANSIENT);
                VibeMusicAudioPlugin.emitMediaCommand("audioFocusLoss");
            }
        } else if (focusChange == AudioManager.AUDIOFOCUS_GAIN && pausedByTransientFocus) {
            pausedByTransientFocus = false;
            VibeMusicAudioPlugin.emitMediaCommand("play");
        }
    };

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();

        audioManager = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
        PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
        if (pm != null) {
            wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "VibeMusic::AudioWakeLock");
            wakeLock.setReferenceCounted(false);
        }

        mediaSession = new MediaSessionCompat(this, "VibeMusicMediaSession");
        mediaSession.setFlags(
            MediaSessionCompat.FLAG_HANDLES_MEDIA_BUTTONS |
            MediaSessionCompat.FLAG_HANDLES_TRANSPORT_CONTROLS
        );
        mediaSession.setCallback(new MediaSessionCompat.Callback() {
            @Override
            public void onPlay() {
                VibeMusicAudioPlugin.emitMediaCommand("play");
            }

            @Override
            public void onPause() {
                VibeMusicAudioPlugin.emitMediaCommand("pause");
            }

            @Override
            public void onSkipToNext() {
                VibeMusicAudioPlugin.emitMediaCommand("next");
            }

            @Override
            public void onSkipToPrevious() {
                VibeMusicAudioPlugin.emitMediaCommand("previous");
            }

            @Override
            public void onStop() {
                VibeMusicAudioPlugin.emitMediaCommand("pause");
            }
        });
        mediaSession.setActive(true);

        IntentFilter noisyFilter = new IntentFilter(AudioManager.ACTION_AUDIO_BECOMING_NOISY);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(noisyReceiver, noisyFilter, Context.RECEIVER_NOT_EXPORTED);
        } else {
            registerReceiver(noisyReceiver, noisyFilter);
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && intent.getAction() != null) {
            switch (intent.getAction()) {
                case ACTION_PLAY:
                    VibeMusicAudioPlugin.emitMediaCommand("play");
                    break;
                case ACTION_PAUSE:
                    VibeMusicAudioPlugin.emitMediaCommand("pause");
                    break;
                case ACTION_NEXT:
                    VibeMusicAudioPlugin.emitMediaCommand("next");
                    break;
                case ACTION_PREV:
                    VibeMusicAudioPlugin.emitMediaCommand("previous");
                    break;
                case ACTION_STOP:
                    releaseWakeLock();
                    abandonAudioFocus();
                    stopForeground(true);
                    stopSelf();
                    return START_NOT_STICKY;
                case ACTION_UPDATE:
                    currentTitle = intent.getStringExtra("title") != null ? intent.getStringExtra("title") : currentTitle;
                    currentArtist = intent.getStringExtra("artist") != null ? intent.getStringExtra("artist") : currentArtist;
                    currentAlbum = intent.getStringExtra("album") != null ? intent.getStringExtra("album") : currentAlbum;
                    currentDuration = intent.getLongExtra("duration", currentDuration);
                    currentPosition = intent.getLongExtra("position", currentPosition);
                    isPlaying = intent.getBooleanExtra("isPlaying", isPlaying);

                    if (isPlaying) {
                        requestAudioFocus();
                        acquireWakeLock();
                    } else {
                        releaseWakeLock();
                    }
                    updateSessionAndNotification();
                    break;
            }
        }
        return START_STICKY;
    }

    private void updateSessionAndNotification() {
        MediaMetadataCompat metadata = new MediaMetadataCompat.Builder()
            .putString(MediaMetadataCompat.METADATA_KEY_TITLE, currentTitle)
            .putString(MediaMetadataCompat.METADATA_KEY_ARTIST, currentArtist)
            .putString(MediaMetadataCompat.METADATA_KEY_ALBUM, currentAlbum)
            .putLong(MediaMetadataCompat.METADATA_KEY_DURATION, currentDuration)
            .build();
        mediaSession.setMetadata(metadata);

        int state = isPlaying ? PlaybackStateCompat.STATE_PLAYING : PlaybackStateCompat.STATE_PAUSED;
        PlaybackStateCompat playbackState = new PlaybackStateCompat.Builder()
            .setActions(
                PlaybackStateCompat.ACTION_PLAY |
                PlaybackStateCompat.ACTION_PAUSE |
                PlaybackStateCompat.ACTION_PLAY_PAUSE |
                PlaybackStateCompat.ACTION_SKIP_TO_NEXT |
                PlaybackStateCompat.ACTION_SKIP_TO_PREVIOUS |
                PlaybackStateCompat.ACTION_STOP
            )
            .setState(state, currentPosition, isPlaying ? 1.0f : 0f)
            .build();
        mediaSession.setPlaybackState(playbackState);

        Notification notification = buildNotification();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
        } else {
            startForeground(NOTIFICATION_ID, notification);
        }
    }

    private Notification buildNotification() {
        Intent openIntent = new Intent(this, MainActivity.class);
        openIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent contentIntent = PendingIntent.getActivity(
            this, 0, openIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        PendingIntent prevIntent = serviceIntent(ACTION_PREV, 1);
        PendingIntent playPauseIntent = serviceIntent(isPlaying ? ACTION_PAUSE : ACTION_PLAY, 2);
        PendingIntent nextIntent = serviceIntent(ACTION_NEXT, 3);

        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(currentTitle)
            .setContentText(currentArtist)
            .setSubText(currentAlbum)
            .setSmallIcon(R.drawable.ic_music_note)
            .setContentIntent(contentIntent)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setOngoing(isPlaying)
            .setShowWhen(false)
            .addAction(R.drawable.ic_skip_previous, "Anterior", prevIntent)
            .addAction(
                isPlaying ? R.drawable.ic_pause : R.drawable.ic_play_arrow,
                isPlaying ? "Pausar" : "Reproducir",
                playPauseIntent
            )
            .addAction(R.drawable.ic_skip_next, "Siguiente", nextIntent)
            .setStyle(
                new MediaStyle()
                    .setMediaSession(mediaSession.getSessionToken())
                    .setShowActionsInCompactView(0, 1, 2)
            )
            .build();
    }

    private PendingIntent serviceIntent(String action, int requestCode) {
        Intent i = new Intent(this, MusicPlaybackService.class);
        i.setAction(action);
        return PendingIntent.getService(
            this, requestCode, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
    }

    private void requestAudioFocus() {
        if (audioManager == null) return;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            if (audioFocusRequest == null) {
                AudioAttributes attrs = new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_MEDIA)
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                    .build();
                audioFocusRequest = new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN)
                    .setAudioAttributes(attrs)
                    .setOnAudioFocusChangeListener(focusListener)
                    .build();
            }
            audioManager.requestAudioFocus(audioFocusRequest);
        } else {
            audioManager.requestAudioFocus(focusListener, AudioManager.STREAM_MUSIC, AudioManager.AUDIOFOCUS_GAIN);
        }
    }

    private void abandonAudioFocus() {
        if (audioManager == null) return;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && audioFocusRequest != null) {
            audioManager.abandonAudioFocusRequest(audioFocusRequest);
        } else {
            audioManager.abandonAudioFocus(focusListener);
        }
    }

    private void acquireWakeLock() {
        if (wakeLock != null && !wakeLock.isHeld()) {
            wakeLock.acquire(4 * 60 * 60 * 1000L);
        }
    }

    private void releaseWakeLock() {
        if (wakeLock != null && wakeLock.isHeld()) {
            wakeLock.release();
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Reproducción de VibeMusic",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Controles de música en la barra de notificaciones y pantalla de bloqueo");
            channel.setShowBadge(false);
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        try {
            unregisterReceiver(noisyReceiver);
        } catch (IllegalArgumentException ignored) {}
        releaseWakeLock();
        abandonAudioFocus();
        if (mediaSession != null) {
            mediaSession.setActive(false);
            mediaSession.release();
        }
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
