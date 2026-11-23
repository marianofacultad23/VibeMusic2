import { Disc3, Music2 } from 'lucide-react';
import { useState } from 'react';

interface ArtworkProps {
  src?: string;
  alt: string;
  className?: string;
  rounded?: string;
  isLocal?: boolean;
  isCircle?: boolean;
}

export function Artwork({
  src,
  alt,
  className = 'w-12 h-12',
  rounded = 'rounded-lg',
  isLocal = false,
  isCircle = false,
}: ArtworkProps) {
  const [failed, setFailed] = useState(false);
  const shape = isCircle ? 'rounded-full' : rounded;

  if (!src || failed) {
    return (
      <div
        className={`${className} ${shape} shrink-0 bg-gradient-to-br from-zinc-800 via-zinc-900 to-[#0e2918] flex items-center justify-center border border-white/10 select-none`}
        aria-label={alt}
      >
        {isLocal ? (
          <Disc3 className="w-1/2 h-1/2 text-[#1DB954]/80" />
        ) : (
          <Music2 className="w-1/2 h-1/2 text-zinc-400" />
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`${className} ${shape} shrink-0 object-cover bg-zinc-900 select-none`}
    />
  );
}
