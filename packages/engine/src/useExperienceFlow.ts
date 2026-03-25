import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useExperienceStore } from '@iron-ore-train/state';

export function useExperienceFlow() {
  const state = useExperienceStore((store) => store.state);
  const setState = useExperienceStore((store) => store.setState);
  const timeInState = useRef(0);

  useFrame((_, delta) => {
    timeInState.current += delta;

    if (state === 'ARRIVAL' && timeInState.current > 10) {
      setState('ORIENTATION');
      timeInState.current = 0;
    } else if (state === 'ORIENTATION' && timeInState.current > 15) {
      setState('BOARDING');
      timeInState.current = 0;
    }
  });
}
