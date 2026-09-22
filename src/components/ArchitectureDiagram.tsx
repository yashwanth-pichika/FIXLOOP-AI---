import { PipelineStage } from '../types';
import { Smartphone, Server, Cpu, Globe, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface ArchitectureDiagramProps {
  currentStage: PipelineStage;
}

export function ArchitectureDiagram({ currentStage }: ArchitectureDiagramProps) {
  // Determine which system block is actively processing
  const isMobileActive = currentStage === 'intent' || currentStage === 'verify';
  const isSpringControllerActive = currentStage === 'request';
  const isExecutionServiceActive = currentStage === 'execute' || currentStage === 'retest';
  const isAiServiceActive = currentStage === 'analyze' || currentStage === 'diagnose' || currentStage === 'fix';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            System Architecture & Execution Pipeline
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-semibold">
              Hackathon Architecture
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Real-time telemetry trace across Android Client, Spring Boot Orchestrator, AI Engine, and Target API
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[11px]">System Online</span>
        </div>
      </div>

      {/* Horizontal Flow Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
        {/* Node 1: Mobile App */}
        <div className={`p-3.5 rounded-xl border transition-all duration-300 flex flex-col justify-between ${
          isMobileActive
            ? 'bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30'
            : 'bg-slate-950/60 border-slate-800'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300">
                <Smartphone className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-mono text-slate-400 uppercase">Input Layer</span>
            </div>
            <h4 className="text-xs font-bold text-slate-200">iQOO Smartphone</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Voice input, minimal UI, test controls, results, history
            </p>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
            <span className="text-slate-400">Android 14 (Kotlin)</span>
            {isMobileActive && <span className="text-amber-400 font-bold animate-pulse">ACTIVE</span>}
          </div>
        </div>

        {/* Node 2: Spring Boot API Controllers */}
        <div className={`p-3.5 rounded-xl border transition-all duration-300 flex flex-col justify-between ${
          isSpringControllerActive
            ? 'bg-blue-500/10 border-blue-500/60 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/30'
            : 'bg-slate-950/60 border-slate-800'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-300">
                <Server className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-mono text-slate-400 uppercase">Controller Layer</span>
            </div>
            <h4 className="text-xs font-bold text-slate-200">Spring Boot API</h4>
            <div className="mt-1 space-y-0.5 text-[10px] font-mono text-slate-400">
              <p>• TestController</p>
              <p>• CommandController</p>
              <p>• HistoryController</p>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
            <span className="text-slate-400">Java + Spring Web</span>
            {isSpringControllerActive && <span className="text-blue-400 font-bold animate-pulse">ACTIVE</span>}
          </div>
        </div>

        {/* Node 3: AI Orchestrator & Services */}
        <div className={`p-3.5 rounded-xl border transition-all duration-300 flex flex-col justify-between ${
          isAiServiceActive || isExecutionServiceActive
            ? 'bg-purple-500/10 border-purple-500/60 shadow-lg shadow-purple-500/10 ring-1 ring-purple-500/30'
            : 'bg-slate-950/60 border-slate-800'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300">
                <Cpu className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-mono text-slate-400 uppercase">Service & AI Layer</span>
            </div>
            <h4 className="text-xs font-bold text-slate-200">AI Senior Orchestrator</h4>
            <div className="mt-1 space-y-0.5 text-[10px] font-mono text-slate-400">
              <p>• ApiExecutionService</p>
              <p>• AiAnalysisService</p>
              <p>• RetestService</p>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
            <span className="text-slate-400">LLM Reasoning Engine</span>
            {(isAiServiceActive || isExecutionServiceActive) && (
              <span className="text-purple-400 font-bold animate-pulse">ACTIVE</span>
            )}
          </div>
        </div>

        {/* Node 4: Target REST APIs */}
        <div className={`p-3.5 rounded-xl border transition-all duration-300 flex flex-col justify-between ${
          currentStage === 'execute' || currentStage === 'retest'
            ? 'bg-emerald-500/10 border-emerald-500/60 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30'
            : 'bg-slate-950/60 border-slate-800'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300">
                <Globe className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-mono text-slate-400 uppercase">Target Domain</span>
            </div>
            <h4 className="text-xs font-bold text-slate-200">Target REST APIs</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Auth, Payment Gateways, CRUD Services, Microservices
            </p>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
            <span className="text-slate-400">HTTP/2 • TLS 1.3</span>
            {(currentStage === 'execute' || currentStage === 'retest') && (
              <span className="text-emerald-400 font-bold animate-pulse">EXECUTING</span>
            )}
          </div>
        </div>
      </div>

      {/* Core Loop Step Indicator */}
      <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            End-to-End Closed Loop Flow:
          </span>
          <span className="font-mono text-[10px] text-slate-500">
            Natural Language ➔ Intent ➔ Request ➔ Execute ➔ Analyze ➔ Diagnose ➔ Fix ➔ Retest ➔ Verify
          </span>
        </div>

        <div className="flex items-center justify-between overflow-x-auto gap-1 py-1">
          {[
            { id: 'intent', label: '1. Intent' },
            { id: 'request', label: '2. Request' },
            { id: 'execute', label: '3. Execute' },
            { id: 'analyze', label: '4. Analyze' },
            { id: 'diagnose', label: '5. Diagnose' },
            { id: 'fix', label: '6. Gen Fix' },
            { id: 'retest', label: '7. Retest' },
            { id: 'verify', label: '8. Verify' }
          ].map((step, idx) => {
            const isCurrent = currentStage === step.id;
            return (
              <div key={step.id} className="flex items-center shrink-0">
                <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded transition ${
                  isCurrent 
                    ? 'bg-amber-500 text-slate-950 font-bold ring-2 ring-amber-400/50' 
                    : 'bg-slate-900 text-slate-400'
                }`}>
                  {step.label}
                </span>
                {idx < 7 && <span className="text-slate-700 mx-1">›</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
