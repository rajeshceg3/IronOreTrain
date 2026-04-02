"use client";

import { Experience } from '@iron-ore-train/engine';
import { ContextualText, SettingsOverlay } from '@iron-ore-train/ui';

export default function Home() {
  return (
    <div className="flex flex-col flex-1 h-screen w-screen items-center justify-center bg-black font-sans m-0 p-0 overflow-hidden relative">
      <Experience />
      <ContextualText />
      <SettingsOverlay />
    </div>
  );
}
