import React from 'react';
import { Map, Plane, Box, Settings, HardDrive, Layers, Mic, Scan } from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const navItems = [
    { id: 'map', icon: Map, label: 'Live Map & Tracking' },
    { id: 'planner', icon: Plane, label: 'AI Flight Planner' },
    { id: 'copilot', icon: Mic, label: 'Hands-Free Copilot' },
    { id: 'vision', icon: Scan, label: 'AI Vision Analysis' },
    { id: '3d', icon: Box, label: '3D Rendering' },
    { id: 'data', icon: HardDrive, label: 'Imagery & Sync' },
    { id: 'layers', icon: Layers, label: 'Overlays & Projections' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="w-64 bg-bg-panel backdrop-blur-md border-r border-border-color flex flex-col z-20">
      <div className="p-6 border-b border-border-color">
        <h1 className="text-sm font-heading font-bold tracking-widest uppercase text-accent-glow">
          AeroMap Pro
        </h1>
        <p className="text-[10px] font-mono text-text-dim mt-1 tracking-wider">CITY MAPPING SUITE</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-xs font-medium transition-colors text-left rounded-md border",
                isActive 
                  ? "bg-[rgba(0,242,255,0.1)] text-accent-glow border-border-color" 
                  : "text-text-dim hover:bg-[rgba(255,255,255,0.03)] hover:text-text-main border-transparent"
              )}
            >
              <Icon size={16} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border-color">
        <div className="glass-panel !p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-text-dim uppercase">System Status</span>
            <span className="w-1.5 h-1.5 rounded-full bg-accent-glow shadow-[0_0_8px_var(--color-accent-glow)]"></span>
          </div>
          <div className="text-xs text-text-main font-medium">RTK GPS: FIXED</div>
          <div className="text-[10px] text-text-dim mt-1 font-mono">BATTERY: 74%</div>
        </div>
      </div>
    </aside>
  );
}
