import { describe, expect, it } from 'vitest';
import { detectWebGLSupport } from './WebGLSupport';

describe('detectWebGLSupport', () => {
  it('returns true when webgl context is available', () => {
    const canvas = {
      getContext: (context: string) => (context === 'webgl' ? {} : null),
    } as unknown as HTMLCanvasElement;

    const mockDocument = {
      createElement: () => canvas,
    } as unknown as Document;

    expect(detectWebGLSupport(mockDocument)).toBe(true);
  });

  it('returns false when no context is available', () => {
    const canvas = {
      getContext: () => null,
    } as unknown as HTMLCanvasElement;

    const mockDocument = {
      createElement: () => canvas,
    } as unknown as Document;

    expect(detectWebGLSupport(mockDocument)).toBe(false);
  });
});
