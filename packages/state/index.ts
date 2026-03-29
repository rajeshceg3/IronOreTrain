import { create } from 'zustand'

export type ExperienceState = 'ARRIVAL' | 'ORIENTATION' | 'BOARDING' | 'EXPLORATION' | 'DISCOVERY' | 'NIGHT' | 'REFLECTION'

interface ExperienceStore {
  state: ExperienceState
  setState: (state: ExperienceState) => void
  isTrainAligned: boolean
  setIsTrainAligned: (aligned: boolean) => void
  activeText: string | null
  setActiveText: (text: string | null) => void
  reducedMotion: boolean
  setReducedMotion: (reduced: boolean) => void
}

const getInitialReducedMotion = () => {
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }
  return false
}

export const useExperienceStore = create<ExperienceStore>((set) => ({
  state: 'ARRIVAL',
  setState: (state) => set({ state }),
  isTrainAligned: false,
  setIsTrainAligned: (isTrainAligned) => set({ isTrainAligned }),
  activeText: null,
  setActiveText: (activeText) => set({ activeText }),
  reducedMotion: getInitialReducedMotion(),
  setReducedMotion: (reducedMotion) => set({ reducedMotion })
}))

export function useExperienceState() {
  return useExperienceStore((store) => ({
    state: store.state,
    setState: store.setState
  }))
}
