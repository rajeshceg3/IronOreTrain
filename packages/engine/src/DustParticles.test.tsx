import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { DustParticles } from './DustParticles';

vi.mock('@iron-ore-train/state', () => ({
  useExperienceStore: (selector: any) => selector({ state: 'EXPLORATION', settings: { reducedMotion: false } }),
}));

describe('DustParticles', () => {
  it('renders an instanced mesh when moving', async () => {
    const renderer = await ReactThreeTestRenderer.create(<DustParticles />);

    // In our test, state is EXPLORATION, so it should render instancedMesh
    // Wait for the renderer to process
    await ReactThreeTestRenderer.act(async () => {
      // Small delay just to let internal state settle
      await new Promise(r => setTimeout(r, 0));
    });

    const children = renderer.scene.children;
    expect(children.length).toBeGreaterThan(0);
    const instancedMesh = children[0];
    // In React Three Fiber test renderer, InstancedMesh sometimes appears as 'instancedMesh' or 'Mesh' with args
    expect(
      instancedMesh.type === 'InstancedMesh' ||
      instancedMesh.type === 'instancedMesh' ||
      (instancedMesh.type === 'Mesh' && instancedMesh.props.args && instancedMesh.props.args[2] === 200)
    ).toBeTruthy();
    // particleCount is 200 in DustParticles.tsx
    expect(instancedMesh.props.args[2]).toBe(200);
  });
});
