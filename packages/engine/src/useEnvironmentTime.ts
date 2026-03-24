import { useEffect, useMemo, useState } from 'react';

export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';

interface EnvironmentTime {
  elapsedSeconds: number;
  cycleProgress: number;
  timeOfDay: TimeOfDay;
}

const FULL_CYCLE_SECONDS = 600;

export function resolveTimeOfDay(cycleProgress: number): TimeOfDay {
  if (cycleProgress < 0.25) return 'dawn';
  if (cycleProgress < 0.6) return 'day';
  if (cycleProgress < 0.82) return 'dusk';
  return 'night';
}

export function useEnvironmentTime(cycleDurationSeconds = FULL_CYCLE_SECONDS): EnvironmentTime {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      setElapsedSeconds((Date.now() - startedAt) / 1000);
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  return useMemo(() => {
    const cycleProgress = (elapsedSeconds % cycleDurationSeconds) / cycleDurationSeconds;
    return {
      elapsedSeconds,
      cycleProgress,
      timeOfDay: resolveTimeOfDay(cycleProgress),
    };
  }, [cycleDurationSeconds, elapsedSeconds]);
}
