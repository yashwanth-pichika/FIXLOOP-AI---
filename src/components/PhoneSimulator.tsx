import { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Send, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Camera, 
  Layers, 
  History, 
  ChevronRight, 
  Copy, 
  ArrowRight,
  Wifi,
  BatteryCharging,
  SlidersHorizontal,
  Code2
} from 'lucide-react';
import { 
  ApiTestRequest, 
  ApiExecutionResult, 
  DiagnosisResult, 
  RetestResult, 
  PipelineStage 
} from '../types';
import { DEMO_PRESET_SCENARIOS } from '../data/mockApis';
import { debuggerEngine } from '../services/apiExecutionService';

interface PhoneSimulatorProps {
  onOpenOcr: () => void;
  onOpenTestSuite: () => void;
  onOpenHistory: () => void;
  onStageChange?: (stage: PipelineStage) => void;
  externalRequestToLoad?: ApiTestRequest | null;
}

export function PhoneSimulator({
  onOpenOcr,
  onOpenTestSuite,
  onOpenHistory,
  onStageChange,
  externalRequestToLoad
}: PhoneSimulatorProps) {
  const [inputCommand, setInputCommand] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [currentStage, setCurrentStage] = useState<PipelineStage>('idle');
  const [activeRequest, setActiveRequest] = useState<ApiTestRequest | null>(null);
  const [executionResult, setExecutionResult] = useState<ApiExecutionResult | null>(null);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [retestResult, setRetestResult] = useState<RetestResult | null>(null);
  const [activeTab, setActiveTab] = useState<'diagnosis' | 'response' | 'diff' | 'headers'>('diagnosis');
  const [currentTime, setCurrentTime] = useState('09:41');

  const recognitionRef = useRef<any>(null);

  // Sync stage to parent for architecture telemetry
  useEffect(() => {
    onStageChange?.(currentStage);
  }, [currentStage, onStageChange]);

  // Keep phone clock realistic
  useEffect(() => {
    const updateClock = () => {
      const d = new Date();
      setCurrentTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle external OCR or historical requests
  useEffect(() => {
    if (externalRequestToLoad) {
      setInputCommand(externalRequestToLoad.commandPrompt);
      runPipelineForRequest(externalRequestToLoad);
    }
  }, [externalRequestToLoad]);

  // Initialize Speech Recognition if browser supports it
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const speechToText = event.results[0][0].transcript;
          setInputCommand(speechToText);
          setIsListening(false);
          // Auto execute voice command
          executeCommandString(speechToText);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } catch {
        // Fallback
      }
    }
  }, []);

  const toggleVoiceRecording = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {
          // If already started or permission blocked, simulate voice prompt
          simulateVoiceInput();
        }
      } else {
        simulateVoiceInput();
      }
    }
  };

  const simulateVoiceInput = () => {
    // Pick random demo scenario for instant interactive delight
    const randomScenario = DEMO_PRESET_SCENARIOS[Math.floor(Math.random() * DEMO_PRESET_SCENARIOS.length)];
    setTimeout(() => {
      setInputCommand(randomScenario.voicePrompt);
      setIsListening(false);
      executeCommandString(randomScenario.voicePrompt);
    }, 1200);
  };

  // Main closed-loop execution pipeline
  const executeCommandString = async (cmd: string) => {
    if (!cmd.trim()) return;

    setExecutionResult(null);
    setDiagnosis(null);
    setRetestResult(null);
    setActiveTab('diagnosis');

    // Step 1 & 2: Intent Understanding
    setCurrentStage('intent');
    await new Promise(r => setTimeout(r, 350));

    // Step 3: Command Service converts into structured ApiTestRequest
    setCurrentStage('request');
    const parsedRequest = debuggerEngine.parseNaturalLanguageIntent(cmd);
    setActiveRequest(parsedRequest);
    await new Promise(r => setTimeout(r, 400));

    // Step 4 & 5: API Execution Engine runs request
    setCurrentStage('execute');
    const result = await debuggerEngine.executeRequest(parsedRequest);
    setExecutionResult(result);

    // If it failed (HTTP 4xx or 5xx), run AI Diagnosis
    if (!result.isSuccess) {
      setCurrentStage('analyze');
      await new Promise(r => setTimeout(r, 450));

      setCurrentStage('diagnose');
      const diag = debuggerEngine.diagnoseFailure(result);
      setDiagnosis(diag);
      await new Promise(r => setTimeout(r, 350));

      setCurrentStage('idle');
    } else {
      setCurrentStage('verify');
      setTimeout(() => setCurrentStage('idle'), 1000);
    }
  };

  const runPipelineForRequest = async (req: ApiTestRequest) => {
    setExecutionResult(null);
    setDiagnosis(null);
    setRetestResult(null);
    setActiveTab('diagnosis');

    setCurrentStage('request');
    setActiveRequest(req);
    await new Promise(r => setTimeout(r, 300));

    setCurrentStage('execute');
    const result = await debuggerEngine.executeRequest(req);
    setExecutionResult(result);

    if (!result.isSuccess) {
      setCurrentStage('analyze');
      await new Promise(r => setTimeout(r, 400));
      setCurrentStage('diagnose');
      const diag = debuggerEngine.diagnoseFailure(result);
      setDiagnosis(diag);
      setCurrentStage('idle');
    } else {
      setCurrentStage('verify');
      setTimeout(() => setCurrentStage('idle'), 1000);
    }
  };

  // Step 6, 7 & 8: AI Fix & Automatic Retest
  const handleAutoFixAndRetest = async () => {
    if (!executionResult || !diagnosis) return;

    setCurrentStage('fix');
    await new Promise(r => setTimeout(r, 450));

    setCurrentStage('retest');
    const retest = await debuggerEngine.executeRetest(executionResult, diagnosis);
    setRetestResult(retest);
    setActiveTab('diff');

    setCurrentStage('verify');
    setTimeout(() => setCurrentStage('idle'), 1200);
  };

  return (
    <div className="relative mx-auto w-full max-w-[420px] aspect-[9/19.5] min-h-[780px] bg-slate-950 rounded-[44px] p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.1),0_0_0_4px_rgba(30,41,59,0.5)] border-2 border-slate-700/60 flex flex-col justify-between overflow-hidden text-slate-100 select-none">
      {/* Phone Hardware Details: Speaker Ear Piece & Front Punch Hole Camera */}
      <div className="absolute top-2 inset-x-0 flex justify-center items-center z-30 pointer-events-none">
        <div className="w-16 h-1 bg-slate-800 rounded-full" />
      </div>

      {/* Screen Inner Frame */}
      <div className="relative w-full h-full bg-slate-900 rounded-[36px] overflow-hidden flex flex-col justify-between border border-slate-800/90 shadow-inner">
        {/* Status Bar */}
        <div className="h-10 px-6 pt-1 flex items-center justify-between text-xs font-mono text-slate-400 bg-slate-950/80 backdrop-blur-md z-20 shrink-0">
          <span className="font-bold text-slate-200">{currentTime}</span>
          
          {/* Punch Hole Camera Reticle */}
          <div className="w-4 h-4 rounded-full bg-black border border-slate-800 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
          </div>

          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-[10px] font-bold text-amber-400">5G</span>
            <Wifi className="w-3.5 h-3.5 text-slate-300" />
            <div className="flex items-center gap-0.5">
              <span className="text-[10px] text-slate-300">98%</span>
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Top App Header */}
        <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800/90 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center font-black text-slate-950 text-[11px] shadow-md shadow-amber-500/30 font-mono">
              FL
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-100 tracking-tight font-mono">fixloop-ai</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                  iQOO Neo
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              id="phone-ocr-trigger-btn"
              onClick={onOpenOcr}
              title="Camera / OCR Scanner"
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800 transition"
            >
              <Camera className="w-4 h-4" />
            </button>
            <button
              id="phone-test-matrix-btn"
              onClick={onOpenTestSuite}
              title="AI Test Suite Matrix"
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-indigo-400 border border-slate-800 transition"
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              id="phone-history-btn"
              onClick={onOpenHistory}
              title="Test History"
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 border border-slate-800 transition"
            >
              <History className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Main Phone Viewport */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Active Pipeline Status Indicator */}
          {currentStage !== 'idle' && (
            <div className="bg-amber-500/10 border border-amber-500/40 rounded-xl p-2.5 flex items-center justify-between text-xs animate-in fade-in duration-150">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
                <span className="font-semibold text-amber-300 text-[11px] capitalize">
                  {currentStage === 'intent' && 'Parsing Voice Intent...'}
                  {currentStage === 'request' && 'Structuring HTTP Test Request...'}
                  {currentStage === 'execute' && 'Sending to Target REST API...'}
                  {currentStage === 'analyze' && 'Analyzing Response & Status Code...'}
                  {currentStage === 'diagnose' && 'Generating AI Senior Diagnosis...'}
                  {currentStage === 'fix' && 'Synthesizing Corrected Payload...'}
                  {currentStage === 'retest' && 'Retest Engine: Executing Fix...'}
                  {currentStage === 'verify' && 'Verifying Fix Outcome...'}
                </span>
              </div>
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">
                {currentStage}
              </span>
            </div>
          )}

          {/* Preset Voice Instructions Bar */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center justify-between">
              <span>Quick Voice Scenarios:</span>
              <span className="text-[9px] text-amber-400 font-mono">1-Tap Simulate</span>
            </span>
            <div className="flex overflow-x-auto gap-1.5 pb-1 no-scrollbar">
              {DEMO_PRESET_SCENARIOS.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => {
                    setInputCommand(sc.voicePrompt);
                    executeCommandString(sc.voicePrompt);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-medium text-slate-300 hover:text-amber-300 hover:border-amber-500/50 hover:bg-amber-500/10 shrink-0 transition text-left"
                >
                  <span className="block text-[9px] text-slate-500 font-mono uppercase">{sc.badge}</span>
                  <span className="truncate max-w-[140px] block">{sc.voicePrompt}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Request Execution Card */}
          {activeRequest && executionResult && (
            <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
              <div className="p-3 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    activeRequest.method === 'POST'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}>
                    {activeRequest.method}
                  </span>
                  <span className="text-xs font-semibold text-slate-200 truncate">
                    {activeRequest.scenarioTitle}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    executionResult.statusCode >= 200 && executionResult.statusCode < 300
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {executionResult.statusCode} {executionResult.statusText}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {executionResult.latencyMs}ms
                  </span>
                </div>
              </div>

              {/* Sub-tabs inside execution card */}
              <div className="flex border-b border-slate-800/80 bg-slate-950 px-2 pt-1.5 gap-1 text-[11px]">
                {diagnosis && (
                  <button
                    onClick={() => setActiveTab('diagnosis')}
                    className={`px-2.5 py-1 rounded-t-lg font-medium transition ${
                      activeTab === 'diagnosis'
                        ? 'bg-slate-900 text-amber-400 border-t border-x border-slate-800'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    AI Diagnosis
                  </button>
                )}
                {retestResult && (
                  <button
                    onClick={() => setActiveTab('diff')}
                    className={`px-2.5 py-1 rounded-t-lg font-medium transition flex items-center gap-1 ${
                      activeTab === 'diff'
                        ? 'bg-slate-900 text-emerald-400 border-t border-x border-slate-800'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Fix & Retest Diff
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('response')}
                  className={`px-2.5 py-1 rounded-t-lg font-medium transition ${
                    activeTab === 'response'
                      ? 'bg-slate-900 text-slate-200 border-t border-x border-slate-800'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Response JSON
                </button>
                <button
                  onClick={() => setActiveTab('headers')}
                  className={`px-2.5 py-1 rounded-t-lg font-medium transition ${
                    activeTab === 'headers'
                      ? 'bg-slate-900 text-slate-200 border-t border-x border-slate-800'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Headers
                </button>
              </div>

              {/* Tab: AI Diagnosis */}
              {activeTab === 'diagnosis' && diagnosis && (
                <div className="p-3 bg-slate-900/40 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{diagnosis.failureType}</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30 shrink-0">
                      {diagnosis.confidence}% Confidence
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800/90 space-y-1.5 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono uppercase block">Root Cause:</span>
                      <p className="text-slate-200 font-medium text-[11px] leading-relaxed">
                        {diagnosis.rootCause}
                      </p>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      {diagnosis.explanation}
                    </p>
                    <div className="pt-1 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
                      RFC Reference: <span className="text-slate-300">{diagnosis.rfcReference}</span>
                    </div>
                  </div>

                  {/* Auto Fix & Retest CTA */}
                  {!retestResult && (
                    <button
                      id="phone-auto-fix-btn"
                      onClick={handleAutoFixAndRetest}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition"
                    >
                      <Sparkles className="w-4 h-4 fill-current" />
                      Auto-Generate Fix & Retest
                    </button>
                  )}
                </div>
              )}

              {/* Tab: Fix & Retest Diff */}
              {activeTab === 'diff' && retestResult && (
                <div className="p-3 bg-slate-900/40 space-y-2.5">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Issue Resolved: {retestResult.newStatusCode} OK</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-300">
                      {retestResult.newResponse.latencyMs}ms ({retestResult.latencyDeltaMs >= 0 ? '+' : ''}{retestResult.latencyDeltaMs}ms)
                    </span>
                  </div>

                  {/* Diff Blocks */}
                  <div className="space-y-1.5 text-[10px] font-mono">
                    <div className="p-2 rounded-lg bg-rose-950/30 border border-rose-900/60 text-rose-300 overflow-x-auto">
                      <div className="text-[9px] uppercase text-rose-400 font-bold mb-1">Original Request (Failed):</div>
                      <pre className="max-h-24 overflow-x-auto">
                        {activeRequest.body || 'No body payload'}
                      </pre>
                    </div>

                    <div className="flex justify-center my-0.5">
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 rotate-90" />
                    </div>

                    <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-900/60 text-emerald-300 overflow-x-auto">
                      <div className="text-[9px] uppercase text-emerald-400 font-bold mb-1">AI Corrected Payload:</div>
                      <pre className="max-h-24 overflow-x-auto">
                        {retestResult.newResponse.request.body || JSON.stringify(retestResult.newResponse.request.headers, null, 2)}
                      </pre>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-slate-400">
                    <strong className="text-slate-200">Summary: </strong>
                    {retestResult.changesSummary.join(' • ')}
                  </div>
                </div>
              )}

              {/* Tab: Response Body */}
              {activeTab === 'response' && (
                <div className="p-2.5 bg-slate-950 font-mono text-[11px] overflow-x-auto max-h-56">
                  <pre className="text-slate-300">
                    {retestResult 
                      ? retestResult.newResponse.rawBody 
                      : executionResult.rawBody}
                  </pre>
                </div>
              )}

              {/* Tab: Headers */}
              {activeTab === 'headers' && (
                <div className="p-2.5 bg-slate-950 font-mono text-[10px] space-y-1 max-h-48 overflow-y-auto">
                  {Object.entries(executionResult.headers).map(([k, v]) => (
                    <div key={k} className="flex justify-between border-b border-slate-900 pb-0.5">
                      <span className="text-slate-400">{k}:</span>
                      <span className="text-slate-200 truncate max-w-[180px]">{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Empty State / Welcome Guide if no active run */}
          {!activeRequest && (
            <div className="p-5 text-center space-y-3 bg-slate-950/40 rounded-2xl border border-slate-800/60">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
                <Mic className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Ready for Developer Commands</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Tap the microphone or type below: <br />
                  <span className="italic text-amber-300">"Test login with an invalid password"</span>
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-2">
                <button
                  onClick={() => {
                    const preset = DEMO_PRESET_SCENARIOS[0];
                    setInputCommand(preset.voicePrompt);
                    executeCommandString(preset.voicePrompt);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-200 hover:bg-slate-700 font-medium"
                >
                  Start Demo Run
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Input Console & Microphone Bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800/90 shrink-0 space-y-2">
          {/* Animated Waveform when listening */}
          {isListening && (
            <div className="flex items-center justify-center gap-1 py-1">
              {[40, 70, 100, 60, 90, 45, 80, 50, 95, 30].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="w-1 bg-amber-400 rounded-full animate-pulse max-h-5"
                />
              ))}
              <span className="text-[10px] font-mono text-amber-400 ml-2 animate-pulse">
                Listening to developer instruction...
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            {/* Microphone Button */}
            <button
              id="phone-mic-btn"
              onClick={toggleVoiceRecording}
              className={`p-2.5 rounded-xl transition shadow-md flex items-center justify-center shrink-0 ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse ring-2 ring-rose-400'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Natural Language Text Box */}
            <div className="relative flex-1">
              <input
                id="phone-command-input"
                type="text"
                value={inputCommand}
                onChange={(e) => setInputCommand(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    executeCommandString(inputCommand);
                  }
                }}
                placeholder="Speak or type API instruction..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-3 pr-8 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                id="phone-send-btn"
                onClick={() => executeCommandString(inputCommand)}
                disabled={!inputCommand.trim()}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-amber-400 disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Android Home Bar Indicator */}
          <div className="flex justify-center pt-1">
            <div className="w-24 h-1 bg-slate-700 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
