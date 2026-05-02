"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Bell, Menu, X, MapPin, ZoomIn, ZoomOut, Maximize2, Minimize2 } from "lucide-react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import Link from "next/link";

type FilterKey = "Lost" | "Found" | "Missing" | "Claimed" | "Electronics" | "Accessories" | "Clothing" | "Documents" | "Other";

interface MapItem {
  id: number;
  title: string;
  status: string;
  category: string;
  location: string;
  pinX: number;
  pinY: number;
}

const STATUS_DOT: Record<string, string> = {
  Lost:    "bg-red-500",
  Found:   "bg-emerald-500",
  Missing: "bg-yellow-400",
  Claimed: "bg-blue-500",
};

const PIN_COLOR: Record<string, string> = {
  Lost:    "bg-red-500",
  Found:   "bg-emerald-500",
  Missing: "bg-yellow-400",
  Claimed: "bg-blue-400",
};

export default function MapView() {
  const [activeFilters, setActiveFilters] = useState<Set<FilterKey>>(new Set());
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hoveredPin, setHoveredPin] = useState<number | null>(null);
  const [mapItems, setMapItems] = useState<MapItem[]>([]);

  // Map expand / zoom state
  const [isExpanded, setIsExpanded] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, px: 0, py: 0 });
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Fetch pinned items from backend
  useEffect(() => {
    api.getItems({}).then((data: any[]) => {
      const pinned = (data || []).filter(
        (item: any) => item.pinX != null && item.pinY != null
      );
      setMapItems(pinned);
    }).catch(() => {});
  }, []);

  // Click-outside for notifications
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]);

  // Reset zoom/pan when toggling expand
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [isExpanded]);

  // ── Filter logic ────────────────────────────────────────────────────────────
  const toggleFilter = (key: FilterKey) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const visiblePins = mapItems.filter((item) => {
    if (activeFilters.size === 0) return true;
    return activeFilters.has(item.status as FilterKey) || activeFilters.has(item.category as FilterKey);
  });

  // ── Zoom helpers ─────────────────────────────────────────────────────────────
  const clampZoom = (z: number) => Math.min(4, Math.max(0.1, z));
  const zoomIn  = (e: React.MouseEvent) => { e.stopPropagation(); setZoom(z => clampZoom(z + 0.25)); };
  const zoomOut = (e: React.MouseEvent) => { e.stopPropagation(); setZoom(z => clampZoom(z - 0.25)); setPan({ x: 0, y: 0 }); };
  const resetView = (e: React.MouseEvent) => { e.stopPropagation(); setZoom(1); setPan({ x: 0, y: 0 }); };

  // Mouse-wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => clampZoom(z - e.deltaY * 0.001));
  }, []);

  // Drag to pan
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag if not clicking a button
    if ((e.target as HTMLElement).closest("button")) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPan({ x: dragStart.current.px + dx, y: dragStart.current.py + dy });
  };
  const handleMouseUp = () => setIsDragging(false);

  // ── Filter button groups ─────────────────────────────────────────────────────
  const statusFilters: { key: FilterKey; label: string; color: string }[] = [
    { key: "Lost",    label: "Lost",    color: "bg-red-500 text-white" },
    { key: "Found",   label: "Found",   color: "bg-emerald-500 text-white" },
    { key: "Missing", label: "Missing", color: "bg-yellow-400 text-black" },
    { key: "Claimed", label: "Claimed", color: "bg-blue-500 text-white" },
  ];
  const categoryFilters: { key: FilterKey; label: string }[] = [
    { key: "Electronics",  label: "Electronics" },
    { key: "Accessories",  label: "Accessories" },
    { key: "Clothing",     label: "Clothing" },
    { key: "Documents",    label: "Documents" },
    { key: "Other",        label: "Other" },
  ];

  const renderMap = (compact: boolean) => (
    <div
      className={`relative w-full rounded-3xl overflow-hidden shadow-2xl border border-white/20 select-none ${compact ? "h-64 sm:h-80" : "h-[70vh]"}`}
      style={{ cursor: isDragging ? "grabbing" : "grab" }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Zoom controls */}
      <div className="absolute top-3 left-3 z-30 flex flex-col gap-1 pointer-events-auto">
        <button onClick={zoomIn}  className="w-9 h-9 bg-white/90 rounded-xl flex items-center justify-center shadow-md hover:bg-white transition border border-black/10 text-black active:scale-95" title="Zoom in"><ZoomIn size={18} /></button>
        <button onClick={zoomOut} className="w-9 h-9 bg-white/90 rounded-xl flex items-center justify-center shadow-md hover:bg-white transition border border-black/10 text-black active:scale-95" title="Zoom out"><ZoomOut size={18} /></button>
        {zoom !== 1 && (
          <button onClick={resetView} className="w-9 h-9 bg-white/90 rounded-xl flex items-center justify-center shadow-md hover:bg-white transition border border-black/10 text-[10px] font-bold text-black active:scale-95">1×</button>
        )}
      </div>

      {/* Zoom level indicator */}
      {zoom !== 1 && (
        <div className="absolute top-3 left-14 z-20 bg-black/50 text-white text-xs font-mono px-2 py-1 rounded-lg backdrop-blur-sm">
          {(zoom * 100).toFixed(0)}%
        </div>
      )}

      {/* Expand / collapse toggle */}
      {compact ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="absolute top-3 right-3 z-30 flex items-center gap-1.5 bg-white/90 rounded-xl px-3 py-2 text-xs font-semibold shadow-md hover:bg-white transition border border-black/10 text-black active:scale-95"
        >
          <Maximize2 size={14} /> Expand Map
        </button>
      ) : (
        <button
          onClick={() => setIsExpanded(false)}
          className="absolute top-3 right-3 z-30 flex items-center gap-1.5 bg-white/90 rounded-xl px-3 py-2 text-xs font-semibold shadow-md hover:bg-white transition border border-black/10 text-black active:scale-95"
        >
          <Minimize2 size={14} /> Collapse
        </button>
      )}

      {/* Map Content */}
      <div className="w-full h-full flex items-center justify-center bg-[#caedd9]">
        <div
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: "center center",
            transition: isDragging ? "none" : "transform 0.15s ease-out",
          }}
          className="relative"
        >
          <div className="relative shadow-2xl bg-white">
            <img
              src="/map.png"
              alt="Campus Map"
              className="block pointer-events-none"
              style={{
                width: compact ? "1100px" : "1600px",
                maxWidth: "none",
                height: "auto"
              }}
              draggable={false}
            />

            {/* Pins */}
            {visiblePins.map((item) => (
              <Link
                key={item.id}
                href={`/detailed?id=${item.id}`}
                className="absolute z-10 group"
                style={{ left: `${item.pinX}%`, top: `${item.pinY}%`, transform: "translate(-50%, -100%)" }}
                onMouseEnter={() => setHoveredPin(item.id)}
                onMouseLeave={() => setHoveredPin(null)}
              >
                <div className={`w-9 h-9 ${PIN_COLOR[item.status] ?? "bg-gray-500"} rounded-full flex items-center justify-center border-2 border-white shadow-lg cursor-pointer hover:scale-125 transition-transform`}>
                  <MapPin size={18} className="text-white" strokeWidth={2.5} />
                </div>
                {hoveredPin === item.id && (
                  <div className="absolute bottom-11 left-1/2 -translate-x-1/2 bg-white text-black font-semibold text-xs px-4 py-2 rounded-2xl shadow-xl whitespace-nowrap z-30 border border-black/10 hover:bg-gray-50 transition-colors">
                    <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${STATUS_DOT[item.status] ?? "bg-gray-400"}`} />
                    {item.title} — {item.location}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Legend (only in compact or bottom right of modal) */}
      <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-black/10 text-xs z-20">
        <p className="font-bold text-black mb-1.5">Legend</p>
        {[{ color: "bg-red-500", label: "Lost" }, { color: "bg-emerald-500", label: "Found" }, { color: "bg-yellow-400", label: "Missing" }, { color: "bg-blue-500", label: "Claimed" }].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5 mb-1 last:mb-0">
            <div className={`w-3 h-3 rounded-full ${color}`} />
            <span className="text-black/80">{label}</span>
          </div>
        ))}
      </div>

      {visiblePins.length === 0 && (
        <div className="absolute inset-0 flex items-end justify-center pb-6 pointer-events-none z-10">
          <div className="bg-black/50 text-white px-6 py-3 rounded-2xl text-sm font-medium backdrop-blur-sm">
            No items match filters
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div
      style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
        width: "100vw",
      }}
      className="flex flex-col font-poppins relative"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
        <div className="absolute right-0 top-24 h-96 w-96 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-lime-200/15 blur-3xl" />
      </div>

      <Sidebar isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />

      <header className="fixed top-0 left-0 z-50 w-full px-4 sm:px-6 pt-4 pointer-events-none">
        <div className="flex items-center justify-between rounded-full border border-white/30 bg-white/25 px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.12)] backdrop-blur-xl lg:[padding-left:calc(18rem+16px)] pointer-events-auto">
          <div className="flex items-center gap-2">
            <button onClick={() => setIsMobileOpen(true)} className="lg:hidden p-2 text-black hover:bg-black/5 rounded-full transition">
              <Menu size={28} strokeWidth={2.2} />
            </button>
            <img src="https://api.builder.io/api/v1/image/assets/TEMP/75c8ab62870811c4b4e6b744abf4c9f3b6161c1a?width=330" alt="Logo" className="h-10 w-auto object-contain" />
            <span className="hidden sm:inline font-medium pl-4 text-black border-l border-black/20 ml-2">Map View</span>
          </div>
          <button onClick={() => setShowNotifications(!showNotifications)} className="relative rounded-full p-2 text-black transition hover:bg-black/5">
            <Bell size={28} strokeWidth={2.1} />
            <span className="absolute -right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[11px] font-bold text-white shadow-sm">1</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col w-full pt-28 pb-8 pl-0 lg:pl-80 px-6 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl w-full">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <MapPin size={34} className="text-[#E1F9DC]" />
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#E1F9DC]">Map View</h1>
            </div>
            <div className="text-sm text-black/60 font-semibold">
              {visiblePins.length} pin{visiblePins.length !== 1 ? "s" : ""} visible
            </div>
          </div>

          <div className="mb-5 space-y-4">
            <div>
              <p className="text-xs font-semibold text-black/60 uppercase tracking-widest mb-2">Status</p>
              <div className="flex flex-wrap gap-2">
                {statusFilters.map(({ key, label, color }) => (
                  <button key={key} onClick={() => toggleFilter(key)}
                    className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${activeFilters.has(key) ? color + " shadow-md scale-105" : "border border-black/25 bg-white/15 text-black hover:bg-white/30"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-black/60 uppercase tracking-widest mb-2">Category</p>
              <div className="flex flex-wrap gap-2">
                {categoryFilters.map(({ key, label }) => (
                  <button key={key} onClick={() => toggleFilter(key)}
                    className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${activeFilters.has(key) ? "bg-black text-white shadow-md scale-105" : "border border-black/25 bg-white/15 text-black hover:bg-white/30"}`}>
                    {label}
                  </button>
                ))}
                {activeFilters.size > 0 && (
                  <button onClick={() => setActiveFilters(new Set())} className="rounded-full px-4 py-2 text-sm font-semibold bg-red-100 text-red-600 hover:bg-red-200 transition-all border border-red-200">Clear ×</button>
                )}
              </div>
            </div>
          </div>

          <div className="h-px bg-black/15 w-full mb-6" />

          {renderMap(true)}

          <p className="text-center text-black/40 text-[10px] mt-4 uppercase tracking-[0.2em]">
            🖱 Scroll to zoom · Drag to pan · Click pins to view details
          </p>
        </div>
      </main>

      {/* Fullscreen modal */}
      {isExpanded && (
        <div className="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-md flex flex-col p-4 sm:p-8">
          <div className="w-full max-w-7xl mx-auto flex flex-col h-full bg-white/10 rounded-[3rem] border border-white/20 overflow-hidden shadow-2xl backdrop-blur-xl">
             <div className="flex items-center justify-between px-8 py-6 border-b border-white/10 flex-shrink-0">
               <h2 className="text-white font-bold text-2xl flex items-center gap-3">
                 <MapPin size={28} /> Campus Map — Full View
               </h2>
               <div className="flex items-center gap-4">
                  <div className="hidden md:flex gap-2">
                    {statusFilters.map(({ key, label, color }) => (
                      <button key={key} onClick={() => toggleFilter(key)}
                        className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${activeFilters.has(key) ? color : "bg-white/10 text-white hover:bg-white/20"}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setIsExpanded(false)} className="p-3 bg-white/20 hover:bg-white/30 text-white rounded-2xl transition-all">
                    <X size={24} />
                  </button>
               </div>
             </div>
             <div className="flex-1 overflow-hidden relative">
                {renderMap(false)}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
