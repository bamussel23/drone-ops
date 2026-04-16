import React from 'react';

export function AIVision() {
  return (
    <div className="flex-1 flex items-center justify-center bg-bg-deep p-8">
      <div className="text-center max-w-2xl glass-panel">
        <h2 className="text-3xl font-heading font-bold mb-4 text-accent-glow">AI Vision Analysis</h2>
        <p className="text-text-dim mb-8">
          Post-flight image analysis powered by Gemini. Detects terrain features, identifies structures, estimates vegetation density, and flags anomalies across your survey captures.
        </p>
        <div className="w-full h-64 border border-border-color bg-[rgba(0,0,0,0.5)] flex items-center justify-center rounded-md">
          <span className="font-mono text-accent-glow animate-pulse">VISION_STANDBY</span>
        </div>
      </div>
    </div>
  );
}
