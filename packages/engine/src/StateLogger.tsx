import { useEffect, useRef } from 'react';
import { useExperienceStore } from '@iron-ore-train/state';

export function StateLogger() {
  const state = useExperienceStore((store) => store.state);
  const previousState = useRef(state);

  useEffect(() => {
    if (state !== previousState.current) {
      console.log(`[State Transition] ${previousState.current} -> ${state}`);
      previousState.current = state;
    }
  }, [state]);

  return null;
}
