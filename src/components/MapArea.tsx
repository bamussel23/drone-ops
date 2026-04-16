import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon, useMapEvents, Tooltip } from 'react-leaflet';
import { Crosshair, AlertTriangle, Download, Layers as LayersIcon, MapPin, Activity, Hexagon, Type, Check, X, Trash2, Undo } from 'lucide-react';
import L from 'leaflet';
import { cn } from '../lib/utils';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const defaultCenter: [number, number] = [40.7128, -74.0060]; // NYC

type DrawMode = 'none' | 'point' | 'line' | 'polygon' | 'text';

interface Annotation {
  id: string;
  type: 'point' | 'line' | 'polygon' | 'text';
  latlng?: L.LatLng | [number, number];
  latlngs?: L.LatLng[] | [number, number][];
  text?: string;
}

const initialAnnotations: Annotation[] = [
  {
    id: 'example-line',
    type: 'line',
    latlngs: [
      [40.7128, -74.0060],
      [40.7200, -74.0100],
      [40.7250, -73.9900],
    ]
  },
  {
    id: 'example-polygon',
    type: 'polygon',
    latlngs: [
      [40.7300, -74.0000],
      [40.7400, -74.0000],
      [40.7400, -73.9900],
      [40.7300, -73.9900],
    ]
  }
];

function DrawEvents({ 
  mode, 
  onAddAnnotation, 
  currentDraw, 
  setCurrentDraw, 
  setMousePos, 
  setMode 
}: { 
  mode: DrawMode; 
  onAddAnnotation: (ann: Annotation) => void;
  currentDraw: L.LatLng[];
  setCurrentDraw: React.Dispatch<React.SetStateAction<L.LatLng[]>>;
  setMousePos: React.Dispatch<React.SetStateAction<L.LatLng | null>>;
  setMode: (mode: DrawMode) => void;
}) {
  useMapEvents({
    click(e) {
      if (mode === 'none') return;
      
      if (mode === 'point') {
        onAddAnnotation({ id: Date.now().toString(), type: 'point', latlng: e.latlng });
        setMode('none');
      } else if (mode === 'text') {
        const text = prompt('Enter label text:');
        if (text) {
          onAddAnnotation({ id: Date.now().toString(), type: 'text', latlng: e.latlng, text });
        }
        setMode('none');
      } else if (mode === 'line' || mode === 'polygon') {
        setCurrentDraw(prev => [...prev, e.latlng]);
      }
    },
    mousemove(e) {
      if (mode === 'line' || mode === 'polygon') {
        setMousePos(e.latlng);
      }
    },
    contextmenu(e) {
      // Right click to finish drawing
      if (mode === 'line' || mode === 'polygon') {
        if (currentDraw.length > 0) {
          onAddAnnotation({ id: Date.now().toString(), type: mode, latlngs: currentDraw });
          setCurrentDraw([]);
          setMode('none');
        }
      }
    }
  });
  return null;
}

