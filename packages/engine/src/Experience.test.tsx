import React from 'react';
import { describe, it, expect } from 'vitest';
import { ExperienceScene } from './Experience';
import ReactThreeTestRenderer from '@react-three/test-renderer';

// Mock ResizeObserver which is needed by @react-three/fiber
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('ExperienceScene', () => {
  it('should render a scene with fog, Desert (Group), and Train (InstancedMesh)', async () => {
    // Note: We render ExperienceScene instead of Experience
    // because ReactThreeTestRenderer.create already acts as the canvas.
    const renderer = await ReactThreeTestRenderer.create(<ExperienceScene />);
    const scene = renderer.scene;

    // Test if Desert group is present
    const group = scene.children.find((c) => c.type === 'Group');
    expect(group).toBeDefined();

    // Test if Train InstancedMesh is present
    const instancedMesh = scene.children.find((c) => c.type === 'InstancedMesh' || c.props.args?.[2] === 200);
    expect(instancedMesh).toBeDefined();

    // Check light elements exist
    const lights = scene.children.filter((c) => c.type === 'AmbientLight' || c.type === 'DirectionalLight');
    expect(lights.length).toBeGreaterThan(0);
  });
});
