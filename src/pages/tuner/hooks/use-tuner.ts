import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { PitchDetector } from 'pitchy';

const SEMITONE = 69;
const NOTE_STRINGS = [
  'C',
  'C♯',
  'D',
  'D♯',
  'E',
  'F',
  'F♯',
  'G',
  'G♯',
  'A',
  'A♯',
  'B',
];

export interface TunerConfig {
  a4?: number;
  clarityThreshold?: number;
  minVolumeDecibels?: number;
  bufferSize?: number;
  smoothingTimeConstant?: number;
  minFrequency?: number;
  maxFrequency?: number;
  updateInterval?: number;
  sampleRate?: number;
}

export const TunerDefaults: TunerConfig = {
  a4: 440,
  clarityThreshold: 0.9,
  minVolumeDecibels: -1000,
  bufferSize: 8192,
  smoothingTimeConstant: 0.8,
  minFrequency: 27.5, // A0, Lowest note on a piano
  maxFrequency: 4186.01, // C8, Highest note on a piano
  updateInterval: 50,
  sampleRate: 44100,
};

export interface Note {
  name: string;
  value: number;
  cents: number;
  octave: number;
  frequency: number;
  clarity: number;
}

/**
 * Calculate note information from frequency and clarity.
 */
function getNote(frequency: number, clarity: number, a4: number): Note {
  const value =
    Math.round(12 * (Math.log(frequency / a4) / Math.log(2))) + SEMITONE;
  const standardFrequency = a4 * Math.pow(2, (value - SEMITONE) / 12);
  const cents = Math.floor(
    (1200 * Math.log(frequency / standardFrequency)) / Math.log(2)
  );
  const name = NOTE_STRINGS[value % 12];
  const octave = Math.floor(value / 12) - 1;
  return { frequency, name, value, cents, octave, clarity };
}

interface PitchyDetector {
  findPitch: (input: Float32Array, sampleRate: number) => [number, number];
  inputLength: number;
  minVolumeDecibels: number;
}

const useTuner = (config: TunerConfig = {}) => {
  const mergedConfig = useMemo(
    () => ({ ...TunerDefaults, ...config }),
    [config]
  );

  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [isTunerActive, setIsTunerActive] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refs = useRef({
    audioContext: null as AudioContext | null,
    analyserNode: null as AnalyserNode | null,
    detector: null as PitchyDetector | null,
    inputBuffer: null as Float32Array | null,
    mediaStream: null as MediaStream | null,
    intervalId: 0,
    sourceNode: null as MediaStreamAudioSourceNode | null,
    highpassFilter: null as BiquadFilterNode | null,
    lowpassFilter: null as BiquadFilterNode | null,
  });

  const processAudio = useCallback(() => {
    const { clarityThreshold, minFrequency, maxFrequency, a4 } = mergedConfig;
    const { analyserNode, detector, inputBuffer, audioContext } = refs.current;
    if (!analyserNode || !detector || !inputBuffer || !audioContext) return;
    analyserNode.getFloatTimeDomainData(inputBuffer);
    const [frequency, clarity] = detector.findPitch(
      inputBuffer,
      audioContext.sampleRate
    );
    if (
      clarity > clarityThreshold! &&
      frequency > minFrequency! &&
      frequency < maxFrequency!
    ) {
      setCurrentNote(getNote(frequency, clarity, a4!));
    } else {
      setCurrentNote(null);
    }
  }, [mergedConfig]);

  const stopTuner = useCallback(() => {
    if (!isTunerActive) return;
    clearInterval(refs.current.intervalId);
    if (refs.current.mediaStream) {
      refs.current.mediaStream.getTracks().forEach((track) => track.stop());
      refs.current.mediaStream = null;
    }
    if (refs.current.sourceNode) {
      refs.current.sourceNode.disconnect();
      refs.current.sourceNode = null;
    }
    if (refs.current.analyserNode) {
      refs.current.analyserNode.disconnect();
      refs.current.analyserNode = null;
    }
    if (refs.current.highpassFilter) {
      refs.current.highpassFilter.disconnect();
      refs.current.highpassFilter = null;
    }
    if (refs.current.lowpassFilter) {
      refs.current.lowpassFilter.disconnect();
      refs.current.lowpassFilter = null;
    }
    if (
      refs.current.audioContext &&
      refs.current.audioContext.state !== 'closed'
    ) {
      refs.current.audioContext
        .close()
        .then(() => {
          refs.current.audioContext = null;
        })
        .catch(() => {});
    }
    setCurrentNote(null);
    setIsTunerActive(false);
  }, [isTunerActive]);

  const startTuner = useCallback(async () => {
    if (isTunerActive) return;
    setError(null);
    try {
      // Request microphone access FIRST
      refs.current.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const {
        sampleRate,
        minFrequency,
        maxFrequency,
        bufferSize,
        smoothingTimeConstant,
        minVolumeDecibels,
        updateInterval,
      } = mergedConfig;
      // AudioContext: create or resume in direct response to gesture
      if (!refs.current.audioContext) {
        refs.current.audioContext = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext)({ sampleRate });
      }
      // Resume context if suspended (iOS/Safari)
      if (refs.current.audioContext.state === 'suspended') {
        await refs.current.audioContext.resume();
      }
      // Filters
      refs.current.highpassFilter = new BiquadFilterNode(
        refs.current.audioContext,
        { type: 'highpass', frequency: minFrequency }
      );
      refs.current.lowpassFilter = new BiquadFilterNode(
        refs.current.audioContext,
        { type: 'lowpass', frequency: maxFrequency }
      );
      // Analyser
      refs.current.analyserNode = new AnalyserNode(refs.current.audioContext, {
        fftSize: bufferSize,
        smoothingTimeConstant,
      });
      // Connect filters
      refs.current.lowpassFilter
        .connect(refs.current.highpassFilter)
        .connect(refs.current.analyserNode);
      // PitchDetector
      refs.current.detector = PitchDetector.forFloat32Array(
        refs.current.analyserNode.fftSize
      ) as PitchyDetector;
      refs.current.detector.minVolumeDecibels = minVolumeDecibels!;
      refs.current.inputBuffer = new Float32Array(
        refs.current.detector.inputLength
      );
      // Source node from already obtained mediaStream
      refs.current.sourceNode =
        refs.current.audioContext.createMediaStreamSource(
          refs.current.mediaStream
        );
      refs.current.sourceNode.connect(refs.current.lowpassFilter);
      // Start interval
      refs.current.intervalId = window.setInterval(
        processAudio,
        updateInterval!
      );
      setIsTunerActive(true);
    } catch {
      setError(
        new Error(
          'Microphone access denied or unavailable. Please check your browser settings and ensure you are using HTTPS.'
        )
      );
      alert('no access');

      stopTuner();
    }
  }, [isTunerActive, mergedConfig, processAudio, stopTuner]);

  useEffect(() => stopTuner, [stopTuner]);

  return { currentNote, isTunerActive, error, startTuner, stopTuner };
};

export { useTuner };
