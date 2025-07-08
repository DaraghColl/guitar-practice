import type { FC } from 'react';
import { Power } from 'lucide-react';

interface PlayPauseProps {
  isPlaying: boolean;
  onPlayPauseClick: () => void;
}

const PlayPause: FC<PlayPauseProps> = (props) => {
  const { isPlaying, onPlayPauseClick } = props;

  return (
    <div className="flex justify-center gap-4">
      <button
        className={`cursor-pointer rounded-full border border-gray-50 bg-gray-50 p-4 transition-shadow dark:bg-gray-900 ${
          isPlaying
            ? 'shadow-[0_0_16px_4px_rgba(34,197,94,0.7)]' // green glow when active
            : 'shadow-[0_0_16px_4px_rgba(239,68,68,0.7)]' // red glow when inactive
        }`}
        onClick={onPlayPauseClick}
      >
        <Power className="stroke-gray-500 dark:stroke-gray-50" />
      </button>
    </div>
  );
};

export { PlayPause };
