import { PlayPause } from '../../components/play-pause/play-pause';
import { useTuner } from './hooks/use-tuner';

const Tuner = () => {
  const { currentNote, startTuner, stopTuner, isTunerActive } = useTuner({
    clarityThreshold: 0.7,
  });

  return (
    <div className="flex h-full flex-col justify-center">
      <div className="mb-10 flex h-1/2 flex-col justify-center">
        <div>
          <div className="mt-2 flex h-10 items-center justify-end text-xs">
            <div>{currentNote ? `${currentNote.cents} cents` : '0 cents'}</div>
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
              let background = 'bg-gray-200';
              if (highlight) {
                if (isInTune) {
                  background = 'bg-green-400';
                } else if (
                  currentNote &&
                  typeof currentNote.cents === 'number'
                ) {
                  const absCents = Math.abs(currentNote.cents);
                  if (absCents < 15) {
                    background = 'bg-yellow-300';
                  } else if (absCents < 25) {
                    background = 'bg-orange-300';
                  } else {
                    background = 'bg-red-400';
                  }
                } else {
                  background = 'bg-gray-600';
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
      </div>

      <PlayPause
        isPlaying={isTunerActive}
        onPlayPauseClick={() => (isTunerActive ? stopTuner() : startTuner())}
      />
    </div>
  );
};

export { Tuner };