export function MapArea() {
  const [altitude, setAltitude] = useState(120);
  const [drawMode, setDrawMode] = useState<DrawMode>('none');
  const [annotations, setAnnotations] = useState<Annotation[]>(initialAnnotations);
  const [currentDraw, setCurrentDraw] = useState<L.LatLng[]>([]);
  const [mousePos, setMousePos] = useState<L.LatLng | null>(null);

  const handleFinishDraw = () => {
    if ((drawMode === 'line' || drawMode === 'polygon') && currentDraw.length > 0) {
      setAnnotations(prev => [...prev, { id: Date.now().toString(), type: drawMode, latlngs: currentDraw }]);
    }
    setCurrentDraw([]);
    setDrawMode('none');
    setMousePos(null);
  };

  const handleCancelDraw = () => {
    setCurrentDraw([]);
    setDrawMode('none');
    setMousePos(null);
  };

  const handleUndo = () => {
    if ((drawMode === 'line' || drawMode === 'polygon') && currentDraw.length > 0) {
      // Undo last point in current drawing
      setCurrentDraw(prev => prev.slice(0, -1));
    } else if (annotations.length > 0) {
      // Undo last saved annotation
      setAnnotations(prev => prev.slice(0, -1));
    }
  };

  const clearAnnotations = () => {
    if (confirm('Are you sure you want to clear all annotations?')) {
      setAnnotations([]);
      setCurrentDraw([]);
      setDrawMode('none');
    }
  };

  // Create a custom divIcon for text labels
  const createTextIcon = (text: string) => {
    return L.divIcon({
      className: 'custom-text-label',
      html: `<div class="bg-bg-panel border border-border-color text-accent-glow px-2 py-1 rounded text-xs font-mono whitespace-nowrap backdrop-blur-md shadow-lg">${text}</div>`,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });
  };

  return (
    <div className="flex-1 relative flex flex-col bg-bg-deep">
      {/* Top Control Bar */}
      <div className="h-14 bg-bg-panel backdrop-blur-md border-b border-border-color flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-text-dim uppercase tracking-wider">Altitude</span>
            <input 
              type="range" 
              min="10" 
              max="400" 
              value={altitude}
              onChange={(e) => setAltitude(Number(e.target.value))}
              className="w-32 accent-accent-glow"
            />
            <span className="text-xs font-mono text-accent-glow">{altitude}m</span>
          </div>
          <div className="h-4 w-px bg-border-color"></div>
          <div className="flex items-center gap-2 text-xs text-text-dim">
            <LayersIcon size={14} />
            <span>EPSG:3857</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 text-xs text-accent-glow hover:text-text-main transition-colors">
            <Download size={14} />
            Offline Cache
          </button>
          <button className="flex items-center gap-2 text-xs text-accent-warm hover:text-text-main transition-colors">
            <AlertTriangle size={14} />
            Alerts (0)
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative z-0" style={{ cursor: drawMode !== 'none' ? 'crosshair' : 'grab' }}>
        <MapContainer 
          center={defaultCenter} 
          zoom={13} 
          style={{ height: '100%', width: '100%', background: 'var(--color-bg-deep)' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          
          <DrawEvents 
            mode={drawMode} 
            onAddAnnotation={(ann) => setAnnotations(prev => [...prev, ann])}
            currentDraw={currentDraw}
            setCurrentDraw={setCurrentDraw}
            setMousePos={setMousePos}
            setMode={setDrawMode}
          />

          {/* Render Saved Annotations */}
          {annotations.map(ann => {
            if (ann.type === 'point' && ann.latlng) {
              return <Marker key={ann.id} position={ann.latlng as any} />;
            }
            if (ann.type === 'text' && ann.latlng && ann.text) {
              return <Marker key={ann.id} position={ann.latlng as any} icon={createTextIcon(ann.text)} />;
            }
            if (ann.type === 'line' && ann.latlngs) {
              return <Polyline key={ann.id} positions={ann.latlngs as any} color="var(--color-accent-glow)" weight={3} dashArray={ann.id === 'example-line' ? "5, 10" : undefined} />;
            }
            if (ann.type === 'polygon' && ann.latlngs) {
              return <Polygon key={ann.id} positions={ann.latlngs as any} color="var(--color-accent-glow)" fillColor="var(--color-accent-glow)" fillOpacity={0.2} />;
            }
            return null;
          })}

          {/* Render Current Drawing */}
          {drawMode === 'line' && currentDraw.length > 0 && (
            <Polyline 
              positions={mousePos ? [...currentDraw, mousePos] : currentDraw} 
              color="var(--color-accent-glow)" 
              weight={3} 
              dashArray="5, 10" 
            />
          )}
          {drawMode === 'polygon' && currentDraw.length > 0 && (
            <Polygon 
              positions={mousePos ? [...currentDraw, mousePos] : currentDraw} 
              color="var(--color-accent-glow)" 
              fillColor="var(--color-accent-glow)" 
              fillOpacity={0.2} 
              dashArray="5, 10" 
            />
          )}
          
        </MapContainer>
        
        {/* Drawing Tools Toolbar */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-[400]">
          <div className="glass-panel p-2 flex flex-col gap-2 shadow-lg">
            <button 
              onClick={() => setDrawMode(drawMode === 'point' ? 'none' : 'point')}
              className={cn("w-10 h-10 rounded flex items-center justify-center transition-colors", drawMode === 'point' ? "bg-[rgba(0,242,255,0.2)] text-accent-glow border border-accent-glow" : "text-text-dim hover:text-text-main hover:bg-[rgba(255,255,255,0.05)]")}
              title="Add Point"
            >
              <MapPin size={18} />
            </button>
            <button 
              onClick={() => setDrawMode(drawMode === 'line' ? 'none' : 'line')}
              className={cn("w-10 h-10 rounded flex items-center justify-center transition-colors", drawMode === 'line' ? "bg-[rgba(0,242,255,0.2)] text-accent-glow border border-accent-glow" : "text-text-dim hover:text-text-main hover:bg-[rgba(255,255,255,0.05)]")}
              title="Draw Line"
            >
              <Activity size={18} />
            </button>
            <button 
              onClick={() => setDrawMode(drawMode === 'polygon' ? 'none' : 'polygon')}
              className={cn("w-10 h-10 rounded flex items-center justify-center transition-colors", drawMode === 'polygon' ? "bg-[rgba(0,242,255,0.2)] text-accent-glow border border-accent-glow" : "text-text-dim hover:text-text-main hover:bg-[rgba(255,255,255,0.05)]")}
              title="Draw Polygon"
            >
              <Hexagon size={18} />
            </button>
            <button 
              onClick={() => setDrawMode(drawMode === 'text' ? 'none' : 'text')}
              className={cn("w-10 h-10 rounded flex items-center justify-center transition-colors", drawMode === 'text' ? "bg-[rgba(0,242,255,0.2)] text-accent-glow border border-accent-glow" : "text-text-dim hover:text-text-main hover:bg-[rgba(255,255,255,0.05)]")}
              title="Add Text Label"
            >
              <Type size={18} />
            </button>
            
            <div className="h-px bg-border-color my-1"></div>
            
            <button 
              onClick={handleUndo}
              disabled={annotations.length === 0 && currentDraw.length === 0}
              className="w-10 h-10 rounded flex items-center justify-center text-text-dim hover:text-text-main hover:bg-[rgba(255,255,255,0.05)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Undo Last Action"
            >
              <Undo size={18} />
            </button>
            <button 
              onClick={clearAnnotations}
              disabled={annotations.length === 0 && currentDraw.length === 0}
              className="w-10 h-10 rounded flex items-center justify-center text-text-dim hover:text-accent-warm hover:bg-[rgba(255,140,0,0.1)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Clear All Annotations"
            >
              <Trash2 size={18} />
            </button>
          </div>

          {/* Contextual Actions for Line/Polygon */}
          {(drawMode === 'line' || drawMode === 'polygon') && currentDraw.length > 0 && (
            <div className="glass-panel p-2 flex gap-2 shadow-lg animate-in fade-in slide-in-from-left-4">
              <button 
                onClick={handleFinishDraw}
                className="w-10 h-10 rounded flex items-center justify-center text-accent-glow hover:bg-[rgba(0,242,255,0.1)] transition-colors"
                title="Finish Drawing"
              >
                <Check size={18} />
              </button>
              <button 
                onClick={handleCancelDraw}
                className="w-10 h-10 rounded flex items-center justify-center text-accent-warm hover:bg-[rgba(255,140,0,0.1)] transition-colors"
                title="Cancel Drawing"
              >
                <X size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Floating Tools (Right) */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-[400]">
          <button className="w-10 h-10 glass-panel !p-0 flex items-center justify-center text-text-main hover:text-accent-glow transition-colors shadow-lg">
            <Crosshair size={18} />
          </button>
        </div>

        {/* Telemetry Overlay */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[rgba(0,0,0,0.6)] px-6 py-2 rounded-full border border-border-color font-mono text-xs flex gap-6 z-[400] backdrop-blur-sm">
          <span className="text-text-main">HDOP: 0.82</span>
          <span className="text-accent-warm">REC: 00:42:15</span>
          <span className="text-text-main">STORAGE: 1.2TB FREE</span>
        </div>
      </div>
    </div>
  );
}
