import { useState, useEffect, useRef, type FC, type RefObject } from 'react';
import { motion } from 'motion/react';
import { MinusCircle, PlusCircle } from 'lucide-react';
import { PlayPause } from '../../components/play-pause/play-pause';

const createCLick = (
  audioContext: AudioContext,
  nextBeatTimeRef: RefObject<number>
) => {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = 'sine'; // A simple sine wave for the click
  osc.frequency.setValueAtTime(880, audioContext.currentTime); // High pitch for the click
  gain.gain.setValueAtTime(1, nextBeatTimeRef.current);
  gain.gain.exponentialRampToValueAtTime(0.001, nextBeatTimeRef.current + 0.05);

  osc.connect(gain);
  gain.connect(audioContext.destination);

  osc.start(nextBeatTimeRef.current);
  osc.stop(nextBeatTimeRef.current + 0.05);
};

const Metronome: FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [bpm, setBpm] = useState<number>(120);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const nextBeatTimeRef = useRef<number>(0);
  const [beatNumber, setBeatNumber] = useState(0);

  // Initialize AudioContext on first play
  useEffect(() => {
    if (isPlaying && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).webkitAudioContext)();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
        gainNodeRef.current = null;
      }
      return;
    }

    const scheduleBeat = () => {
      const audioContext = audioContextRef.current;
      if (!audioContext) return;

      const lookahead = 0.1;

      while (nextBeatTimeRef.current < audioContext.currentTime + lookahead) {
        createCLick(audioContext, nextBeatTimeRef);
        setBeatNumber((beatNumber) => beatNumber + 1);
        console.log('create click');

        // Calculate next beat time
        const secondsPerBeat = 60 / bpm;
        nextBeatTimeRef.current += secondsPerBeat;
      }
    };

    let intervalId: number;
    if (isPlaying) {
      nextBeatTimeRef.current = audioContextRef.current!.currentTime;
      intervalId = window.setInterval(scheduleBeat, 25); // Check for beats every 25ms
    }

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isPlaying, bpm]);

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="mb-10 flex h-1/2 flex-col justify-center">
        <div className="flex items-center gap-2">
          <button
            className="cursor-pointer"
            onClick={() => setBpm((bpm) => bpm - 1)}
          >
            <MinusCircle size={30} className="stroke-gray-600" />
          </button>
          <motion.div
            initial={true}
            animate={{ opacity: isPlaying && beatNumber % 2 === 0 ? 0.2 : 1 }}
            className="flex h-60 w-60 flex-col items-center justify-center rounded-full bg-gray-200"
          >
            <input
              aria-label="bpm input"
              className="w-40 [appearance:textfield] text-center text-7xl text-gray-600 outline-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              maxLength={3}
              type="number"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
            />
            <span className="text-gray-600">bpm</span>
          </motion.div>
          <button
            className="cursor-pointer"
            onClick={() => setBpm((bpm) => bpm + 1)}
          >
            <PlusCircle size={30} className="stroke-gray-600" />
          </button>
        </div>
      </div>
      <PlayPause isPlaying={isPlaying} onPlayPauseClick={handleTogglePlay} />
    </div>
  );
};

export { Metronome };
