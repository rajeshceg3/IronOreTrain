import { describe, it, expect } from 'vitest'
import { useExperienceStore } from './index'

describe('Experience Store', () => {
  it('should initialize with ARRIVAL state', () => {
    const state = useExperienceStore.getState().state
    expect(state).toBe('ARRIVAL')
  })

  it('should update state', () => {
    useExperienceStore.getState().setState('BOARDING')
    expect(useExperienceStore.getState().state).toBe('BOARDING')
  })
})
