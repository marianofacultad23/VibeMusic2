# Guía para compilar e instalar VibeMusic.apk en Android

Este proyecto ya incluye la configuración completa de **Capacitor** y la estructura nativa de **Android** en la carpeta `/android`, lista para generar un APK instalable.

## 1. Requisitos previos en tu PC
- **Node.js 18+** y **npm**
- **Java JDK 17** o **21** (incluido automáticamente con Android Studio)
- **Android Studio** (con Android SDK Platform 34/36 y Build-Tools instalados)

## 2. Sincronizar la aplicación web con Android
Cada vez que realices cambios en el código React/TypeScript, compila y sincroniza los assets hacia el proyecto Android:

```bash
npm install
npm run cap:sync
```

*(Este comando ejecuta `vite build` y luego `npx cap sync android`, copiando la app compilada a `android/app/src/main/assets/public/`).*

## 3. Opción A: Compilar el APK desde Android Studio (Recomendado)
1. Abre el proyecto Android ejecutando:
   ```bash
   npm run android:open
   ```
   *(O abre manualmente la carpeta `android/` desde Android Studio -> **Open**).*
2. Espera a que **Gradle Sync** descargue las dependencias y finalice la indexación.
3. En el menú superior selecciona:
   **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
4. Cuando finalice, haz clic en **locate** en la notificación emergente.
5. El archivo instalable estará en:
   `android/app/build/outputs/apk/debug/VibeMusic-debug.apk`

## 4. Opción B: Compilar el APK desde la terminal (Gradle CLI)
Desde la raíz del proyecto, ejecuta:

En **Linux / macOS**:
```bash
npm run cap:sync
cd android
./gradlew assembleDebug
```

En **Windows (PowerShell / CMD)**:
```bat
npm run cap:sync
cd android
gradlew.bat assembleDebug
```

El archivo APK generado quedará en:
`android/app/build/outputs/apk/debug/VibeMusic-debug.apk`

## 5. Instalar VibeMusic.apk en tu teléfono Android

### Método 1: Transferencia directa al teléfono
1. Copia `VibeMusic-debug.apk` a la memoria interna de tu teléfono (por cable USB, Drive o Telegram).
2. Ábrelo desde el administrador de archivos de Android.
3. Si Android lo solicita, activa **Instalar aplicaciones desconocidas** para tu gestor de archivos.
4. Pulsa **Instalar** y abre **VibeMusic**.

### Método 2: Instalación directa por cable USB (ADB)
1. Activa las **Opciones de desarrollador** y la **Depuración USB** en tu teléfono Android.
2. Conecta el teléfono al PC y ejecuta:
   ```bash
   adb install -r android/app/build/outputs/apk/debug/VibeMusic-debug.apk
   ```

## 6. Capacidades nativas incluidas en `/android`
- `MusicPlaybackService.java`: Servicio en primer plano (`foregroundServiceType="mediaPlayback"`) con `MediaSessionCompat`, notificación multimedia con botones de **Anterior / Reproducir / Pausar / Siguiente**, controles en pantalla de bloqueo, gestión de **AudioFocus** ante llamadas entrantes, pausa automática al desconectar auriculares Bluetooth (`ACTION_AUDIO_BECOMING_NOISY`) y `PARTIAL_WAKE_LOCK` para evitar cortes al apagar la pantalla.
- `VibeMusicAudioPlugin.java`: Puente Capacitor entre la interfaz React y el servicio multimedia nativo.
- `AndroidManifest.xml`: Permisos configurados (`FOREGROUND_SERVICE_MEDIA_PLAYBACK`, `WAKE_LOCK`, `READ_MEDIA_AUDIO`, `READ_EXTERNAL_STORAGE`, `POST_NOTIFICATIONS`, `BLUETOOTH_CONNECT`).
