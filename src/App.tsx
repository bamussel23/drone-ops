/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { MapArea } from './components/MapArea';
import { AIPlanner } from './components/AIPlanner';
import { LiveCopilot } from './components/LiveCopilot';
import { AIVision } from './components/AIVision';

export default function App() {
  const [activeTab, setActiveTab] = useState('map');

  return (
    <div className="flex h-screen w-full bg-bg-deep text-text-main overflow-hidden font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 flex relative">
        {activeTab === 'map' && <MapArea />}
        {activeTab === 'planner' && <AIPlanner />}
        {activeTab === 'copilot' && <LiveCopilot />}
        {activeTab === 'vision' && <AIVision />}
        {activeTab === '3d' && (
          <div className="flex-1 flex items-center justify-center bg-bg-deep p-8">
            <div className="text-center max-w-2xl glass-panel">
              <h2 className="text-3xl font-heading font-bold mb-4 text-accent-glow">3D Terrain Rendering Engine</h2>
              <p className="text-text-dim mb-8">
                // The 3D photogrammetry engine is currently initializing. This module will process your drone imagery into high-fidelity 3D models with adjustable camera angles and lighting effects.
              </p>
              <div className="w-full h-64 border border-border-color bg-[rgba(0,0,0,0.5)] flex items-center justify-center rounded-md">
                <span className="font-mono text-accent-glow animate-pulse">SYSTEM_STANDBY</span>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="flex-1 p-8 bg-bg-deep overflow-y-auto">
            <h2 className="text-3xl font-heading font-bold mb-8 text-accent-glow">System Configuration</h2>
            <div className="space-y-8 max-w-3xl">
              <section className="glass-panel">
                <div className="panel-title">External GPS & Telemetry</div>
                <p className="text-text-dim mb-4 text-sm">Configure external RTK/PPK GPS devices for enhanced mapping accuracy.</p>
                <button className="control-btn">
                  Connect Device
                </button>
              </section>
              <section className="glass-panel">
                <div className="panel-title">Data Sync & Backup</div>
                <p className="text-text-dim mb-4 text-sm">Manage cloud storage synchronization and offline map caching.</p>
                <div className="flex gap-4">
                  <button className="control-btn">
                    Force Sync
                  </button>
                  <button className="control-btn">
                    Download Offline Maps
                  </button>
                </div>
              </section>
              <section className="glass-panel">
                <div className="panel-title">Export Formats</div>
                <p className="text-text-dim mb-4 text-sm">Configure default export formats for photogrammetry pipelines.</p>
                <select className="w-full bg-bg-deep border border-border-color text-text-main p-3 rounded-md outline-none focus:border-accent-glow text-sm">
                  <option>GeoTIFF (Orthomosaic)</option>
                  <option>LAS/LAZ (Point Cloud)</option>
                  <option>OBJ/MTL (3D Mesh)</option>
                  <option>KML/KMZ (Flight Paths)</option>
                </select>
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
