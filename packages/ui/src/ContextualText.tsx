import React, { useEffect, useState } from 'react';
import { useExperienceStore } from '@iron-ore-train/state';

export function ContextualText() {
  const activeText = useExperienceStore((store) => store.activeText);
  const settings = useExperienceStore((store) => store.settings);
  const [displayedText, setDisplayedText] = useState<string | null>(null);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (activeText) {
      setDisplayedText(activeText);
      // Small delay before fading in to ensure smooth transition
      const timer = setTimeout(() => setIsFading(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsFading(false);
      // Wait for fade out animation to finish before removing text
      const timer = setTimeout(() => setDisplayedText(null), 1000); // 1s matches transition duration
      return () => clearTimeout(timer);
    }
  }, [activeText]);

  if (!displayedText || !settings.subtitles) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center p-8">
      <div
        className={`bg-black/40 px-6 py-3 rounded text-gray-300 font-sans text-xl tracking-wide max-w-lg text-center transition-opacity duration-1000 ease-in-out ${
          isFading ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          textShadow: '0 2px 4px rgba(0,0,0,0.8)',
        }}
      >
        {displayedText}
      </div>
    </div>
  );
}
