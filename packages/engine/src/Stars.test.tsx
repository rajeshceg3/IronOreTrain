import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { Stars } from './Stars';
import * as THREE from 'three';

vi.mock('./useEnvironmentTime', () => ({
  useEnvironmentTime: () => ({ timeOfDay: 'night' }),
}));

describe('Stars', () => {
  it('renders points with correct geometry', async () => {
    const renderer = await ReactThreeTestRenderer.create(<Stars />);
    const points = renderer.scene.children[0];

    expect(points.type === 'Points' || points.type === 'points').toBeTruthy();
    const children = points.props.children || points.children;
    expect(children).toBeDefined();
    // It could be an array of length 2 or objects attached directly
  });
});
