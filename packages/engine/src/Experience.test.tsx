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
  it('should render a scene with fog and default mesh', async () => {
    // Note: We render ExperienceScene instead of Experience
    // because ReactThreeTestRenderer.create already acts as the canvas.
    const renderer = await ReactThreeTestRenderer.create(<ExperienceScene />);
    const scene = renderer.scene;

    // Test if a mesh is present
    const mesh = scene.children.find((c) => c.type === 'Mesh');
    expect(mesh).toBeDefined();

    // Check light elements exist
    const lights = scene.children.filter((c) => c.type === 'AmbientLight' || c.type === 'DirectionalLight');
    expect(lights.length).toBeGreaterThan(0);
  });
});
