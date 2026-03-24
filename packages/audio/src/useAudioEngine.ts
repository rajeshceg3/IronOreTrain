import { useEffect, useRef, useState } from 'react';
import { AudioEngine } from './AudioEngine';

export function useAudioEngine() {
  const engineRef = useRef<AudioEngine>(AudioEngine.getInstance());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const engine = engineRef.current;

    // Auto-init on mount, but note: browser might keep it in 'suspended'
    // state until user interacts with the page.
    engine.init();

    if (typeof window === 'undefined') {
      return;
    }

    // Setup an interaction listener to resume the AudioContext
    // This handles the browser's autoplay policy.
    const handleInteraction = async () => {
      await engine.start();
      setIsReady(true);

      // Cleanup listeners once ready
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  return { engine: engineRef.current, isReady };
}
