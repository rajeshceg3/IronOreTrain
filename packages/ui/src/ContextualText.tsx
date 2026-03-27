import React, { useEffect, useState } from 'react';
import { useExperienceStore } from '@iron-ore-train/state';

export function ContextualText() {
  const activeText = useExperienceStore((store) => store.activeText);
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

  if (!displayedText) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center p-8">
      <div
        className={`text-gray-300 font-sans text-xl tracking-wide max-w-lg text-center transition-opacity duration-1000 ease-in-out ${
          isFading ? 'opacity-80' : 'opacity-0'
        }`}
        style={{
          textShadow: '0 2px 4px rgba(0,0,0,0.5)',
        }}
      >
        {displayedText}
      </div>
    </div>
  );
}
