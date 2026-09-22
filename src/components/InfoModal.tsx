import { X, CheckCircle, Zap, Shield, Sparkles } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InfoModal({ isOpen, onClose }: InfoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center font-black text-slate-950 text-xs font-mono">
              FL
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100 font-mono">
                fixloop-ai — Project Summary
              </h2>
              <p className="text-xs text-slate-400">
                Hackathon MVP Prototype Overview & Architecture
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300 leading-relaxed">
          {/* Pitch */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Official Hackathon Pitch
            </span>
            <p className="text-sm font-medium text-amber-100 italic">
              "AI Mobile API Debugger transforms an iQOO smartphone into an intelligent API debugging companion. Developers can describe API tests naturally using voice, scan API documentation with the camera, execute requests, receive AI-powered failure analysis, generate fixes, and automatically retest — turning API debugging from a manual process into an intelligent, conversational workflow."
            </p>
          </div>

          {/* Main Innovation */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              Main Innovation: Closed-Loop API Debugging
            </h3>
            <p className="text-slate-300">
              <strong className="text-amber-400">Test → Diagnose → Suggest Fix → Retest.</strong> Instead of simply reporting that an API returned an error, the system attempts to determine why it happened, what should be tested next, and whether the proposed fix works.
            </p>
          </div>

          {/* Implementation Priorities */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              Hackathon Implementation Priorities (from Architecture Doc)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-1">
                <span className="text-[10px] font-mono font-bold text-emerald-400 block">
                  P0 — Must Work (Live MVP)
                </span>
                <p className="text-[11px] text-slate-400">
                  API execution → AI diagnosis → generated fix → automatic retest → verified result.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-1">
                <span className="text-[10px] font-mono font-bold text-cyan-400 block">
                  P1 — Included
                </span>
                <p className="text-[11px] text-slate-400">
                  Voice commands (Speech-to-text) and simple test history audit dashboard.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-purple-500/30 space-y-1">
                <span className="text-[10px] font-mono font-bold text-purple-400 block">
                  P2 — Interactive Preview
                </span>
                <p className="text-[11px] text-slate-400">
                  Camera / OCR scanner simulation, AI test suite matrix generation, Spring Boot telemetry.
                </p>
              </div>
            </div>
          </div>

          {/* End-to-End Flow */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 font-mono text-[11px]">
            <span className="text-slate-400 block uppercase font-bold text-[10px]">
              End-to-End Core Loop:
            </span>
            <p className="text-amber-300">
              Natural Language ➔ Intent ➔ Request ➔ Execute ➔ Analyze ➔ Diagnose ➔ Fix ➔ Retest ➔ Verify
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
