export interface ParsedAudioMetadata {
  title: string;
  artist: string;
  album: string;
  duration: number;
  coverUrl?: string;
  fileFormat: string;
}

function cleanFileName(fileName: string): { title: string; artist: string } {
  const withoutExt = fileName.replace(/\.[^/.]+$/, '').replace(/_/g, ' ').trim();
  const dashSplit = withoutExt.split(' - ');
  if (dashSplit.length >= 2) {
    return {
      artist: dashSplit[0].trim() || 'Artista local',
      title: dashSplit.slice(1).join(' - ').trim() || withoutExt,
    };
  }
  return {
    title: withoutExt || 'Pista sin título',
    artist: 'Archivo local',
  };
}

function decodeTextFrame(bytes: Uint8Array): string {
  if (bytes.length === 0) return '';
  const encoding = bytes[0];
  const payload = bytes.slice(1);
  try {
    if (encoding === 0) {
      return new TextDecoder('iso-8859-1').decode(payload).replace(/\0/g, '').trim();
    }
    if (encoding === 1 || encoding === 2) {
      return new TextDecoder('utf-16').decode(payload).replace(/\0/g, '').trim();
    }
    return new TextDecoder('utf-8').decode(payload).replace(/\0/g, '').trim();
  } catch {
    return new TextDecoder('utf-8', { fatal: false }).decode(payload).replace(/\0/g, '').trim();
  }
}

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

function parseApicFrame(bytes: Uint8Array): string | undefined {
  if (bytes.length < 4) return undefined;
  const encoding = bytes[0];
  let idx = 1;

  // Read MIME type (null-terminated ASCII)
  let mime = '';
  while (idx < bytes.length && bytes[idx] !== 0) {
    mime += String.fromCharCode(bytes[idx]);
    idx++;
  }
  idx++; // skip null

  if (idx >= bytes.length) return undefined;
  idx++; // skip picture type byte

  // Skip description (depends on encoding)
  if (encoding === 1 || encoding === 2) {
    while (idx + 1 < bytes.length && !(bytes[idx] === 0 && bytes[idx + 1] === 0)) {
      idx += 2;
    }
    idx += 2;
  } else {
    while (idx < bytes.length && bytes[idx] !== 0) {
      idx++;
    }
    idx++;
  }

  if (idx >= bytes.length) return undefined;
  const imageBytes = bytes.slice(idx);
  if (imageBytes.length < 16) return undefined;

  const normalizedMime =
    mime && mime.includes('/') ? mime : imageBytes[0] === 0x89 ? 'image/png' : 'image/jpeg';
  return `data:${normalizedMime};base64,${uint8ToBase64(imageBytes)}`;
}

function parseID3v2(buffer: ArrayBuffer): Partial<ParsedAudioMetadata> {
  const bytes = new Uint8Array(buffer);
  if (bytes.length < 10) return {};

  // Check "ID3" magic header
  if (bytes[0] !== 0x49 || bytes[1] !== 0x44 || bytes[2] !== 0x33) {
    return {};
  }

  const version = bytes[3];
  const tagSize =
    ((bytes[6] & 0x7f) << 21) |
    ((bytes[7] & 0x7f) << 14) |
    ((bytes[8] & 0x7f) << 7) |
    (bytes[9] & 0x7f);

  const limit = Math.min(bytes.length, 10 + tagSize);
  let pos = 10;

  // Skip extended header if present (bit 6 of flags)
  if ((bytes[5] & 0x40) !== 0 && pos + 4 <= limit) {
    const extSize =
      (bytes[pos] << 24) | (bytes[pos + 1] << 16) | (bytes[pos + 2] << 8) | bytes[pos + 3];
    pos += extSize + 4;
  }

  const result: Partial<ParsedAudioMetadata> = {};

  while (pos + 10 <= limit) {
    const frameId = String.fromCharCode(bytes[pos], bytes[pos + 1], bytes[pos + 2], bytes[pos + 3]);
    if (!/^[A-Z0-9]{4}$/.test(frameId)) break;

    let frameSize: number;
    if (version >= 4) {
      frameSize =
        ((bytes[pos + 4] & 0x7f) << 21) |
        ((bytes[pos + 5] & 0x7f) << 14) |
        ((bytes[pos + 6] & 0x7f) << 7) |
        (bytes[pos + 7] & 0x7f);
    } else {
      frameSize =
        ((bytes[pos + 4] << 24) >>> 0) +
        (bytes[pos + 5] << 16) +
        (bytes[pos + 6] << 8) +
        bytes[pos + 7];
    }

    pos += 10;
    if (frameSize <= 0 || pos + frameSize > limit) break;

    const frameData = bytes.subarray(pos, pos + frameSize);
    if (frameId === 'TIT2') {
      const val = decodeTextFrame(frameData);
      if (val) result.title = val;
    } else if (frameId === 'TPE1') {
      const val = decodeTextFrame(frameData);
      if (val) result.artist = val;
    } else if (frameId === 'TALB') {
      const val = decodeTextFrame(frameData);
      if (val) result.album = val;
    } else if (frameId === 'APIC' && !result.coverUrl) {
      result.coverUrl = parseApicFrame(frameData);
    }

    pos += frameSize;
  }

  return result;
}

function probeDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    audio.preload = 'metadata';

    const cleanup = (dur: number) => {
      URL.revokeObjectURL(url);
      resolve(Number.isFinite(dur) && dur > 0 ? Math.round(dur) : 0);
    };

    const timer = window.setTimeout(() => cleanup(0), 3500);

    audio.onloadedmetadata = () => {
      window.clearTimeout(timer);
      cleanup(audio.duration);
    };

    audio.onerror = () => {
      window.clearTimeout(timer);
      cleanup(0);
    };

    audio.src = url;
  });
}

export async function extractAudioMetadata(file: File): Promise<ParsedAudioMetadata> {
  const fallback = cleanFileName(file.name);
  const extMatch = file.name.match(/\.([^.]+)$/);
  const fileFormat = extMatch ? extMatch[1].toUpperCase() : 'AUDIO';

  // Read up to first 1.5 MB for ID3v2 tags & embedded artwork
  const headerSlice = file.slice(0, Math.min(file.size, 1572864));
  const buffer = await headerSlice.arrayBuffer();
  const id3 = parseID3v2(buffer);
  const duration = await probeDuration(file);

  return {
    title: id3.title || fallback.title,
    artist: id3.artist || fallback.artist,
    album: id3.album || 'Biblioteca Local',
    duration: duration || 180,
    coverUrl: id3.coverUrl,
    fileFormat,
  };
}
