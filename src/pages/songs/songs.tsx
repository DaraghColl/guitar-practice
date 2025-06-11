import { useEffect, useState } from 'react';
import chillFunk from '../../assets/songs/chill-funk.mp3';
import { Play, Square } from 'lucide-react';

const audioElement: HTMLAudioElement = new Audio(chillFunk);

const Songs = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlaySong = () => {
    if (!isPlaying) {
      audioElement.play();
      setIsPlaying(true);
    } else {
      audioElement.pause();
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    return () => {
      setIsPlaying(false);
      audioElement.pause();
    };
  }, []);
  return (
    <div className="flex h-full flex-col justify-center">
      <button
        onClick={togglePlaySong}
        className="flex h-40 w-full cursor-pointer items-center justify-center rounded-sm bg-linear-to-bl from-gray-500 to-gray-900"
      >
        <div className="flex flex-col items-center gap-4">
          {!isPlaying ? (
            <Play className="stroke-white" />
          ) : (
            <Square className="stroke-white" />
          )}
        </div>
      </button>
    </div>
  );
};

export { Songs };
