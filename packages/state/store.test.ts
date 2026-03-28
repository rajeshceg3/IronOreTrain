import { describe, it, expect, beforeEach } from 'vitest'
import { useExperienceStore } from './index'

describe('Experience Store', () => {
  beforeEach(() => {
    // Reset store
    useExperienceStore.setState({
      state: 'ARRIVAL',
      isTrainAligned: false,
      activeText: null
    })
  })

  it('should initialize with ARRIVAL state', () => {
    const state = useExperienceStore.getState().state
    expect(state).toBe('ARRIVAL')
  })

  it('should update state', () => {
    useExperienceStore.getState().setState('BOARDING')
    expect(useExperienceStore.getState().state).toBe('BOARDING')
  })

  it('should initialize and update isTrainAligned', () => {
    expect(useExperienceStore.getState().isTrainAligned).toBe(false)
    useExperienceStore.getState().setIsTrainAligned(true)
    expect(useExperienceStore.getState().isTrainAligned).toBe(true)
  })

  it('should initialize and update activeText', () => {
    expect(useExperienceStore.getState().activeText).toBeNull()
    useExperienceStore.getState().setActiveText('Discovery found')
    expect(useExperienceStore.getState().activeText).toBe('Discovery found')
  })

  it('can transition through all states sequentially', () => {
    const states = ['ARRIVAL', 'ORIENTATION', 'BOARDING', 'EXPLORATION', 'DISCOVERY', 'NIGHT', 'REFLECTION'] as const;
    states.forEach(state => {
      useExperienceStore.getState().setState(state)
      expect(useExperienceStore.getState().state).toBe(state)
    });
  })
})
