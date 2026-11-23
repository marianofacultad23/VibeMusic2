package com.vibemusic.app;

import android.content.Context;
import android.content.Intent;
import android.os.Build;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "VibeMusicAudio")
public class VibeMusicAudioPlugin extends Plugin {

    private static VibeMusicAudioPlugin activeInstance;

    @Override
    public void load() {
        activeInstance = this;
    }

    public static void emitMediaCommand(String command) {
        if (activeInstance != null) {
            JSObject data = new JSObject();
            data.put("command", command);
            activeInstance.notifyListeners("mediaCommand", data);
        }
    }

    @PluginMethod
    public void syncMetadata(PluginCall call) {
        Context ctx = getContext();
        Intent intent = new Intent(ctx, MusicPlaybackService.class);
        intent.setAction(MusicPlaybackService.ACTION_UPDATE);
        intent.putExtra("title", call.getString("title", "VibeMusic"));
        intent.putExtra("artist", call.getString("artist", "Desconocido"));
        intent.putExtra("album", call.getString("album", "VibeMusic"));
        intent.putExtra("isPlaying", Boolean.TRUE.equals(call.getBoolean("isPlaying", false)));
        intent.putExtra("duration", call.getInt("duration", 0).longValue());
        intent.putExtra("position", call.getInt("position", 0).longValue());

        startCompatService(ctx, intent);
        call.resolve();
    }

    @PluginMethod
    public void setPlaybackState(PluginCall call) {
        Context ctx = getContext();
        Intent intent = new Intent(ctx, MusicPlaybackService.class);
        intent.setAction(MusicPlaybackService.ACTION_UPDATE);
        intent.putExtra("isPlaying", Boolean.TRUE.equals(call.getBoolean("isPlaying", false)));
        intent.putExtra("position", call.getInt("position", 0).longValue());

        startCompatService(ctx, intent);
        call.resolve();
    }

    @PluginMethod
    public void stopService(PluginCall call) {
        Context ctx = getContext();
        Intent intent = new Intent(ctx, MusicPlaybackService.class);
        intent.setAction(MusicPlaybackService.ACTION_STOP);
        ctx.startService(intent);
        call.resolve();
    }

    private void startCompatService(Context ctx, Intent intent) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            ctx.startForegroundService(intent);
        } else {
            ctx.startService(intent);
        }
    }
}
