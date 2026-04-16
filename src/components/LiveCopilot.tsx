import React from 'react';

export function LiveCopilot() {
  return (
    <div className="flex-1 flex items-center justify-center bg-bg-deep p-8">
      <div className="text-center max-w-2xl glass-panel">
        <h2 className="text-3xl font-heading font-bold mb-4 text-accent-glow">Live Copilot</h2>
        <p className="text-text-dim mb-8">
          Real-time AI flight assistance and in-air decision support. Monitors drone telemetry, suggests optimal capture angles, and alerts on airspace conflicts during active missions.
        </p>
        <div className="w-full h-64 border border-border-color bg-[rgba(0,0,0,0.5)] flex items-center justify-center rounded-md">
          <span className="font-mono text-accent-glow animate-pulse">AWAITING_DRONE_LINK</span>
        </div>
      </div>
    </div>
  );
}
