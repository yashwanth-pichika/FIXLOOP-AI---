import { Smartphone, LayoutDashboard, Info, Zap, Sparkles } from 'lucide-react';

interface NavbarProps {
  viewMode: 'phone' | 'workbench';
  setViewMode: (mode: 'phone' | 'workbench') => void;
  onOpenInfo: () => void;
}

export function Navbar({ viewMode, setViewMode, onOpenInfo }: NavbarProps) {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black text-xs">
            FL
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-slate-100 tracking-tight font-mono">
                fixloop-ai
              </h1>
              <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                Hackathon MVP
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block font-medium">
              AI Developer
            </p>
          </div>
        </div>

        {/* View Switcher & Action Controls */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              id="switch-phone-view-btn"
              onClick={() => setViewMode('phone')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'phone'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>iQOO Phone</span>
            </button>
            <button
              id="switch-workbench-view-btn"
              onClick={() => setViewMode('workbench')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'workbench'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dev Workbench</span>
            </button>
          </div>

          <button
            id="open-info-modal-btn"
            onClick={onOpenInfo}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-amber-400 transition"
            title="System Architecture & Pitch Info"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
