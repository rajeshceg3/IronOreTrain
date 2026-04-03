// @vitest-environment jsdom
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ContextualText } from './ContextualText';
import { useExperienceStore } from '@iron-ore-train/state';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('ContextualText', () => {
  beforeEach(() => {
    useExperienceStore.setState({ activeText: null, settings: { subtitles: true, reducedMotion: false } });
  });

  afterEach(() => {
    document.body.innerHTML = ''; // Ensure DOM is cleaned up to prevent multiple elements error
  });

  it('renders text when activeText is set', async () => {
    useExperienceStore.setState({ activeText: 'Test text' });
    render(<ContextualText />);

    await waitFor(() => {
      expect(screen.getByText('Test text')).toBeDefined();
    });
  });

  it('sanitizes malicious input', async () => {
    const maliciousText = 'Hello <script>alert("xss")</script> World';
    useExperienceStore.setState({ activeText: maliciousText });
    render(<ContextualText />);

    await waitFor(() => {
      // getByText match is exact by default, and DOMPurify might leave different spacing
      // Using a regex makes it more resilient
      expect(screen.getByText(/Hello\s*World/)).toBeDefined();
    });
  });

  it('does not render if subtitles are disabled', () => {
    useExperienceStore.setState({ activeText: 'Test text', settings: { subtitles: false, reducedMotion: false } });
    const { container } = render(<ContextualText />);

    expect(container.firstChild).toBeNull();
  });
});
