export function detectWebGLSupport(doc: Document = document): boolean {
  const canvas = doc.createElement('canvas');

  if (!canvas || typeof canvas.getContext !== 'function') {
    return false;
  }

  return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
}
