import { create } from 'zustand'

export type ExperienceState = 'ARRIVAL' | 'ORIENTATION' | 'BOARDING' | 'EXPLORATION' | 'DISCOVERY' | 'NIGHT' | 'REFLECTION'

interface ExperienceStore {
  state: ExperienceState
  setState: (state: ExperienceState) => void
}

export const useExperienceStore = create<ExperienceStore>((set) => ({
  state: 'ARRIVAL',
  setState: (state) => set({ state })
}))

export function useExperienceState() {
  return useExperienceStore((store) => ({
    state: store.state,
    setState: store.setState
  }))
}
