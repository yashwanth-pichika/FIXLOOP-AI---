import { useState } from 'react';
import { 
  ApiTestRequest, 
  ApiExecutionResult, 
  DiagnosisResult, 
  RetestResult, 
  PipelineStage 
} from '../types';
import { 
  Terminal, 
  Activity, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Sparkles, 
  ArrowRight, 
  Globe, 
  Layers 
} from 'lucide-react';

interface WorkbenchViewProps {
  currentStage: PipelineStage;
  activeRequest: ApiTestRequest | null;
  executionResult: ApiExecutionResult | null;
  diagnosis: DiagnosisResult | null;
  retestResult: RetestResult | null;
  onAutoFixAndRetest: () => void;
  onOpenOcr: () => void;
  onOpenTestSuite: () => void;
  onOpenHistory: () => void;
}

export function WorkbenchView({
  currentStage,
  activeRequest,
  executionResult,
  diagnosis,
  retestResult,
  onAutoFixAndRetest,
  onOpenOcr,
  onOpenTestSuite,
  onOpenHistory
}: WorkbenchViewProps) {
  const [activeConsoleTab, setActiveConsoleTab] = useState<'response' | 'headers' | 'curl' | 'diff'>('response');
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const generateCurl = () => {
    if (!activeRequest) return '';
    let curl = `curl -X ${activeRequest.method} "${activeRequest.url}"`;
    if (activeRequest.headers) {
      Object.entries(activeRequest.headers).forEach(([k, v]) => {
        curl += ` \\\n  -H "${k}: ${v}"`;
      });
    }
    if (activeRequest.body) {
      curl += ` \\\n  -d '${activeRequest.body.replace(/\n/g, '')}'`;
    }
    return curl;
  };

  return (
    <div className="space-y-4">
      {/* Top Telemetry Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
              Spring Boot Orchestration Engine
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                v3.3.1 Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Coordinating Intent Parsing ➔ WebClient Execution ➔ LLM Diagnosis ➔ Retest Service
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenOcr}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
          >
            Scan Spec (OCR)
          </button>
          <button
            onClick={onOpenTestSuite}
            className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 text-xs font-medium transition"
          >
            AI Test Matrix
          </button>
          <button
            onClick={onOpenHistory}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
          >
            Audit History
          </button>
        </div>
      </div>

      {/* Main Grid: Request/Response Telemetry vs AI Diagnosis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Card: HTTP Request & Response Telemetry */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Target API Console
              </span>
            </div>

            {executionResult && (
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className={`px-2 py-0.5 rounded font-bold ${
                  executionResult.statusCode >= 200 && executionResult.statusCode < 300
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  HTTP {executionResult.statusCode}
                </span>
                <span className="text-slate-400">{executionResult.latencyMs}ms</span>
              </div>
            )}
          </div>

          {/* Sub-tabs */}
          <div className="flex border-b border-slate-800 bg-slate-950 px-4 pt-2 gap-2 text-xs">
            <button
              onClick={() => setActiveConsoleTab('response')}
              className={`pb-2 px-2.5 font-medium border-b-2 transition ${
                activeConsoleTab === 'response'
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Response Payload
            </button>
            <button
              onClick={() => setActiveConsoleTab('headers')}
              className={`pb-2 px-2.5 font-medium border-b-2 transition ${
                activeConsoleTab === 'headers'
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              HTTP Headers
            </button>
            <button
              onClick={() => setActiveConsoleTab('curl')}
              className={`pb-2 px-2.5 font-medium border-b-2 transition ${
                activeConsoleTab === 'curl'
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              cURL Command
            </button>
            {retestResult && (
              <button
                onClick={() => setActiveConsoleTab('diff')}
                className={`pb-2 px-2.5 font-medium border-b-2 transition flex items-center gap-1.5 ${
                  activeConsoleTab === 'diff'
                    ? 'border-emerald-400 text-emerald-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Payload Diff
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-4 flex-1 font-mono text-xs overflow-y-auto max-h-[380px] bg-slate-950/80">
            {activeRequest ? (
              <>
                {activeConsoleTab === 'response' && (
                  <pre className="text-slate-300 leading-relaxed text-[11px] whitespace-pre-wrap">
                    {retestResult ? retestResult.newResponse.rawBody : executionResult?.rawBody || 'Awaiting response...'}
                  </pre>
                )}

                {activeConsoleTab === 'headers' && executionResult && (
                  <div className="space-y-1.5 text-[11px]">
                    {Object.entries(executionResult.headers).map(([k, v]) => (
                      <div key={k} className="flex justify-between border-b border-slate-800/60 pb-1">
                        <span className="text-slate-400">{k}:</span>
                        <span className="text-slate-200 text-right truncate max-w-[260px]">{v}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeConsoleTab === 'curl' && (
                  <div className="space-y-2">
                    <pre className="text-amber-300 text-[11px] whitespace-pre-wrap">
                      {generateCurl()}
                    </pre>
                    <button
                      onClick={() => handleCopy(generateCurl())}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      {copied ? 'Copied!' : 'Copy cURL'}
                    </button>
                  </div>
                )}

                {activeConsoleTab === 'diff' && retestResult && (
                  <div className="space-y-3">
                    <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-900/60">
                      <span className="text-[10px] text-rose-400 font-bold uppercase block mb-1">
                        Original Failed Request Payload:
                      </span>
                      <pre className="text-rose-300 text-[11px] max-h-32 overflow-y-auto">
                        {activeRequest.body || 'No payload body'}
                      </pre>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-900/60">
                      <span className="text-[10px] text-emerald-400 font-bold uppercase block mb-1">
                        AI Generated Corrected Payload:
                      </span>
                      <pre className="text-emerald-300 text-[11px] max-h-32 overflow-y-auto">
                        {retestResult.newResponse.request.body || JSON.stringify(retestResult.newResponse.request.headers, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-8 text-center text-slate-500 font-sans text-xs">
                No active execution. Trigger a command from the phone or choose a preset scenario.
              </div>
            )}
          </div>
        </div>

        {/* Right Card: AI Senior Developer Analysis & Retest Engine */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                AI Analysis & Fix Engine
              </span>
            </div>

            {diagnosis && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                {diagnosis.confidence}% Accuracy
              </span>
            )}
          </div>

          <div className="p-4 flex-1 space-y-4 overflow-y-auto max-h-[380px]">
            {diagnosis ? (
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">Failure Category:</span>
                    <h4 className="text-xs font-bold text-rose-400 mt-0.5">{diagnosis.failureType}</h4>
                  </div>
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                    diagnosis.severity === 'critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                    diagnosis.severity === 'high' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                    'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {diagnosis.severity} severity
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">Root Cause Deduction:</span>
                    <p className="text-xs text-slate-200 font-medium mt-0.5 leading-relaxed">
                      {diagnosis.rootCause}
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 leading-normal">
                    {diagnosis.explanation}
                  </p>
                  <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400">
                    Standard: <span className="text-slate-300">{diagnosis.rfcReference}</span>
                  </div>
                </div>

                {/* Retest Output or Action Button */}
                {retestResult ? (
                  <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Closed-Loop Retest Succeeded (HTTP {retestResult.newStatusCode})</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-300">
                        {retestResult.newResponse.latencyMs}ms
                      </span>
                    </div>
                    <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                      {retestResult.changesSummary.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <button
                    onClick={onAutoFixAndRetest}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition"
                  >
                    <Sparkles className="w-4 h-4 fill-current" />
                    Auto-Generate Fix & Execute Retest
                  </button>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs">
                When an API returns an error status (4xx / 5xx), the AI Diagnosis Engine will display root-cause explanations and automated repair solutions here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
