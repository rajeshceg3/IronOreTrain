import { create } from 'zustand'

export type ExperienceState = 'ARRIVAL' | 'ORIENTATION' | 'BOARDING' | 'EXPLORATION' | 'DISCOVERY' | 'NIGHT' | 'REFLECTION'

export interface Settings {
  reducedMotion: boolean
  subtitles: boolean
}

interface ExperienceStore {
  state: ExperienceState
  setState: (state: ExperienceState) => void
  isTrainAligned: boolean
  setIsTrainAligned: (aligned: boolean) => void
  activeText: string | null
  setActiveText: (text: string | null) => void
  isStill: boolean
  setIsStill: (isStill: boolean) => void
  settings: Settings
  setSettings: (settings: Partial<Settings>) => void
  isContextLost: boolean
  setIsContextLost: (isContextLost: boolean) => void
}

export const useExperienceStore = create<ExperienceStore>((set) => ({
  state: 'ARRIVAL',
  setState: (state) => set({ state }),
  isTrainAligned: false,
  setIsTrainAligned: (isTrainAligned) => set({ isTrainAligned }),
  activeText: null,
  setActiveText: (activeText) => set({ activeText }),
  isStill: false,
  setIsStill: (isStill) => set({ isStill }),
  settings: {
    reducedMotion: false,
    subtitles: true
  },
  setSettings: (newSettings) => set((state) => ({ settings: { ...state.settings, ...newSettings } })),
  isContextLost: false,
  setIsContextLost: (isContextLost) => set({ isContextLost })
}))

export function useExperienceState() {
  return useExperienceStore((store) => ({
    state: store.state,
    setState: store.setState
  }))
}
