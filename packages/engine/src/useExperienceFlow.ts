import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useExperienceStore } from '@iron-ore-train/state';
import { useEnvironmentTime } from './useEnvironmentTime';

export function useExperienceFlow() {
  const state = useExperienceStore((store) => store.state);
  const setState = useExperienceStore((store) => store.setState);
  const isStill = useExperienceStore((store) => store.isStill);
  const timeInState = useRef(0);
  const stillTime = useRef(0);
  const { timeOfDay } = useEnvironmentTime();

  useFrame((_, delta) => {
    timeInState.current += delta;

    // Track stillness time
    if (isStill) {
      stillTime.current += delta;
    } else {
      stillTime.current = 0;
    }

    if (state === 'ARRIVAL' && timeInState.current > 10) {
      setState('ORIENTATION');
      timeInState.current = 0;
    } else if (state === 'ORIENTATION' && timeInState.current > 15) {
      setState('BOARDING');
      timeInState.current = 0;
    } else if (state === 'EXPLORATION' || state === 'DISCOVERY' || state === 'NIGHT' || state === 'REFLECTION') {
      // Handle NIGHT transition
      if (state !== 'NIGHT' && state !== 'REFLECTION' && timeOfDay === 'night') {
        setState('NIGHT');
        timeInState.current = 0;
      }

      // Handle REFLECTION transition
      if (state !== 'REFLECTION' && stillTime.current > 5) {
        setState('REFLECTION');
        timeInState.current = 0;
      } else if (state === 'REFLECTION' && !isStill) {
        // Break reflection and go back to night or exploration
        setState(timeOfDay === 'night' ? 'NIGHT' : 'EXPLORATION');
        timeInState.current = 0;
      }
    }
  });
}
