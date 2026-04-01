import React from 'react';
import { useExperienceStore } from '@iron-ore-train/state';

export function SettingsOverlay() {
  const settings = useExperienceStore((store) => store.settings);
  const setSettings = useExperienceStore((store) => store.setSettings);

  return (
    <div className="absolute bottom-4 left-4 z-50 flex flex-col gap-2 text-xs text-gray-400 font-sans tracking-wide bg-black/40 p-3 rounded">
      <label className="flex items-center gap-2 cursor-pointer hover:text-gray-200 transition-colors">
        <input
          type="checkbox"
          checked={settings.reducedMotion}
          onChange={(e) => setSettings({ reducedMotion: e.target.checked })}
          className="accent-gray-400 cursor-pointer"
        />
        Reduced Motion
      </label>
      <label className="flex items-center gap-2 cursor-pointer hover:text-gray-200 transition-colors">
        <input
          type="checkbox"
          checked={settings.subtitles}
          onChange={(e) => setSettings({ subtitles: e.target.checked })}
          className="accent-gray-400 cursor-pointer"
        />
        Subtitles
      </label>
    </div>
  );
}
