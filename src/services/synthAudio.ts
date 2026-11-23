import { SynthPreset } from '../types/music';

const wavCache = new Map<string, string>();

function semitoneToFreq(root: number, semitones: number): number {
  return root * Math.pow(2, semitones / 12);
}

/**
 * Generates a real, warm stereo PCM WAV audio Blob URL in-memory so every
 * curated catalog track produces genuine, musical audio through HTML5 <audio>.
 */
export function getSynthTrackUrl(trackId: string, preset?: SynthPreset): string {
  const existing = wavCache.get(trackId);
  if (existing) return existing;

  const config: SynthPreset = preset ?? {
    bpm: 96,
    rootFreq: 130.81,
    scale: [0, 3, 7, 10, 12],
    mood: 'chill',
  };

  const sampleRate = 22050;
  const durationSec = 24;
  const totalSamples = sampleRate * durationSec;
  const numChannels = 2;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = totalSamples * blockAlign;

  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // RIFF Header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // PCM
  view.setUint16(20, 1, true); // Linear PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  const beatSec = 60 / config.bpm;
  const stepSec = beatSec / 2; // 8th notes
  const chordProgression = [0, 2, 1, 3]; // Scale indices for harmonic movement

  let offset = 44;
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;

    // Smooth fade in/out for seamless loop boundaries
    const fadeIn = Math.min(1, t / 0.35);
    const fadeOut = Math.min(1, (durationSec - t) / 0.5);
    const masterEnv = fadeIn * fadeOut;

    const beatIndex = Math.floor(t / beatSec);
    const beatPhase = (t % beatSec) / beatSec;
    const stepIndex = Math.floor(t / stepSec);
    const stepPhase = (t % stepSec) / stepSec;

    const chordSlot = Math.floor(beatIndex / 4) % chordProgression.length;
    const chordRootOffset = config.scale[chordProgression[chordSlot] % config.scale.length];
    const chordRoot = semitoneToFreq(config.rootFreq, chordRootOffset);

    // 1. Warm sub/pad triad
    const padThird = semitoneToFreq(chordRoot, config.scale[1] ?? 3);
    const padFifth = semitoneToFreq(chordRoot, 7);
    const padSwell = 0.7 + 0.3 * Math.sin(2 * Math.PI * 0.25 * t);
    const padL =
      (Math.sin(2 * Math.PI * chordRoot * t) * 0.38 +
        Math.sin(2 * Math.PI * padThird * 2 * t) * 0.22 +
        Math.sin(2 * Math.PI * padFifth * 2 * t) * 0.18) *
      padSwell;
    const padR =
      (Math.sin(2 * Math.PI * (chordRoot * 1.003) * t) * 0.38 +
        Math.sin(2 * Math.PI * (padThird * 2 * 0.997) * t) * 0.22 +
        Math.sin(2 * Math.PI * (padFifth * 2 * 1.002) * t) * 0.18) *
      padSwell;

    // 2. Melodic arpeggio / pluck
    const arpDegree = config.scale[(stepIndex * 2 + chordSlot) % config.scale.length];
    const arpFreq = semitoneToFreq(config.rootFreq * 2, arpDegree);
    const arpDecay = config.mood === 'ambient' ? 3.2 : config.mood === 'acoustic' ? 5.5 : 7.0;
    const arpEnv = Math.exp(-stepPhase * arpDecay) * (1 - Math.exp(-stepPhase * 80));
    const harmonic2 = config.mood === 'acoustic' || config.mood === 'jazz' ? 0.35 : 0.15;
    const pluck =
      (Math.sin(2 * Math.PI * arpFreq * t) +
        Math.sin(2 * Math.PI * arpFreq * 2 * t) * harmonic2) *
      arpEnv *
      0.28;

    // 3. Soft kick / percussive pulse for rhythmic moods
    let kick = 0;
    let hihat = 0;
    if (config.mood === 'pulse' || config.mood === 'synth' || config.mood === 'chill') {
      const kickPitch = 52 + 85 * Math.exp(-beatPhase * 24);
      const kickEnv = Math.exp(-beatPhase * 11);
      kick = Math.sin(2 * Math.PI * kickPitch * beatPhase * beatSec) * kickEnv * 0.32;

      if (stepIndex % 2 === 1) {
        const hatEnv = Math.exp(-stepPhase * 30);
        const pseudoNoise = Math.sin(i * 12.9898) * 43758.5453;
        const white = (pseudoNoise - Math.floor(pseudoNoise)) * 2 - 1;
        hihat = white * hatEnv * 0.045;
      }
    }

    // 4. Deep bass anchor
    const bassEnv = config.mood === 'pulse' ? Math.exp(-stepPhase * 3.5) : 0.75;
    const bass = Math.sin(2 * Math.PI * (chordRoot * 0.5) * t) * bassEnv * 0.25;

    // Subtle stereo panning for pluck
    const pan = 0.5 + 0.3 * Math.sin(t * 0.7);
    const sampleL = Math.tanh((padL * 0.38 + pluck * (1 - pan) * 1.4 + kick + hihat + bass) * masterEnv);
    const sampleR = Math.tanh((padR * 0.38 + pluck * pan * 1.4 + kick + hihat + bass) * masterEnv);

    view.setInt16(offset, Math.max(-1, Math.min(1, sampleL)) * 32767, true);
    view.setInt16(offset + 2, Math.max(-1, Math.min(1, sampleR)) * 32767, true);
    offset += 4;
  }

  const blob = new Blob([buffer], { type: 'audio/wav' });
  const url = URL.createObjectURL(blob);
  wavCache.set(trackId, url);
  return url;
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
