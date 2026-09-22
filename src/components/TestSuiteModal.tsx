import { useState } from 'react';
import { Sparkles, Play, CheckCircle2, XCircle, AlertCircle, X, Loader2 } from 'lucide-react';
import { generateTestCasesForEndpoint } from '../data/mockApis';
import { GeneratedTestCase } from '../types';

interface TestSuiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetEndpoint: string;
  method: string;
}

export function TestSuiteModal({ isOpen, onClose, targetEndpoint, method }: TestSuiteModalProps) {
  const [testCases, setTestCases] = useState<GeneratedTestCase[]>(() => 
    generateTestCasesForEndpoint(targetEndpoint, method)
  );
  const [isRunningAll, setIsRunningAll] = useState(false);

  if (!isOpen) return null;

  const handleRunAll = async () => {
    setIsRunningAll(true);

    // Reset status
    setTestCases(prev => prev.map(tc => ({ ...tc, status: 'idle', actualStatus: undefined, latencyMs: undefined })));

    for (let i = 0; i < testCases.length; i++) {
      // Mark running
      setTestCases(prev => prev.map((tc, idx) => idx === i ? { ...tc, status: 'running' } : tc));
      
      await new Promise(r => setTimeout(r, 450));

      // Resolve test
      setTestCases(prev => prev.map((tc, idx) => {
        if (idx !== i) return tc;
        const latency = Math.floor(Math.random() * 80) + 45;
        // Positive passes with 200, negative pass if they correctly trigger expected 400/401/422 status
        const simulatedActual = tc.category === 'positive' ? 200 : tc.expectedStatus;
        const passed = simulatedActual === tc.expectedStatus;
        return {
          ...tc,
          status: passed ? 'passed' : 'failed',
          actualStatus: simulatedActual,
          latencyMs: latency
        };
      }));
    }

    setIsRunningAll(false);
  };

  const passedCount = testCases.filter(t => t.status === 'passed').length;
  const failedCount = testCases.filter(t => t.status === 'failed').length;
  const totalCount = testCases.length;

  return (
    <div id="test-suite-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                AI Automated Test Matrix
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                  Closed-Loop QA
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Generated positive & negative boundary validation cases for <span className="font-mono text-slate-300">{method} {targetEndpoint.split('/').slice(-2).join('/')}</span>
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

        {/* Summary Bar */}
        <div className="px-6 py-3 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs">
            <span className="text-slate-400">
              Total Tests: <strong className="text-slate-200">{totalCount}</strong>
            </span>
            <span className="text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> {passedCount} Passed
            </span>
            {failedCount > 0 && (
              <span className="text-rose-400 flex items-center gap-1 font-medium">
                <XCircle className="w-3.5 h-3.5" /> {failedCount} Failed
              </span>
            )}
          </div>

          <button
            id="run-all-tests-btn"
            onClick={handleRunAll}
            disabled={isRunningAll}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition disabled:opacity-50"
          >
            {isRunningAll ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Executing Matrix...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                Run All 5 Test Cases
              </>
            )}
          </button>
        </div>

        {/* Test List */}
        <div className="p-6 overflow-y-auto space-y-3">
          {testCases.map((tc) => (
            <div
              key={tc.id}
              className={`p-3.5 rounded-xl border transition flex items-center justify-between gap-4 ${
                tc.status === 'passed'
                  ? 'bg-emerald-950/10 border-emerald-500/30'
                  : tc.status === 'failed'
                  ? 'bg-rose-950/10 border-rose-500/30'
                  : tc.status === 'running'
                  ? 'bg-indigo-950/20 border-indigo-500/40 ring-1 ring-indigo-500/20'
                  : 'bg-slate-950/50 border-slate-800'
              }`}
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold ${
                    tc.category === 'positive' 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : tc.category === 'auth_security'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}>
                    {tc.categoryLabel}
                  </span>
                  <h4 className="text-xs font-semibold text-slate-200 truncate">{tc.name}</h4>
                </div>
                <p className="text-[11px] text-slate-400">{tc.description}</p>
              </div>

              {/* Status and Expected */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-mono">
                    Expected: {tc.expectedStatus}
                  </span>
                  {tc.actualStatus && (
                    <span className={`text-[10px] font-mono font-bold block ${
                      tc.status === 'passed' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      Actual: {tc.actualStatus} ({tc.latencyMs}ms)
                    </span>
                  )}
                </div>

                <div className="w-8 flex items-center justify-center">
                  {tc.status === 'idle' && (
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                  )}
                  {tc.status === 'running' && (
                    <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                  )}
                  {tc.status === 'passed' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                  {tc.status === 'failed' && (
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Automates negative and boundary assertion suites before production deployments
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
