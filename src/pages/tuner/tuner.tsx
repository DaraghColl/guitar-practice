import { useTuner } from './hooks/use-tuner';
import { Power } from 'lucide-react';

const Tuner = () => {
  const { currentNote, startTuner, stopTuner, isTunerActive } = useTuner({
    clarityThreshold: 0.7,
  });

  return (
    <div className="flex h-full flex-col justify-center">
      <div className="mb-10">
        <div className="mt-2 flex h-10 items-center justify-end text-xs">
          <div>{currentNote && `${currentNote.cents} cents`}</div>
        </div>
        <div className="flex items-center gap-2">
          {Array.from({ length: 21 }).map((_, i) => {
            const isCenter = i === 10;
            let highlight = false;
            let isInTune = false;
            if (currentNote && typeof currentNote.cents === 'number') {
              const index = Math.round((currentNote.cents + 50) / 5);
              highlight = i === index;
              isInTune =
                Math.abs(currentNote.cents) < 2.5 && isCenter && highlight;
            }
            let background = 'bg-gray-200'; // default gray
            if (highlight) {
              if (isInTune) {
                background = 'bg-green-400'; // green for in-tune (closest)
              } else if (currentNote && typeof currentNote.cents === 'number') {
                const absCents = Math.abs(currentNote.cents);
                if (absCents < 15) {
                  background = 'bg-yellow-300'; // yellow for middle
                } else if (absCents < 25) {
                  background = 'bg-orange-300'; // orange for middle
                } else {
                  background = 'bg-red-400'; // red for furthest
                }
              } else {
                background = 'bg-gray-600'; // fallback cyan highlight
              }
            }

            return (
              <div
                key={i}
                className={`w-full ${background} rounded-md`}
                style={{
                  height: isCenter ? 100 : 60,
                  transition: 'background .3s',
                }}
              />
            );
          })}
        </div>

        <div className="mt-2 flex h-10 items-center justify-around text-lg font-bold">
          <div>{currentNote && currentNote.name}</div>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button
          className={`cursor-pointer rounded-full bg-gray-50 p-4 transition-shadow ${
            isTunerActive
              ? 'shadow-[0_0_16px_4px_rgba(34,197,94,0.7)]' // green glow when active
              : 'shadow-[0_0_16px_4px_rgba(239,68,68,0.7)]' // red glow when inactive
          }`}
          onClick={() => {
            if (isTunerActive) {
              stopTuner();
            } else {
              startTuner();
            }
          }}
        >
          <Power />
        </button>
      </div>
    </div>
  );
};

export { Tuner };
