import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useExperienceStore } from '@iron-ore-train/state';

export function SystemManager() {
  const { gl } = useThree();
  const setIsContextLost = useExperienceStore((store) => store.setIsContextLost);

  useEffect(() => {
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      setIsContextLost(true);
    };

    const handleContextRestored = () => {
      setIsContextLost(false);
    };

    const canvas = gl.domElement;
    if (canvas) {
      canvas.addEventListener('webglcontextlost', handleContextLost, false);
      canvas.addEventListener('webglcontextrestored', handleContextRestored, false);
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('webglcontextlost', handleContextLost);
        canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      }
    };
  }, [gl, setIsContextLost]);

  return null;
}
